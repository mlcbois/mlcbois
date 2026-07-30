import { after, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createOrder, OrderError, parseCheckoutPayload } from "@/server/orders";
import type { CheckoutErrorCode } from "@/server/orders";
import { getCurrentCustomer } from "@/server/customerSession";
import { resolveCampaignContext } from "@/server/campaignContext";
import { sendOrderEmails } from "@/server/orderNotifications";

// Point d'entrée public du tunnel de commande.
//
// Rien de ce que le navigateur envoie n'est repris tel quel en dehors des
// coordonnées : les identifiants de produit servent à relire les prix et le
// stock en base, les montants sont recalculés côté serveur, et le moyen de
// paiement doit figurer parmi ceux activés dans le back-office.
//
// La route reste ouverte aux visiteurs sans compte : commander en tant
// qu'invité est la règle, pas une tolérance. Si un cookie de session client
// valide accompagne la requête, la commande est simplement rattachée au compte
// correspondant.

/** Messages neutres, doublés en français et en anglais : le client affiche sa propre traduction à partir du code. */
const MESSAGES: Record<CheckoutErrorCode, { fr: string; en: string }> = {
  invalid_payload: {
    fr: "La commande n'a pas pu être lue.",
    en: "The order could not be read.",
  },
  cart_empty: { fr: "Votre panier est vide.", en: "Your cart is empty." },
  cart_too_large: {
    fr: "Votre panier contient trop d'articles différents.",
    en: "Your cart contains too many different items.",
  },
  invalid_quantity: {
    fr: "Merci de choisir une quantité entre 1 et 20 par article.",
    en: "Please choose a quantity between 1 and 20 per item.",
  },
  invalid_email: {
    fr: "Merci d'indiquer une adresse e-mail valide.",
    en: "Please enter a valid email address.",
  },
  invalid_name: {
    fr: "Merci d'indiquer vos nom et prénom.",
    en: "Please enter a first and last name.",
  },
  invalid_street: {
    fr: "Merci d'indiquer le numéro et le nom de la rue.",
    en: "Please enter a street and house number.",
  },
  invalid_postal_code: {
    fr: "Merci d'indiquer un code postal valide.",
    en: "Please enter a valid postcode.",
  },
  invalid_city: { fr: "Merci d'indiquer une ville.", en: "Please enter a city." },
  unsupported_country: {
    fr: "Nous livrons actuellement uniquement en France métropolitaine.",
    en: "We currently deliver within mainland France only.",
  },
  invalid_phone: {
    fr: "Merci d'indiquer un numéro de téléphone valide.",
    en: "Please enter a valid phone number.",
  },
  invalid_payment_method: {
    fr: "Merci de choisir un moyen de paiement disponible.",
    en: "Please choose an available payment method.",
  },
  invalid_shipping_method: {
    fr: "Merci de choisir un mode de livraison disponible.",
    en: "Please choose an available shipping method.",
  },
  terms_required: {
    fr: "Merci d'accepter les conditions générales de vente.",
    en: "Please accept the terms.",
  },
  withdrawal_required: {
    fr: "Merci de confirmer les informations sur le droit de rétractation.",
    en: "Please confirm the withdrawal policy.",
  },
  product_unavailable: {
    fr: "Un article de votre panier n'est plus disponible.",
    en: "An item in your cart is no longer available.",
  },
  insufficient_stock: {
    fr: "La quantité demandée n'est plus disponible.",
    en: "The requested quantity is no longer in stock.",
  },
  order_failed: {
    fr: "La commande n'a pas pu être finalisée.",
    en: "The order could not be completed.",
  },
};

function errorResponse(code: CheckoutErrorCode, status: number, detail?: unknown) {
  const message = MESSAGES[code];
  return NextResponse.json(
    {
      code,
      // « error » reste rempli pour les appels bruts (curl, intégrations)
      error: `${message.fr} / ${message.en}`,
      messages: message,
      ...(detail ? { detail } : {}),
    },
    { status },
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const { input, errors } = parseCheckoutPayload(payload);

  if (!input) {
    return errorResponse(errors[0] ?? "invalid_payload", 400);
  }

  // Rattachement au compte : lu dans le cookie signé, jamais dans la charge
  // utile. Un visiteur sans compte, ou dont la session a expiré, passe commande
  // comme avant.
  const customer = await getCurrentCustomer();

  // Rattachement à la campagne qui a amené le visiteur, lu dans son cookie et
  // revalidé en base. C'est le seul endroit où l'attribution se décide : le
  // navigateur n'envoie qu'un jeton, jamais un montant ni un droit.
  const campaign = await resolveCampaignContext();

  try {
    const order = await createOrder(
      input,
      customer?.id,
      campaign ? { campaignId: campaign.campaignId, recipientId: campaign.recipientId } : undefined,
    );

    // Confirmation au client, notification au vendeur.
    //
    // Différé avec `after` : la commande est déjà écrite et le stock déjà
    // décompté, le client n'a aucune raison de patienter le temps d'une poignée
    // de main SMTP. Next exécute le rappel une fois la réponse envoyée, et le
    // fait même si la requête s'est mal terminée.
    //
    // `sendOrderEmails` ne lève jamais : une boîte injoignable laisse une trace
    // dans les journaux et dans l'historique de la commande, jamais une erreur
    // 500 sur une commande valable.
    after(() => sendOrderEmails(order));

    // Les stocks affichés dans la boutique ont changé.
    revalidatePath("/", "layout");

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        // Chemin à suivre après la commande ; le jeton évite qu'un numéro
        // deviné donne accès à l'adresse du client.
        confirmationPath: `/confirmation/${order.orderNumber}?token=${order.accessToken}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalCents: order.totalCents,
        currency: order.currency,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderError) {
      const status = error.code === "order_failed" ? 500 : 409;
      return errorResponse(error.code, status, error.detail);
    }
    // Panne inattendue : la trace reste côté serveur, le client ne reçoit
    // qu'un message générique.
    console.error("[checkout] Bestellung fehlgeschlagen:", error);
    return errorResponse("order_failed", 500);
  }
}
