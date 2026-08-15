// Pays proposés dans les formulaires d'adresse.
//
// Seuls les codes ISO 3166-1 alpha-2 sont figés ici. Les libellés affichés sont
// produits par `Intl.DisplayNames`, donc traduits automatiquement dans la langue
// de la boutique : il n'y a aucune table de noms de pays à tenir à jour, et
// ajouter une langue au site suffit à traduire la liste entière.

/**
 * Codes ISO 3166-1 alpha-2 des pays réellement livrés.
 *
 * La boutique livre elle-même la France métropolitaine à sa remorque, et fait
 * appel à un transporteur pour certaines villes de Belgique — voir la page
 * « Livraison » et les CGV. Proposer d'autres pays dans le sélecteur reviendrait
 * à laisser une commande partir vers une destination qu'aucun des deux circuits
 * ne dessert.
 */
export const COUNTRY_CODES = ["BE", "FR"] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

/** Vrai lorsque la chaîne correspond à un code pays proposé par la boutique. */
export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}

export interface CountryOption {
  /** Code ISO 3166-1 alpha-2, seule valeur transmise au serveur. */
  value: string;
  /** Nom du pays dans la langue affichée. */
  label: string;
}

/**
 * Nom du pays dans la langue demandée. `Intl.DisplayNames` lève sur une locale
 * mal formée et renvoie undefined sur un code qu'il ne connaît pas : dans les
 * deux cas on retombe sur le code, qui reste compréhensible.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Format du code postal, par pays. Les codes sont comparés en majuscules — le
 * serveur normalise avant de valider.
 */
const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  FR: /^\d{5}$/,
  BE: /^\d{4}$/,
};

/** Vrai lorsque le code postal convient au pays, ou qu'aucune règle n'est connue. */
export function isValidPostalCode(country: string, postalCode: string): boolean {
  const pattern = POSTAL_CODE_PATTERNS[country.toUpperCase()];
  return pattern ? pattern.test(postalCode.toUpperCase()) : postalCode.length > 0;
}

/**
 * Liste complète, triée selon les règles alphabétiques de la langue affichée —
 * « Éthiopie » se classe entre « Estonie » et « Fidji » en français, et non en
 * fin de liste comme le ferait un tri sur les octets.
 */
export function countryOptions(locale: string): CountryOption[] {
  const display = COUNTRY_CODES.map((value) => ({ value, label: countryName(value, locale) }));

  try {
    const collator = new Intl.Collator(locale);
    return display.sort((a, b) => collator.compare(a.label, b.label));
  } catch {
    return display.sort((a, b) => a.label.localeCompare(b.label));
  }
}

/**
 * Pays présélectionné dans les formulaires d'adresse.
 *
 * La boutique livre la France métropolitaine et s'adresse à une clientèle
 * française : c'est donc « FR » qui doit être proposé d'emblée. La valeur était
 * restée à « DE », héritage du site allemand dont ce projet est parti, ce qui
 * obligeait chaque client à corriger le champ avant de commander.
 *
 * Définie ici plutôt que recopiée dans chaque formulaire : le tunnel de
 * commande, l'espace client et la validation côté serveur doivent s'accorder
 * sur la même valeur.
 */
export const DEFAULT_COUNTRY = "FR";
