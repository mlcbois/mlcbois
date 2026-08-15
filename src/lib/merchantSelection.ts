/**
 * Liste blanche de produits diffusés dans le flux Google Merchant Center.
 *
 * Logique pure, sans accès base : testable isolément, importée à la fois par
 * la lecture/écriture en base (`@/server/merchantSelection`) et par les routes
 * de flux qui filtrent la liste des produits juste avant de construire le
 * document XML/TSV.
 */

export interface MerchantSelection {
  /** false = tout le catalogue actif part dans le flux, includedProductIds est ignoré. */
  restricted: boolean;
  /** Liste blanche, utilisée seulement si restricted = true. */
  includedProductIds: string[];
}

/** Repli par défaut : tout le catalogue. Jamais un flux vide par défaut. */
export const DEFAULT_MERCHANT_SELECTION: MerchantSelection = {
  restricted: false,
  includedProductIds: [],
};

export function isInFeed(product: { id: string }, selection: MerchantSelection): boolean {
  if (!selection.restricted) return true;
  return selection.includedProductIds.includes(product.id);
}

export function filterForFeed<T extends { id: string }>(
  products: T[],
  selection: MerchantSelection,
): T[] {
  if (!selection.restricted) return products;
  return products.filter((product) => isInFeed(product, selection));
}

/**
 * Reconstruit une sélection valide depuis une valeur quelconque (JSON relu en
 * base, corps de requête). Toute forme inattendue retombe sur le catalogue
 * entier — jamais sur une restriction vide qui viderait silencieusement le
 * flux.
 */
export function coerceMerchantSelection(value: unknown): MerchantSelection {
  if (!value || typeof value !== "object") return DEFAULT_MERCHANT_SELECTION;

  const raw = value as Record<string, unknown>;
  const restricted = raw.restricted === true;
  const includedProductIds = Array.isArray(raw.includedProductIds)
    ? raw.includedProductIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  return { restricted, includedProductIds };
}
