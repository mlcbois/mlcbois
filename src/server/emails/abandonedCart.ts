/**
 * Gabarits des trois e-mails de relance de panier abandonné.
 *
 * Mêmes contraintes de mise en page que src/server/emails/order.ts : tableaux
 * et styles en ligne, `color-scheme: light` pour empêcher l'inversion
 * automatique des couleurs, fond déclaré sur chaque cellule.
 *
 * Message commercial, pas transactionnel : le pied de page porte
 * l'identification du fournisseur (§ 5 DDG) et un lien de désinscription,
 * comme src/server/emails/campaign.ts. Le lien d'action passe par
 * /r/<jeton> (src/app/r/[token]/page.tsx), qui restaure le panier avant de
 * renvoyer vers /panier — jamais un lien direct vers une fiche produit, sinon
 * les autres articles du panier seraient perdus.
 *
 * La troisième relance (ton pressant) ne déclare une rareté que lorsqu'elle
 * est réelle (stock au ou sous le seuil d'alerte du produit) : annoncer une
 * pénurie inventée est une pratique commerciale trompeuse au sens de
 * l'article L121-2 du Code de la consommation, quel que soit le ton souhaité.
 */

import { formatCents } from "@/lib/cart";
import type { MailMessage } from "@/lib/mailer";

export type AbandonedCartLocale = "fr" | "en";

export interface AbandonedCartItemBase {
  productId: string;
  variantLabel?: string;
  brand: string;
  name: string;
  image: string;
  path: string;
  priceCents: number;
  quantity: number;
}

/** Réservé à la troisième relance : le stock réel tranche l'annonce de rareté. */
export interface AbandonedCartItem extends AbandonedCartItemBase {
  currentStock: number;
  lowStockThreshold: number;
  stillAvailable: boolean;
}

interface ReminderInput<Item> {
  token: string;
  firstName: string;
  locale: AbandonedCartLocale;
  items: readonly Item[];
}

const LOGO_WIDTH = 220;
// Rapport d'origine du fichier : 747 × 162
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 162) / 747);

/**
 * Identification du fournisseur reprise de src/content/legal/fr.ts (relevé du
 * registre, voir docs/LEGAL.md). Recopiée ici et non importée : ce module ne
 * doit dépendre d'aucun contenu de page — toute modification doit donc être
 * répercutée ici EN MÊME TEMPS que dans les pages légales.
 */
const IMPRESSUM = {
  name: "MLC BOIS",
  street: "27 Grande Rue",
  city: "21700 Villebichot",
  country: "France",
  managingDirector: "Clément Mauroy",
  register: "RCS Dijon 990 527 871",
  vatId: "FR71990527871",
} as const;

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteUrl()}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function recoverUrl(token: string): string {
  return `${siteUrl()}/r/${token}`;
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/desinscription/${token}`;
}

/** « Bonjour Camille, » ou « Bonjour, » quand le prénom n'est pas encore connu. */
function greeting(firstName: string, locale: AbandonedCartLocale): string {
  const name = firstName.trim();
  if (locale === "en") return name ? `Hi ${escapeHtml(name)},` : "Hi,";
  return name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,";
}

// ---- Ossature commune (mêmes styles que order.ts / campaign.ts) ----

interface LayoutInput {
  lang: AbandonedCartLocale;
  preheader: string;
  heading: string;
  headingColor?: string;
  /** Paragraphes d'introduction, déjà échappés par l'appelant. */
  intro: string[];
  itemsHtml: string;
  action: { label: string; url: string };
  /** Bandeau d'avertissement (troisième relance) — fond distinct, au-dessus des articles. */
  noticeHtml?: string;
  optOutUrl: string;
}

function layout(input: LayoutInput): string {
  const logo = `${siteUrl()}/images/logo-full.png`;
  const isEnglish = input.lang === "en";

  const intro = input.intro
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#3f4854;">${paragraph}</p>`,
    )
    .join("\n");

  const identity = [IMPRESSUM.name, IMPRESSUM.street, IMPRESSUM.city, IMPRESSUM.country].join(
    " &middot; ",
  );
  const identityDetail = [
    isEnglish ? `Managing director: ${IMPRESSUM.managingDirector}` : `Président : ${IMPRESSUM.managingDirector}`,
    IMPRESSUM.register,
    isEnglish ? `VAT ID: ${IMPRESSUM.vatId}` : `TVA intracommunautaire : ${IMPRESSUM.vatId}`,
  ].join(" &middot; ");

  const optOutLabel = isEnglish
    ? "No longer want these reminders? Unsubscribe"
    : "Ne plus recevoir ces rappels ? Se désinscrire";

  return `<!doctype html>
<html lang="${input.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(input.heading)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f2f4; color-scheme:light;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(input.preheader)}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f2f4;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:100%; background-color:#ffffff; border:1px solid #e0e2e6; border-radius:6px;">
            <tr>
              <td align="center" style="background-color:#ffffff; padding:32px 24px 24px 24px; border-radius:6px 6px 0 0;">
                <img src="${logo}" alt="MLC Bois — bois de chauffage" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" style="display:block; width:${LOGO_WIDTH}px; height:auto; border:0; outline:none; text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="background-color:${input.headingColor ?? "#ff5c00"}; font-size:0; line-height:0; height:4px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background-color:#ffffff; padding:32px 32px 8px 32px;">
                <h1 style="margin:0 0 16px 0; font-family:Arial,Helvetica,sans-serif; font-size:20px; line-height:28px; font-weight:bold; color:${input.headingColor ?? "#001424"};">${escapeHtml(input.heading)}</h1>
                ${intro}
              </td>
            </tr>
            ${
              input.noticeHtml
                ? `<tr><td style="background-color:#ffffff; padding:0 32px 8px 32px;">${input.noticeHtml}</td></tr>`
                : ""
            }
            <tr>
              <td style="background-color:#ffffff; padding:0 32px;">
                ${input.itemsHtml}
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff; padding:24px 32px 32px 32px; border-radius:0 0 6px 6px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
                  <tr>
                    <td align="center" bgcolor="#c24400" style="background-color:#c24400; border-radius:4px;">
                      <a href="${escapeHtml(input.action.url)}" style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none;">${escapeHtml(input.action.label)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:100%;">
            <tr>
              <td align="center" style="padding:20px 16px 0 16px; font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:18px; color:#6b7280;">
                ${identity}<br />
                ${identityDetail}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 16px 0 16px; font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:18px; color:#9aa1ab;">
                <a href="${escapeHtml(input.optOutUrl)}" style="color:#9aa1ab; text-decoration:underline;">${escapeHtml(optOutLabel)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Une ligne d'article : miniature, nom, quantité, prix — pas de bouton individuel, le panier se rouvre en un seul clic. */
function itemRowHtml(item: AbandonedCartItemBase, locale: AbandonedCartLocale): string {
  const image = absoluteUrl(item.image);
  const name = escapeHtml(`${item.brand} ${item.name}`.trim());
  const variant = item.variantLabel
    ? `<br /><span style="font-size:12px; color:#6b7280;">${escapeHtml(item.variantLabel)}</span>`
    : "";
  const qty = locale === "en" ? `Qty ${item.quantity}` : `Qté ${item.quantity}`;
  const picture = image
    ? `<img src="${escapeHtml(image)}" alt="" width="64" style="display:block; width:64px; height:auto; border:0; outline:none; text-decoration:none; border-radius:4px;" />`
    : "&nbsp;";

  return `<tr>
                <td width="64" valign="top" style="padding:12px 12px 12px 0; border-bottom:1px solid #e0e2e6;">${picture}</td>
                <td valign="top" style="padding:12px 0; border-bottom:1px solid #e0e2e6; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:20px; color:#001424;">
                  ${name}${variant}<br /><span style="font-size:12px; color:#6b7280;">${qty}</span>
                </td>
                <td align="right" valign="top" style="padding:12px 0; border-bottom:1px solid #e0e2e6; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:20px; color:#001424; white-space:nowrap;">${escapeHtml(formatCents(item.priceCents * item.quantity))}</td>
              </tr>`;
}

function itemsTableHtml(items: readonly AbandonedCartItemBase[], locale: AbandonedCartLocale): string {
  const rows = items.map((item) => itemRowHtml(item, locale)).join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;">
                ${rows}
              </table>`;
}

function itemsTextLines(items: readonly AbandonedCartItemBase[]): string[] {
  return items.map(
    (item) =>
      `- ${item.brand} ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity} — ${formatCents(item.priceCents * item.quantity)}`,
  );
}

function footerText(locale: AbandonedCartLocale, optOutUrl: string): string[] {
  const isEnglish = locale === "en";
  return [
    "",
    "---",
    `${IMPRESSUM.name}, ${IMPRESSUM.street}, ${IMPRESSUM.city}, ${IMPRESSUM.country}`,
    isEnglish
      ? `Managing director: ${IMPRESSUM.managingDirector} — ${IMPRESSUM.register} — VAT ID: ${IMPRESSUM.vatId}`
      : `Président : ${IMPRESSUM.managingDirector} — ${IMPRESSUM.register} — TVA intracommunautaire : ${IMPRESSUM.vatId}`,
    "",
    isEnglish
      ? `No longer want these reminders? Unsubscribe: ${optOutUrl}`
      : `Ne plus recevoir ces rappels ? Se désinscrire : ${optOutUrl}`,
  ];
}

// ---- Relance 1 — ton doux, 25 minutes après la dernière activité ----

export function buildAbandonedCartReminder1(
  input: ReminderInput<AbandonedCartItemBase>,
): Omit<MailMessage, "to"> {
  const { token, firstName, locale, items } = input;
  const isEnglish = locale === "en";
  const action = recoverUrl(token);
  const optOutUrl = unsubscribeUrl(token);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const subject = isEnglish
    ? "You left something in your cart"
    : "Vous avez oublié quelque chose dans votre panier";

  const heading = isEnglish ? "Your cart is waiting for you" : "Votre panier vous attend";

  const intro = isEnglish
    ? [
        greeting(firstName, locale),
        `You left ${count > 1 ? `${count} items` : "an item"} in your cart. Nothing has been charged yet — it's all still there, ready whenever you are.`,
      ]
    : [
        greeting(firstName, locale),
        `Vous avez laissé ${count > 1 ? `${count} articles` : "un article"} dans votre panier. Rien n'a été débité — tout est toujours là, prêt dès que vous le souhaitez.`,
      ];

  const ctaLabel = isEnglish ? "Resume my order" : "Reprendre ma commande";

  return {
    subject,
    html: layout({
      lang: locale,
      preheader: subject,
      heading,
      intro,
      itemsHtml: itemsTableHtml(items, locale),
      action: { label: ctaLabel, url: action },
      optOutUrl,
    }),
    text: [
      heading,
      "",
      ...intro.map((p) => p.replace(/<[^>]+>/g, "")),
      "",
      ...itemsTextLines(items),
      "",
      `${ctaLabel}: ${action}`,
      ...footerText(locale, optOutUrl),
    ].join("\n"),
  };
}

// ---- Relance 2 — informative, 9 heures après la relance 1 ----

export function buildAbandonedCartReminder2(
  input: ReminderInput<AbandonedCartItemBase>,
): Omit<MailMessage, "to"> {
  const { token, firstName, locale, items } = input;
  const isEnglish = locale === "en";
  const action = recoverUrl(token);
  const optOutUrl = unsubscribeUrl(token);

  const subject = isEnglish
    ? "Free delivery, and 14 days to change your mind"
    : "Livraison offerte, et 14 jours pour changer d'avis";

  const heading = isEnglish
    ? "A couple of things worth knowing"
    : "Deux ou trois choses à savoir";

  const intro = isEnglish
    ? [
        greeting(firstName, locale),
        "Your cart is still here. Two things that might help you decide:",
      ]
    : [
        greeting(firstName, locale),
        "Votre panier est toujours là. Deux ou trois choses qui peuvent vous aider à décider :",
      ];

  const factsHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0; background-color:#f7f8f9; border:1px solid #d6d9de; border-radius:6px;">
                  <tr>
                    <td style="padding:16px 18px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#3f4854;">
                      ${
                        isEnglish
                          ? "<strong>Free standard delivery</strong> — no minimum order. Prefer it faster? Express delivery (24–48 h) is available for €60."
                          : "<strong>Livraison standard offerte</strong> — sans montant minimum d'achat. Besoin d'aller plus vite ? La livraison express (24 à 48 h) est disponible pour 60 €."
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 16px 18px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#3f4854; border-top:1px solid #e0e2e6; padding-top:14px;">
                      ${
                        isEnglish
                          ? "<strong>14 days to change your mind</strong> — the legal right of withdrawal, no reason needed."
                          : "<strong>14 jours pour changer d'avis</strong> — le droit de rétractation légal, sans avoir à vous justifier."
                      }
                    </td>
                  </tr>
                </table>`;

  const ctaLabel = isEnglish ? "Complete my order" : "Finaliser ma commande";

  return {
    subject,
    html: layout({
      lang: locale,
      preheader: subject,
      heading,
      intro,
      noticeHtml: factsHtml,
      itemsHtml: itemsTableHtml(items, locale),
      action: { label: ctaLabel, url: action },
      optOutUrl,
    }),
    text: [
      heading,
      "",
      ...intro.map((p) => p.replace(/<[^>]+>/g, "")),
      isEnglish
        ? "- Free standard delivery, no minimum order (express: €60, 24-48h)"
        : "- Livraison standard offerte, sans minimum d'achat (express : 60 €, 24-48h)",
      isEnglish
        ? "- 14 days legal right of withdrawal, no reason needed"
        : "- 14 jours de droit de rétractation légal, sans justification",
      "",
      ...itemsTextLines(items),
      "",
      `${ctaLabel}: ${action}`,
      ...footerText(locale, optOutUrl),
    ].join("\n"),
  };
}

// ---- Relance 3 — ton pressant, 9 heures après la relance 2 ----

/** Vrai si au moins un article est réellement proche de la rupture — jamais inventé. */
function hasGenuineLowStock(items: readonly AbandonedCartItem[]): boolean {
  return items.some(
    (item) => item.stillAvailable && item.currentStock > 0 && item.currentStock <= item.lowStockThreshold,
  );
}

function stockLineHtml(item: AbandonedCartItem, locale: AbandonedCartLocale): string {
  const isEnglish = locale === "en";
  if (!item.stillAvailable || item.currentStock <= 0) {
    return isEnglish
      ? `<strong>${escapeHtml(`${item.brand} ${item.name}`)}</strong> is currently unavailable — we can't hold it for you.`
      : `<strong>${escapeHtml(`${item.brand} ${item.name}`)}</strong> n'est actuellement plus disponible — nous ne pouvons plus vous le réserver.`;
  }
  if (item.currentStock <= item.lowStockThreshold) {
    return isEnglish
      ? `Only <strong>${item.currentStock} left</strong> for ${escapeHtml(`${item.brand} ${item.name}`)}.`
      : `Il ne reste plus que <strong>${item.currentStock} en stock</strong> pour ${escapeHtml(`${item.brand} ${item.name}`)}.`;
  }
  return "";
}

export function buildAbandonedCartReminder3(
  input: ReminderInput<AbandonedCartItem>,
): Omit<MailMessage, "to"> {
  const { token, firstName, locale, items } = input;
  const isEnglish = locale === "en";
  const action = recoverUrl(token);
  const optOutUrl = unsubscribeUrl(token);

  const genuineLowStock = hasGenuineLowStock(items);
  const unavailable = items.filter((item) => !item.stillAvailable || item.currentStock <= 0);

  const subject = isEnglish ? "Last call before your cart closes" : "Dernier appel avant la fermeture de votre panier";

  const heading = isEnglish ? "Don't wait too long" : "Ne tardez pas trop";

  // Le fond de l'urgence est toujours vrai : soit un stock réellement bas
  // (le seuil d'alerte du produit fait foi), soit — à défaut — une urgence
  // saisonnière réelle propre au bois de chauffage, jamais une pénurie
  // inventée pour l'ensemble du panier.
  const intro = isEnglish
    ? [
        greeting(firstName, locale),
        genuineLowStock
          ? "This is our last reminder — and this time, stock is genuinely tight on part of your cart:"
          : "This is our last reminder. Demand for firewood and pellets runs high once the season turns, and delivery slots fill up fast — your cart is still reserved, but not for much longer.",
      ]
    : [
        greeting(firstName, locale),
        genuineLowStock
          ? "C'est notre dernier rappel — et cette fois, le stock est réellement limité sur une partie de votre panier :"
          : "C'est notre dernier rappel. La demande de bois de chauffage et de granulés est forte dès que la saison démarre, et les créneaux de livraison se remplissent vite — votre panier reste réservé, mais plus pour très longtemps.",
      ];

  const stockLines = items
    .map((item) => stockLineHtml(item, locale))
    .filter((line) => line.length > 0);

  const noticeHtml =
    stockLines.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0; background-color:#fdf1ec; border:1px solid #f3c7ae; border-radius:6px;">
                  <tr>
                    <td style="padding:14px 18px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#7a2e0e;">
                      ${stockLines.join("<br />")}
                    </td>
                  </tr>
                </table>`
      : undefined;

  const ctaLabel = isEnglish ? "Secure my order now" : "Je valide ma commande maintenant";

  const textUnavailableNote =
    unavailable.length > 0
      ? [
          "",
          isEnglish
            ? "Note: some items in your cart are no longer available and will need to be removed."
            : "Remarque : certains articles de votre panier ne sont plus disponibles et devront être retirés.",
        ]
      : [];

  return {
    subject,
    html: layout({
      lang: locale,
      preheader: subject,
      heading,
      headingColor: "#c24400",
      intro,
      noticeHtml,
      itemsHtml: itemsTableHtml(items, locale),
      action: { label: ctaLabel, url: action },
      optOutUrl,
    }),
    text: [
      heading,
      "",
      ...intro.map((p) => p.replace(/<[^>]+>/g, "")),
      ...stockLines.map((line) => `- ${line.replace(/<[^>]+>/g, "")}`),
      ...textUnavailableNote,
      "",
      ...itemsTextLines(items),
      "",
      `${ctaLabel}: ${action}`,
      ...footerText(locale, optOutUrl),
    ].join("\n"),
  };
}
