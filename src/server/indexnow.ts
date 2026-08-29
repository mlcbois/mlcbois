/**
 * IndexNow — signale à Bing, Yandex et les autres moteurs participants
 * qu'une page vient de changer, au lieu d'attendre leur prochain passage.
 *
 * La clé n'est pas un secret : elle est justement publiée en clair, à la
 * racine du site, pour que les moteurs vérifient qu'ils parlent bien au
 * propriétaire du domaine. Rien ne protège de son exposition, donc pas de
 * variable d'environnement pour elle — voir le fichier texte à la racine de
 * `public/`.
 *
 * Un seul point d'entrée (api.indexnow.org) relaie ensuite l'information aux
 * moteurs participants ; inutile d'appeler chacun séparément.
 */

import { routing } from "@/i18n/routing";
import { prisma } from "@/server/prisma";

const INDEXNOW_KEY = "47dbeda5f4c0ae50f269d9e92365da85";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function siteHost(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mlc-bois.fr";
  return new URL(url).host;
}

function keyLocation(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mlc-bois.fr").replace(/\/$/, "");
  return `${base}/${INDEXNOW_KEY}.txt`;
}

/**
 * Même construction que sitemap.ts : le français vit à la racine, les autres
 * langues sous leur préfixe (`/en/...`).
 */
export function localizedUrls(path: string): string[] {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mlc-bois.fr").replace(/\/$/, "");
  return routing.locales.map((locale) => {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    return `${base}${prefix}${path}`;
  });
}

/**
 * Signale une ou plusieurs URL comme créées, modifiées ou supprimées.
 *
 * Ne lève jamais : c'est un signal d'accélération, pas une étape du
 * changement lui-même — un moteur injoignable ne doit jamais faire échouer
 * l'enregistrement d'un produit ou d'une catégorie. Un échec reste
 * silencieux pour l'appelant, seule une trace part dans les journaux.
 */
export async function notifyIndexNow(urls: readonly string[]): Promise<void> {
  const urlList = urls.filter((url) => url.length > 0);
  if (urlList.length === 0) return;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: siteHost(),
        key: INDEXNOW_KEY,
        keyLocation: keyLocation(),
        urlList,
      }),
    });

    if (!response.ok) {
      console.error(`[indexnow] réponse ${response.status} pour ${urlList.length} URL.`);
    }
  } catch (error) {
    console.error("[indexnow] notification impossible :", error);
  }
}

/** Signale une fiche produit tout juste créée ou modifiée. */
export async function notifyProductChanged(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true, category: { select: { slug: true, group: { select: { slug: true } } } } },
  });
  if (!product) return;

  await notifyIndexNow(
    localizedUrls(`/${product.category.group.slug}/${product.category.slug}/${product.slug}`),
  );
}

/** Signale une page catégorie tout juste modifiée. */
export async function notifyCategoryChanged(groupSlug: string, categorySlug: string): Promise<void> {
  await notifyIndexNow(localizedUrls(`/${groupSlug}/${categorySlug}`));
}
