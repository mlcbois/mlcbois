import type { ProductContent } from "../../src/lib/productContent";

/**
 * Contenu rédigé produit par produit, indexé par SKU.
 *
 * Chaque GTIN est accompagné en commentaire de la source où il a été relevé :
 * sans source vérifiable, le champ reste absent et le flux bascule
 * automatiquement sur identifier_exists « no ».
 */
export const PRODUCT_CONTENT: ProductContent[] = [];
