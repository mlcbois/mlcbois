/**
 * Facture PDF jointe à la confirmation de commande.
 *
 * Mentions reprises : nom et adresse complets du vendeur et de l'acheteur,
 * date d'émission et numéro de facture unique, quantité et désignation de
 * chaque article, date de livraison ou mention qu'elle suivra, et le total.
 *
 * La TVA a été retirée du système : la facture ne présente ni taux ni montant
 * de taxe, seulement les prix réglés.
 *
 * pdf-lib n'embarque que les polices WinAnsi : tout caractère hors de ce jeu
 * doit être translittéré avant écriture, sinon la génération échoue.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { COMPANY } from "@/content/legal";
import type { OrderAddress, OrderRecord } from "@/server/orders";

const MARGE = 50;
const LARGEUR = 595.28; // A4 en points
const HAUTEUR = 841.89;

const NOIR = rgb(0.1, 0.1, 0.1);
const GRIS = rgb(0.45, 0.45, 0.45);
const TRAIT = rgb(0.85, 0.85, 0.85);
const ROUGE = rgb(0.83, 0.11, 0.13);

/**
 * Ramène le texte au jeu WinAnsi accepté par les polices standard.
 * Les tirets longs et guillemets typographiques viennent des libellés produits
 * rédigés pour le site ; sans cette conversion, pdf-lib refuse la ligne.
 */
function winAnsi(valeur: string): string {
  return (valeur ?? "")
    .replace(/[—–]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[^\x20-\x7E -ÿ]/g, "");
}

/** « 129900 » -> « 1 299,00 EUR », au format français. */
function euros(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
}

function dateFrancaise(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function lignesAdresse(adresse: OrderAddress): string[] {
  const nom = [adresse.salutation, adresse.firstName, adresse.lastName].filter(Boolean).join(" ");
  return [
    adresse.company,
    nom,
    adresse.street,
    `${adresse.postalCode} ${adresse.city}`.trim(),
    adresse.country === "FR" ? "France" : adresse.country,
  ].filter((ligne) => ligne && ligne.trim().length > 0);
}

interface Plume {
  page: PDFPage;
  y: number;
}

function ecrire(
  plume: Plume,
  texte: string,
  options: { x?: number; taille?: number; police: PDFFont; couleur?: typeof NOIR; alignerDroite?: boolean },
): void {
  const taille = options.taille ?? 9;
  const contenu = winAnsi(texte);
  const x = options.alignerDroite
    ? LARGEUR - MARGE - options.police.widthOfTextAtSize(contenu, taille)
    : (options.x ?? MARGE);
  plume.page.drawText(contenu, { x, y: plume.y, size: taille, font: options.police, color: options.couleur ?? NOIR });
}

/**
 * Compose la facture d'une commande et renvoie le PDF prêt à être joint.
 * Le numéro de facture reprend celui de la commande : il est déjà séquentiel,
 * chronologique et sans rupture, ce qu'exige l'article 242 nonies A.
 */
export async function buildInvoicePdf(order: OrderRecord): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([LARGEUR, HAUTEUR]);
  const normale = await doc.embedFont(StandardFonts.Helvetica);
  const grasse = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(`Facture ${order.orderNumber}`);
  doc.setProducer(COMPANY.name);
  doc.setCreationDate(new Date(order.createdAt));

  const plume: Plume = { page, y: HAUTEUR - MARGE };

  // ---- En-tête ----
  ecrire(plume, COMPANY.name, { police: grasse, taille: 16, couleur: ROUGE });
  plume.y -= 16;
  ecrire(plume, `${COMPANY.street} · ${COMPANY.city}`, { police: normale, taille: 8, couleur: GRIS });
  plume.y -= 11;
  ecrire(plume, `${COMPANY.email} · ${COMPANY.phone}`, { police: normale, taille: 8, couleur: GRIS });

  // ---- Coordonnées de facturation ----
  plume.y -= 36;
  ecrire(plume, "Adresse de facturation", { police: grasse, taille: 8, couleur: GRIS });
  plume.y -= 14;
  for (const ligne of lignesAdresse(order.billing)) {
    ecrire(plume, ligne, { police: normale, taille: 10 });
    plume.y -= 13;
  }

  // ---- Références, alignées à droite du bloc précédent ----
  let yReference = HAUTEUR - MARGE - 88;
  const reference = (etiquette: string, valeur: string) => {
    page.drawText(winAnsi(etiquette), { x: 330, y: yReference, size: 9, font: normale, color: GRIS });
    page.drawText(winAnsi(valeur), { x: 430, y: yReference, size: 9, font: grasse, color: NOIR });
    yReference -= 14;
  };
  reference("Numero de facture", order.orderNumber);
  reference("Date de facture", dateFrancaise(order.createdAt));
  reference("Moyen de paiement", order.paymentMethodLabel);
  reference("Numero client", order.email.split("@")[0].slice(0, 18));

  plume.y = Math.min(plume.y, yReference) - 24;

  // ---- Titre ----
  ecrire(plume, `Facture ${order.orderNumber}`, { police: grasse, taille: 15 });
  plume.y -= 26;

  // ---- Tableau des articles ----
  const COL_DESIGNATION = MARGE;
  const COL_QUANTITE = 330;
  const COL_UNITAIRE = 390;
  const COL_TOTAL = LARGEUR - MARGE;

  const enTete = (etiquette: string, x: number, droite = false) => {
    const largeur = droite ? grasse.widthOfTextAtSize(etiquette, 8) : 0;
    page.drawText(etiquette, { x: x - largeur, y: plume.y, size: 8, font: grasse, color: GRIS });
  };
  enTete("ARTICLE", COL_DESIGNATION);
  enTete("QTE", COL_QUANTITE);
  enTete("PRIX UNITAIRE", COL_UNITAIRE);
  enTete("TOTAL", COL_TOTAL, true);

  plume.y -= 8;
  page.drawLine({
    start: { x: MARGE, y: plume.y },
    end: { x: LARGEUR - MARGE, y: plume.y },
    thickness: 0.8,
    color: TRAIT,
  });
  plume.y -= 16;

  for (const article of order.items) {
    const designation = winAnsi(`${article.brand} ${article.name}`);
    // La désignation est tronquée pour ne jamais chevaucher la colonne des
    // quantités : les intitulés produits dépassent souvent cent caractères.
    let visible = designation;
    while (normale.widthOfTextAtSize(visible, 9) > COL_QUANTITE - COL_DESIGNATION - 16 && visible.length > 4) {
      visible = visible.slice(0, -2);
    }
    if (visible !== designation) visible = `${visible.trimEnd()}...`;

    page.drawText(visible, { x: COL_DESIGNATION, y: plume.y, size: 9, font: normale, color: NOIR });
    page.drawText(String(article.quantity), { x: COL_QUANTITE, y: plume.y, size: 9, font: normale, color: NOIR });
    page.drawText(winAnsi(euros(article.unitPriceCents)), { x: COL_UNITAIRE, y: plume.y, size: 9, font: normale, color: NOIR });
    const total = winAnsi(euros(article.lineTotalCents));
    page.drawText(total, {
      x: COL_TOTAL - normale.widthOfTextAtSize(total, 9),
      y: plume.y,
      size: 9,
      font: normale,
      color: NOIR,
    });

    plume.y -= 12;
    if (article.variantLabel) {
      page.drawText(winAnsi(article.variantLabel), { x: COL_DESIGNATION, y: plume.y, size: 7, font: normale, color: GRIS });
      plume.y -= 10;
    }
    page.drawText(winAnsi(`Ref. ${article.sku}`), { x: COL_DESIGNATION, y: plume.y, size: 7, font: normale, color: GRIS });
    plume.y -= 16;
  }

  // ---- Totaux ----
  plume.y -= 4;
  page.drawLine({
    start: { x: 330, y: plume.y },
    end: { x: LARGEUR - MARGE, y: plume.y },
    thickness: 0.8,
    color: TRAIT,
  });
  plume.y -= 16;

  const totalLigne = (etiquette: string, valeur: string, gras = false) => {
    const police = gras ? grasse : normale;
    const taille = gras ? 11 : 9;
    page.drawText(winAnsi(etiquette), { x: 330, y: plume.y, size: taille, font: police, color: gras ? NOIR : GRIS });
    const montant = winAnsi(valeur);
    page.drawText(montant, {
      x: COL_TOTAL - police.widthOfTextAtSize(montant, taille),
      y: plume.y,
      size: taille,
      font: police,
      color: NOIR,
    });
    plume.y -= gras ? 20 : 14;
  };

  totalLigne("Sous-total", euros(order.subtotalCents));
  // Libellé court, pour ne jamais chevaucher le montant à droite. Le détail du
  // mode et du délai figure dans la rubrique « Livraison » en bas de facture.
  totalLigne(
    order.shippingMethodKey === "express" ? "Livraison express" : "Livraison standard",
    euros(order.shippingCents),
  );
  totalLigne("Total", euros(order.totalCents), true);

  // ---- Mentions légales de bas de page ----
  let yPied = 116;
  const pied = (texte: string, gras = false) => {
    page.drawText(winAnsi(texte), {
      x: MARGE,
      y: yPied,
      size: 7.5,
      font: gras ? grasse : normale,
      color: GRIS,
    });
    yPied -= 11;
  };

  pied("Livraison", true);
  pied(
    order.shippedAt
      ? `Expedie le ${dateFrancaise(order.shippedAt)}.`
      : "La date de livraison correspond a la date d'expedition et sera communiquee separement.",
  );
  yPied -= 5;
  pied("Paiement", true);
  pied(
    order.paidAt
      ? `Paye le ${dateFrancaise(order.paidAt)} par ${order.paymentMethodLabel}.`
      : `Moyen de paiement : ${order.paymentMethodLabel}. Payable comptant, sans escompte.`,
  );
  yPied -= 5;
  pied("En cas de retard de paiement : penalites au taux de trois fois l'interet legal et indemnite forfaitaire de 40 EUR pour frais de recouvrement.");
  yPied -= 5;
  pied(`${COMPANY.name} · ${COMPANY.street} · ${COMPANY.city}`);
  pied(COMPANY.register);

  const octets = await doc.save();
  return Buffer.from(octets);
}

/** Nom du fichier joint, lisible dans la boîte de réception du client. */
export function invoiceFilename(order: OrderRecord): string {
  return `Facture-${order.orderNumber}.pdf`;
}
