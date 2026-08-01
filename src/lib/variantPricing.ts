// src/lib/variantPricing.ts

/** Vue d'une variation exposée à la boutique et au panier. */
export interface VariantView {
  id: string;
  label: string;
  priceCents: number;
  oldPriceCents?: number;
}

/** Variation transmise au serveur pour enregistrement (create/update). */
export interface VariantInput {
  id?: string;
  label: string;
  labelEn?: string;
  priceCents: number;
  oldPriceCents?: number;
  position?: number;
  active?: boolean;
}

/**
 * Prix « à partir de » : plus petit prix parmi les variations actives.
 * `undefined` si aucune variation active — l'appelant garde alors le prix
 * simple du produit.
 */
export function minActivePriceCents(
  variants: { priceCents: number; active?: boolean }[],
): number | undefined {
  const actifs = variants.filter((v) => v.active !== false).map((v) => v.priceCents);
  return actifs.length > 0 ? Math.min(...actifs) : undefined;
}

/**
 * Clé d'identité d'une ligne de panier. Deux volumes d'un même produit doivent
 * faire deux lignes ; un produit sans variation garde son seul identifiant.
 */
export function cartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}
