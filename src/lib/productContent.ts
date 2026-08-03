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
// l'offre du marchand, pas le produit. `src/server/merchant.ts` (ligne ~336)
// retombe sur `shortDescription` quand `description` est absente : le champ
// court est une source du flux au même titre, donc soumis au même contrôle.
const MOTS_PROMOTIONNELS = [
  // Français
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
  // Anglais — mêmes formules commerciales, pour la version /en du site.
  "free delivery",
  "free shipping",
  "best price",
  "lowest price",
  "special offer",
  "order now",
  "buy now",
  "sale",
  "discount",
  "limited time",
];

// Reprend la liste utilisée par `src/server/merchant.test.ts` : les deux
// contrôles doivent traquer le même vocabulaire allemand résiduel.
const MOTS_ALLEMANDS = [
  "von",
  "Ausstattung",
  "Zustand",
  "fabrikneu",
  "originalverpackt",
  "Aktion",
  "Beschreibung",
  "Zeichen",
  "Klassifizierung",
  "Versand",
  "Energielabel",
  "Pflichtfelder",
  "Preis",
];

/**
 * Contrôle commun HTML / vocabulaire promotionnel / mots allemands, partagé
 * entre les champs longs et les champs courts.
 *
 * `mot` est cherché par mot entier (`\b...\b`), pas par sous-chaîne : un
 * terme anglais comme « sale » ne doit pas se déclencher sur « wholesale »,
 * un scénario réel avec la liste anglaise ajoutée ci-dessus. La casse est
 * ignorée (drapeau `i`) pour les deux listes : le vocabulaire allemand doit
 * être détecté aussi bien en début de phrase (« Ausstattung ») qu'ailleurs
 * (« ausstattung »), exactement comme le fait déjà le contrôle promotionnel.
 */
function controleContenu(ou: string, champ: string, texte: string, anomalies: string[]): void {
  if (/<[a-z/][^>]*>/i.test(texte)) {
    anomalies.push(`${ou} ${champ} contient du HTML`);
  }
  const promo = MOTS_PROMOTIONNELS.find((mot) => new RegExp(`\\b${mot}\\b`, "i").test(texte));
  if (promo) {
    anomalies.push(`${ou} ${champ} contient le terme promotionnel « ${promo} »`);
  }
  const allemand = MOTS_ALLEMANDS.find((mot) => new RegExp(`\\b${mot}\\b`, "i").test(texte));
  if (allemand) {
    anomalies.push(`${ou} ${champ} contient le mot allemand « ${allemand} »`);
  }
}

/**
 * Contrôle la conformité du contenu avant écriture. Rend la liste des anomalies,
 * vide si tout est conforme. Ne lève pas : l'appelant décide quoi en faire.
 */
export function validateProductContent(entries: ProductContent[]): string[] {
  const anomalies: string[] = [];
  const vus = new Set<string>();
  const gtinsVus = new Set<string>();
  const mpnsVus = new Set<string>();

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
      controleContenu(ou, champ, texte, anomalies);
    }

    // Champs courts : pas de fourchette 400-800 (ils visent ~140 caractères),
    // mais soumis aux mêmes contrôles HTML / promotionnel / allemand, plus une
    // vérification de non-vacuité — une valeur vide y passait jusqu'ici sans
    // anomalie alors que `merchant.ts` peut s'en servir en repli.
    for (const [champ, texte] of [
      ["shortDescription", entry.shortDescription],
      ["shortDescriptionEn", entry.shortDescriptionEn],
    ] as const) {
      if (!texte.trim()) {
        anomalies.push(`${ou} ${champ} est vide`);
      }
      controleContenu(ou, champ, texte, anomalies);
    }

    if (entry.description.trim() === entry.shortDescription.trim()) {
      anomalies.push(`${ou} description identique à shortDescription`);
    }
    if (entry.descriptionEn.trim() === entry.shortDescriptionEn.trim()) {
      anomalies.push(`${ou} descriptionEn identique à shortDescriptionEn`);
    }

    if (entry.gtin !== undefined) {
      if (!isValidGtin(entry.gtin)) {
        anomalies.push(`${ou} GTIN « ${entry.gtin} » : checksum invalide`);
      } else if (gtinsVus.has(entry.gtin)) {
        anomalies.push(`${ou} GTIN « ${entry.gtin} » en double`);
      }
      gtinsVus.add(entry.gtin);
    }

    if (entry.mpn !== undefined && entry.mpn.trim()) {
      if (mpnsVus.has(entry.mpn)) {
        anomalies.push(`${ou} MPN « ${entry.mpn} » en double`);
      }
      mpnsVus.add(entry.mpn);
    }
  }

  return anomalies;
}
