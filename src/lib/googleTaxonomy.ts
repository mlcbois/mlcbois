// Correspondance entre les catégories de la boutique et la taxonomie officielle
// Google (version 2021-09-21, fichier taxonomy-with-ids.de-DE.txt).
//
// Ce module ne dépend ni de Prisma ni du serveur : il est utilisable aussi bien
// dans le flux produits que dans les composants du back-office.

export interface GoogleCategory {
  /** Identifiant numérique — recommandé par Google, indépendant de la langue. */
  id: string;
  /** Chemin complet traduit, pour l'affichage dans le back-office. */
  path: string;
}

export const GOOGLE_CATEGORY_BY_SLUG: Record<string, GoogleCategory> = {
  // Les cinq rayons de combustible partagent la même feuille de taxonomie :
  // Google ne distingue ni l'essence ni le conditionnement, seulement l'usage.
  vrac: {
    id: "625",
    path: "Maison et jardin > Accessoires pour cheminées et poêles à bois > Combustible et bois de chauffage",
  },
  palette: {
    id: "625",
    path: "Maison et jardin > Accessoires pour cheminées et poêles à bois > Combustible et bois de chauffage",
  },
  granules: {
    id: "625",
    path: "Maison et jardin > Accessoires pour cheminées et poêles à bois > Combustible et bois de chauffage",
  },
  "bois-compresse": {
    id: "625",
    path: "Maison et jardin > Accessoires pour cheminées et poêles à bois > Combustible et bois de chauffage",
  },
  // « poele-a-bois » n'a volontairement pas d'entrée : un poêle n'est pas un
  // combustible, et le déclarer sous 625 ferait refuser la fiche par Merchant
  // Center. À renseigner avec la bonne feuille de taxonomie le jour où des
  // appareils entrent au catalogue.
};

/** Retrouve le chemin lisible d'un identifiant de catégorie Google. */
export function googleCategoryPath(id: string): string | undefined {
  return Object.values(GOOGLE_CATEGORY_BY_SLUG).find((entry) => entry.id === id)?.path;
}

/**
 * Catégories d'habillement, où Google exige age_group, gender, color et size
 * pour la France. Aucune sur ce catalogue de bois de chauffage — l'ensemble
 * reste vide plutôt que supprimé, `merchant.ts` s'appuyant dessus.
 */
export const APPAREL_CATEGORY_IDS = new Set<string>();

/**
 * Catégories soumises à l'étiquette énergie européenne. Depuis avril 2025,
 * l'attribut energy_efficiency_class ne vaut plus que pour CH/NO/UK ; dans l'UE,
 * Google attend l'attribut certification (EC / EPREL / numéro d'enregistrement).
 */
export const EU_ENERGY_LABEL_SLUGS = new Set([
  // Poêles à bois : appareils de chauffage à combustible solide, soumis à
  // l'étiquetage énergétique européen depuis le règlement délégué (UE)
  // 2015/1186 — chaque fiche Deville de ce catalogue porte d'ailleurs déjà
  // une classe et un indice d'efficacité énergétique mesurés officiellement.
  "poele-a-bois",
]);
