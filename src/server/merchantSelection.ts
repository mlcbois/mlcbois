/**
 * Lecture/écriture de la sélection de produits diffusés dans le flux Google
 * Merchant Center — une ligne de la table générique `Setting`, comme la
 * configuration du prestataire de paiement (`@/server/gateways`).
 *
 * La logique de filtrage elle-même (isInFeed, filterForFeed) vit dans
 * `@/lib/merchantSelection`, sans dépendance à la base : c'est ce module-ci
 * qui la relie à Prisma.
 */

import { cache } from "react";
import { prisma } from "@/server/prisma";
import {
  DEFAULT_MERCHANT_SELECTION,
  coerceMerchantSelection,
  type MerchantSelection,
} from "@/lib/merchantSelection";

export type { MerchantSelection } from "@/lib/merchantSelection";
export { DEFAULT_MERCHANT_SELECTION, filterForFeed, isInFeed } from "@/lib/merchantSelection";

const SETTING_KEY = "merchant_feed_selection";

/**
 * Sélection enregistrée, mise en cache pour la durée du rendu. Toute valeur
 * illisible ou corrompue retombe sur le catalogue entier, jamais sur un flux
 * vide : une ligne cassée en base ne doit pas retirer silencieusement toute
 * la boutique de Google.
 */
export const getMerchantSelection = cache(async (): Promise<MerchantSelection> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return DEFAULT_MERCHANT_SELECTION;
    return coerceMerchantSelection(JSON.parse(row.value));
  } catch {
    return DEFAULT_MERCHANT_SELECTION;
  }
});

export type SaveMerchantSelectionResult =
  | { status: "ok"; selection: MerchantSelection; includedCount: number }
  | { status: "rejected-empty" };

/**
 * Enregistre la sélection. Deux garde-fous, dans cet ordre :
 *   1. les identifiants reçus qui ne correspondent plus à un produit du
 *      catalogue sont écartés silencieusement — l'enregistrement ne doit pas
 *      échouer parce qu'un produit a été supprimé entre-temps ;
 *   2. une restriction dont la liste, une fois nettoyée, est vide est
 *      refusée : c'est la règle non négociable qui évite qu'un clic
 *      malheureux vide le flux Google Merchant.
 */
export async function saveMerchantSelection(input: {
  restricted: boolean;
  includedProductIds: string[];
}): Promise<SaveMerchantSelectionResult> {
  if (!input.restricted) {
    const selection: MerchantSelection = { restricted: false, includedProductIds: [] };
    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(selection) },
      create: { key: SETTING_KEY, value: JSON.stringify(selection) },
    });
    return { status: "ok", selection, includedCount: 0 };
  }

  const validProducts = await prisma.product.findMany({ select: { id: true } });
  const validIds = new Set(validProducts.map((product) => product.id));
  const includedProductIds = [
    ...new Set(input.includedProductIds.filter((id) => validIds.has(id))),
  ];

  if (includedProductIds.length === 0) {
    return { status: "rejected-empty" };
  }

  const selection: MerchantSelection = { restricted: true, includedProductIds };
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(selection) },
    create: { key: SETTING_KEY, value: JSON.stringify(selection) },
  });

  return { status: "ok", selection, includedCount: includedProductIds.length };
}
