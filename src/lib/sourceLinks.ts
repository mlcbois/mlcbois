// src/lib/sourceLinks.ts

/**
 * Source externe citée en fiche produit (registre de certification, fiche
 * réglementaire fabricant…). Stockée en JSON sur `Product.sourceLinks`, sur le
 * même principe que `bullets` : une liste, pas de table à part, le schéma
 * reste portable.
 *
 * Volontairement absent du flux Google Merchant Center (voir
 * `src/server/merchant.ts`) : ce n'est pas une donnée produit au sens de la
 * spécification Google, seulement une citation pour le lecteur humain et les
 * robots d'indexation.
 */
export interface SourceLink {
  label: string;
  url: string;
}

/**
 * N'accepte que des liens externes en clair (http/https) : ce sont des
 * citations de sources tierces (registre officiel, PDF fabricant…), jamais
 * des chemins internes. Une entrée sans libellé ou sans URL valide est
 * ignorée plutôt que de produire un lien cassé ou vide.
 */
function isCitationUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/** Lit le JSON stocké et n'en garde que les entrées valides. */
export function parseSourceLinks(raw: string): SourceLink[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return undefined;
        const label = String((entry as Record<string, unknown>).label ?? "").trim();
        const url = String((entry as Record<string, unknown>).url ?? "").trim();
        if (!label || !isCitationUrl(url)) return undefined;
        return { label, url };
      })
      .filter((entry): entry is SourceLink => entry !== undefined);
  } catch {
    return [];
  }
}

/** Contrôle une entrée saisie côté admin ; rend `undefined` si elle est invalide. */
export function toSourceLink(entry: unknown): SourceLink | undefined {
  if (!entry || typeof entry !== "object") return undefined;
  const label = String((entry as Record<string, unknown>).label ?? "").trim();
  const url = String((entry as Record<string, unknown>).url ?? "").trim();
  if (!label || !isCitationUrl(url)) return undefined;
  return { label, url };
}
