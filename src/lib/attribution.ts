/**
 * Origine du visiteur — référencement naturel, publicité payante, réseau
 * social, e-mail, site référent ou accès direct.
 *
 * Capturée une seule fois par `proxy.ts`, au premier atterrissage sur une
 * page de la boutique (premier contact, pas dernier contact avant achat) :
 * paramètres `utm_*`/`gclid` de l'URL et hôte du `Referer`, posés dans un
 * cookie de trente jours — même durée que l'attribution de campagne
 * (`ATTRIBUTION_WINDOW_DAYS`, @/lib/campaigns). Module pur, sans Prisma ni
 * `next/headers` : importable aussi bien depuis le proxy (edge/Node) que
 * depuis les pages d'administration.
 */

export const ATTRIBUTION_COOKIE = "mlc_attribution";
export const ATTRIBUTION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface TrafficAttribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  gclid: string;
  /** Domaine du site d'où vient le clic ; vide pour un accès direct ou interne. */
  referrerHost: string;
}

export const EMPTY_ATTRIBUTION: TrafficAttribution = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  gclid: "",
  referrerHost: "",
};

/** Une valeur de cookie illisible ne doit jamais faire échouer l'appelant. */
export function parseAttributionCookie(raw: string | undefined | null): TrafficAttribution {
  if (!raw) return EMPTY_ATTRIBUTION;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const text = (key: string) => (typeof parsed[key] === "string" ? (parsed[key] as string) : "");
    return {
      utmSource: text("utmSource"),
      utmMedium: text("utmMedium"),
      utmCampaign: text("utmCampaign"),
      gclid: text("gclid"),
      referrerHost: text("referrerHost"),
    };
  } catch {
    return EMPTY_ATTRIBUTION;
  }
}

export interface TrafficChannel {
  label: string;
  detail?: string;
}

const SEARCH_ENGINE_HOSTS = [
  "google.",
  "bing.",
  "yahoo.",
  "duckduckgo.",
  "qwant.",
  "ecosia.",
  "startpage.",
];

/**
 * Classement en catégories lisibles pour le back-office.
 *
 * `gclid` seul ne permet pas de distinguer Search de Shopping — Google pose
 * le même paramètre sur les deux. Le libellé « Google Shopping » n'apparaît
 * donc que si la campagne le précise elle-même (`utm_medium`/`utm_campaign`
 * contenant « shopping ») ; sinon la catégorie reste « Google Ads (payant) »,
 * avec le nom de campagne en détail pour que la boutique les distingue elle-
 * même par sa propre nomenclature de campagne.
 */
export function deriveTrafficChannel(
  input: TrafficAttribution & { campaignName?: string | null },
): TrafficChannel {
  if (input.campaignName) {
    return { label: "E-mail (campagne)", detail: input.campaignName };
  }

  const source = input.utmSource.toLowerCase();
  const medium = input.utmMedium.toLowerCase();
  const campaign = input.utmCampaign;

  if (input.gclid) {
    const isShopping = medium.includes("shopping") || campaign.toLowerCase().includes("shopping");
    return {
      label: isShopping ? "Google Shopping (payant)" : "Google Ads (payant)",
      detail: campaign || undefined,
    };
  }

  if (["cpc", "ppc", "paid", "paidsearch", "sea"].includes(medium)) {
    return { label: "Publicité payante", detail: campaign || source || undefined };
  }
  if (medium === "shopping") {
    return { label: "Shopping (payant)", detail: campaign || undefined };
  }
  if (["social", "paidsocial", "social-media"].includes(medium)) {
    return { label: "Réseaux sociaux", detail: campaign || source || undefined };
  }
  if (medium === "email" || source === "email") {
    return { label: "E-mail", detail: campaign || undefined };
  }
  if (source || medium) {
    return { label: "Autre campagne", detail: [source, medium].filter(Boolean).join(" / ") || undefined };
  }

  const host = input.referrerHost.toLowerCase();
  if (host) {
    if (SEARCH_ENGINE_HOSTS.some((engine) => host.includes(engine))) {
      return { label: "Référencement naturel" };
    }
    return { label: "Site référent", detail: input.referrerHost };
  }

  return { label: "Accès direct" };
}
