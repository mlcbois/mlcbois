import { NextResponse } from "next/server";
import { trackAbandonedCart, type TrackedCartItem } from "@/server/abandonedCarts";
import { MAX_CART_LINES } from "@/lib/cart";

/**
 * Capture du panier pour la relance d'abandon.
 *
 * Appelée par le tunnel de commande dès que l'adresse e-mail saisie a une
 * forme valable et que le panier n'est pas vide — voir CheckoutFlow.tsx. Rien
 * ici n'est facturé ni engagé : c'est un instantané, revalidé de toute façon
 * avant paiement par /api/cart et par createOrder.
 *
 * Volontairement permissive sur la forme des lignes (contrairement à
 * /api/checkout) : une erreur ici ne doit jamais empêcher le client de
 * continuer sa commande, juste échouer silencieusement côté relance.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readItems(value: unknown): TrackedCartItem[] {
  if (!Array.isArray(value)) return [];

  const items: TrackedCartItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const raw = entry as Record<string, unknown>;
    const productId = text(raw.productId, 40);
    const priceCents = typeof raw.priceCents === "number" ? Math.round(raw.priceCents) : NaN;
    const quantity = typeof raw.quantity === "number" ? Math.floor(raw.quantity) : NaN;
    if (!productId || !Number.isFinite(priceCents) || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    items.push({
      productId,
      variantId: raw.variantId ? text(raw.variantId, 40) : undefined,
      variantLabel: raw.variantLabel ? text(raw.variantLabel, 160) : undefined,
      slug: text(raw.slug, 200),
      brand: text(raw.brand, 120),
      name: text(raw.name, 200),
      image: text(raw.image, 500),
      path: text(raw.path, 300),
      priceCents: Math.max(0, priceCents),
      quantity: Math.max(1, quantity),
    });

    if (items.length >= MAX_CART_LINES) break;
  }
  return items;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ ok: false }, { status: 200 });

  const email = text(payload.email, 160);
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ ok: false }, { status: 200 });

  const items = readItems(payload.items);
  if (items.length === 0) return NextResponse.json({ ok: false }, { status: 200 });

  const locale = payload.locale === "en" ? "en" : "fr";
  const firstName = text(payload.firstName, 80);

  try {
    await trackAbandonedCart({ email, firstName, locale, items });
  } catch (error) {
    // Un instantané raté ne doit jamais remonter au client : le tunnel de
    // commande continue normalement, seule la relance est perdue.
    console.error("[abandoned-cart] suivi impossible :", error);
  }

  return NextResponse.json({ ok: true });
}
