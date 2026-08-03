import { isValidGtin } from "./gtin";

/**
 * Contenu rédigé pour un produit, appliqué en base par son slug.
 * On indexe par slug, pas par SKU : `slug` est `@unique` dans le schéma
 * Prisma, alors que le SKU ne l'est pas (il est dérivé par troncature du
 * slug dans `scripts/seed-bois-variations.ts` et peut entrer en collision).
 */
export interface ProductContent {
  slug: string;
  description: string;
  shortDescription: string;
  descriptionEn: string;
  shortDescriptionEn: string;
  /** Écrit seulement si le checksum est valide et la source identifiable. */
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  shippingWeightGrams?: number;
  energyEfficiencyClass?: string;
}

const LONGUEUR_MIN = 400;
const LONGUEUR_MAX = 800;

// Vocabulaire commercial que Google refuse dans une description : il décrit
// l'offre du marchand, pas le produit.
const MOTS_PROMOTIONNELS = [
  "livraison offerte",
  "livraison gratuite",
  "meilleur prix",
  "prix imbattable",
  "promotion",
  "soldes",
  "déstockage",
  "offre spéciale",
  "profitez",
  "commandez",
];

const MOTS_ALLEMANDS = ["Ausstattung", "Zustand", "fabrikneu", "originalverpackt", "Aktion"];

/**
 * Contrôle la conformité du contenu avant écriture. Rend la liste des anomalies,
 * vide si tout est conforme. Ne lève pas : l'appelant décide quoi en faire.
 */
export function validateProductContent(entries: ProductContent[]): string[] {
  const anomalies: string[] = [];
  const vus = new Set<string>();

  for (const entry of entries) {
    const ou = `[${entry.slug}]`;

    if (vus.has(entry.slug)) anomalies.push(`${ou} slug en double`);
    vus.add(entry.slug);

    for (const [champ, texte] of [
      ["description", entry.description],
      ["descriptionEn", entry.descriptionEn],
    ] as const) {
      if (texte.length < LONGUEUR_MIN) {
        anomalies.push(`${ou} ${champ} fait ${texte.length} caractères, minimum ${LONGUEUR_MIN}`);
      }
      if (texte.length > LONGUEUR_MAX) {
        anomalies.push(`${ou} ${champ} fait ${texte.length} caractères, maximum ${LONGUEUR_MAX}`);
      }
      if (/<[a-z/][^>]*>/i.test(texte)) {
        anomalies.push(`${ou} ${champ} contient du HTML`);
      }
      const minuscule = texte.toLowerCase();
      const trouve = MOTS_PROMOTIONNELS.find((mot) => minuscule.includes(mot));
      if (trouve) {
        anomalies.push(`${ou} ${champ} contient le terme promotionnel « ${trouve} »`);
      }
      const allemand = MOTS_ALLEMANDS.find((mot) => new RegExp(`\\b${mot}\\b`).test(texte));
      if (allemand) {
        anomalies.push(`${ou} ${champ} contient le mot allemand « ${allemand} »`);
      }
    }

    if (entry.description.trim() === entry.shortDescription.trim()) {
      anomalies.push(`${ou} description identique à shortDescription`);
    }
    if (entry.descriptionEn.trim() === entry.shortDescriptionEn.trim()) {
      anomalies.push(`${ou} descriptionEn identique à shortDescriptionEn`);
    }

    if (entry.gtin !== undefined && !isValidGtin(entry.gtin)) {
      anomalies.push(`${ou} GTIN « ${entry.gtin} » : checksum invalide`);
    }
  }

  return anomalies;
}
