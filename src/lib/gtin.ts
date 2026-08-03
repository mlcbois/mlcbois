// Longueurs admises par Google : EAN-8, UPC-A, EAN-13 et GTIN-14.
const LONGUEURS_ADMISES = new Set([8, 12, 13, 14]);

/**
 * Vérifie la clé de contrôle d'un GTIN.
 *
 * Un code dont le checksum est faux est nécessairement erroné. Le refuser ici
 * évite qu'il ne parte dans le flux : chez Google, un identifiant faux n'entraîne
 * pas le simple refus du produit mais expose à la suspension du compte.
 */
export function isValidGtin(value: string): boolean {
  const code = value.trim();
  if (!/^\d+$/.test(code)) return false;
  if (!LONGUEURS_ADMISES.has(code.length)) return false;

  const chiffres = [...code].map(Number);
  const controle = chiffres.pop();
  if (controle === undefined) return false;

  // Pondération alternée 3 puis 1, en partant du chiffre le plus à droite du corps.
  let somme = 0;
  let poids = 3;
  for (let i = chiffres.length - 1; i >= 0; i--) {
    somme += chiffres[i] * poids;
    poids = poids === 3 ? 1 : 3;
  }

  return (10 - (somme % 10)) % 10 === controle;
}
