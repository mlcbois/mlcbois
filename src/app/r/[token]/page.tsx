/**
 * Reprise d'un panier abandonné.
 *
 * Vit hors du routage multilingue, comme /c, /p et /desinscription : le lien
 * part dans un e-mail déjà envoyé, il doit rester valable tel quel pour
 * toujours. La langue vient du panier enregistré, pas de l'URL.
 *
 * Le panier est restauré côté client (localStorage) puis le visiteur est
 * renvoyé vers /panier, où les prix et le stock sont de toute façon
 * revalidés — un jeton ne redonne jamais accès à autre chose qu'au contenu du
 * panier lui-même.
 */

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/server/prisma";
import { CartRecoveryRedirect } from "@/components/CartRecoveryRedirect";
import type { CartLine } from "@/lib/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reprise du panier",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

function parseItems(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CartLine =>
        !!entry &&
        typeof entry === "object" &&
        typeof (entry as { productId?: unknown }).productId === "string",
    );
  } catch {
    return [];
  }
}

export default async function AbandonedCartRecoveryPage({ params }: { params: Params }) {
  const { token } = await params;

  const cart = await prisma.abandonedCart.findUnique({
    where: { token },
    select: { items: true, locale: true },
  });

  // Jeton inconnu : retour silencieux, comme /c et /desinscription — répondre
  // « ce jeton n'existe pas » permettrait d'en éprouver au hasard.
  if (!cart) redirect("/");

  const items = parseItems(cart.items);
  const destination = `${cart.locale === "en" ? "/en" : ""}/panier`;

  return <CartRecoveryRedirect items={items} destination={destination} />;
}
