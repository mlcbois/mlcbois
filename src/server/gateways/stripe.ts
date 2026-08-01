/**
 * Adaptateur Stripe — le seul réellement implémenté aujourd'hui.
 *
 * Encaissement par Stripe Checkout (page de paiement hébergée par Stripe) :
 * aucune donnée de carte ne transite par ce serveur, donc pas de contrainte PCI
 * lourde. La vérité du paiement vient du webhook signé, jamais de la redirection
 * de retour — un client peut fermer l'onglet avant que Stripe ne nous rappelle.
 *
 * Deux secrets, saisis en administration et stockés chiffrés :
 *   - stripe_secret_key      (sk_live_… / sk_test_…)
 *   - stripe_webhook_secret  (whsec_…), pour valider la signature des webhooks.
 */

import Stripe from "stripe";
import { getIntegrationSecret } from "@/server/integrations";
import type {
  GatewayCheckoutSession,
  GatewayOrderContext,
  GatewayWebhookResult,
  PaymentGateway,
} from "./types";

const SECRET_KEY = "stripe_secret_key";
const WEBHOOK_SECRET = "stripe_webhook_secret";

async function client(): Promise<Stripe | null> {
  const key = await getIntegrationSecret(SECRET_KEY);
  if (!key) return null;
  return new Stripe(key);
}

/** Extrait le numéro de commande d'une session Checkout, où qu'il soit rangé. */
function orderNumberOf(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? session.metadata?.orderNumber ?? null;
}

function paymentIntentOf(session: Stripe.Checkout.Session): string | undefined {
  return typeof session.payment_intent === "string" ? session.payment_intent : undefined;
}

export const stripeGateway: PaymentGateway = {
  meta: {
    id: "stripe",
    label: "Stripe",
    availability: "Recommandé — CB, Apple Pay, Google Pay. Excellent support France.",
    implemented: true,
    keys: [
      {
        integrationKey: SECRET_KEY,
        label: "Clé secrète",
        hint: "sk_live_… (ou sk_test_… pour les essais). Tableau de bord Stripe → Développeurs → Clés API.",
      },
      {
        integrationKey: WEBHOOK_SECRET,
        label: "Secret du webhook",
        hint: "whsec_… Créé en ajoutant l'endpoint /api/payments/webhook/stripe dans Stripe → Développeurs → Webhooks.",
      },
    ],
  },

  async isConfigured(): Promise<boolean> {
    const [secret, webhook] = await Promise.all([
      getIntegrationSecret(SECRET_KEY),
      getIntegrationSecret(WEBHOOK_SECRET),
    ]);
    return Boolean(secret && webhook);
  },

  async createCheckoutSession(order: GatewayOrderContext): Promise<GatewayCheckoutSession> {
    const stripe = await client();
    if (!stripe) throw new Error("Stripe n'est pas configuré (clé secrète absente).");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: order.locale === "en" ? "en" : "fr",
      customer_email: order.email,
      // Rattache la session à la commande des deux façons : le webhook lira l'une
      // ou l'autre selon le type d'événement.
      client_reference_id: order.orderNumber,
      metadata: { orderNumber: order.orderNumber },
      payment_intent_data: { metadata: { orderNumber: order.orderNumber } },
      // Une seule ligne au montant TTC déjà calculé côté serveur : Stripe ne
      // refait pas les totaux, il encaisse le montant que la boutique facture.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: order.amountCents,
            product_data: { name: order.description },
          },
        },
      ],
      success_url: order.successUrl,
      cancel_url: order.cancelUrl,
    });

    if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
    return { redirectUrl: session.url, reference: session.id };
  },

  async handleWebhook(request: Request): Promise<GatewayWebhookResult> {
    const [stripe, webhookSecret] = await Promise.all([
      client(),
      getIntegrationSecret(WEBHOOK_SECRET),
    ]);
    if (!stripe || !webhookSecret) throw new Error("Stripe n'est pas configuré.");

    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new Error("Signature Stripe absente.");

    // Corps brut obligatoire : la signature porte sur les octets exacts reçus.
    const payload = await request.text();
    const event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          orderNumber: orderNumberOf(session),
          paymentStatus: session.payment_status === "paid" ? "bezahlt" : null,
          reference: paymentIntentOf(session),
        };
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return { orderNumber: orderNumberOf(session), paymentStatus: "fehlgeschlagen" };
      }
      default:
        // Événement non pertinent pour l'état de paiement : accusé de réception
        // sans effet (voir la route webhook).
        return { orderNumber: null, paymentStatus: null };
    }
  },
};
