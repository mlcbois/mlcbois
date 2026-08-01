import { NextResponse } from "next/server";
import { getGateway, isGatewayId } from "@/server/gateways";
import { getOrderByNumber, setOrderGatewayReference, updatePaymentStatus } from "@/server/orders";

// Point d'entrée des notifications de paiement (webhooks).
//
// Un endpoint par prestataire : /api/payments/webhook/stripe, …/mollie, etc.
// C'est ici, et nulle part ailleurs, que l'état de paiement d'une commande
// bascule automatiquement — la redirection de retour du client, elle, ne prouve
// rien (il peut fermer l'onglet). L'adaptateur valide la signature ; sans elle,
// on répond 400 et le prestataire réessaiera.
//
// Runtime Node : la vérification de signature lit le corps brut de la requête.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ provider: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { provider } = await params;
  if (!isGatewayId(provider)) {
    return NextResponse.json({ error: "Prestataire inconnu." }, { status: 404 });
  }

  const gateway = getGateway(provider);

  let result;
  try {
    result = await gateway.handleWebhook(request);
  } catch (error) {
    // Signature invalide ou prestataire non configuré : trace serveur, réponse
    // 400 neutre. Le prestataire rejouera l'événement.
    console.error(`[webhook:${provider}]`, error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  // Événement sans effet sur le paiement (ex. un type qu'on n'exploite pas) :
  // on accuse réception pour que le prestataire ne le rejoue pas indéfiniment.
  if (!result.orderNumber || !result.paymentStatus) {
    return NextResponse.json({ received: true });
  }

  const order = await getOrderByNumber(result.orderNumber);
  if (!order) {
    // Commande introuvable : on accuse quand même réception, un rejeu ne
    // changerait rien.
    return NextResponse.json({ received: true });
  }

  if (result.reference) {
    await setOrderGatewayReference(order.id, result.reference);
  }

  // Idempotence : ne repasser le statut que s'il change réellement. Un webhook
  // rejoué sur une commande déjà « payée » ne crée pas d'événement en double.
  if (order.paymentStatus !== result.paymentStatus) {
    await updatePaymentStatus(
      order.id,
      result.paymentStatus,
      `webhook:${provider}`,
      result.reference ? `Réf. prestataire : ${result.reference}` : undefined,
    );
  }

  return NextResponse.json({ received: true });
}
