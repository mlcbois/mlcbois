/**
 * Coupe un texte pour un extrait de moteur de recherche.
 *
 * Google tronque l'affichage aux alentours de 155-160 caractères : au-delà,
 * la description saisie n'a plus d'effet sur ce qui s'affiche réellement dans
 * les résultats, et une coupe en plein mot ou juste avant la ponctuation finale
 * a l'air d'un bug plutôt que d'un choix éditorial.
 */
const MAX_LENGTH = 155;

export function truncateForMeta(text: string, maxLength: number = MAX_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const atWordBoundary = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${atWordBoundary.replace(/[\s.,;:!?…-]+$/, "")}…`;
}
