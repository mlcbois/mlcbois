import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Génère les URL canoniques et les alternances de langue (hreflang) exigées par
// Google pour un site multilingue : chaque page doit désigner sa version
// canonique et pointer vers ses équivalents dans les autres langues.

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mlc-bois.fr").replace(/\/+$/, "");

/** URL absolue d'un chemin interne pour une langue donnée. */
export function localizedUrl(href: string, locale: Locale): string {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

/**
 * Bloc « alternates » prêt pour l'API Metadata de Next.
 * `x-default` pointe vers le français, langue par défaut de la boutique.
 */
export function alternatesFor(href: string, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const code of routing.locales) {
    languages[code] = localizedUrl(href, code);
  }
  languages["x-default"] = localizedUrl(href, routing.defaultLocale);

  return {
    canonical: localizedUrl(href, locale),
    languages,
  };
}

/** Code de langue au format IETF attendu par `og:locale` (« fr_FR », « en_GB »… ici « en_US »). */
const OG_LOCALE: Record<Locale, string> = { fr: "fr_FR", en: "en_US" };

/**
 * Image affichée par défaut sur un lien partagé, quand la page n'en a pas de
 * plus spécifique (une fiche produit, par exemple, préfère sa propre photo).
 * Le tas de bûches est la seule image du site qui représente la boutique sans
 * dépendre d'un produit précis.
 */
const DEFAULT_OG_IMAGE = "/images/brennholz/hero-holzstapel.jpg";

/**
 * Bloc « openGraph » + « twitter » prêt pour l'API Metadata de Next.
 *
 * Les chemins d'image relatifs sont résolus par Next à partir de
 * `metadataBase` (posé dans app/layout.tsx) : inutile de les préfixer ici.
 * Sans cette fonction, un lien partagé sur WhatsApp, LinkedIn ou X n'affiche
 * qu'une URL nue, ni image ni description.
 */
export function openGraphFor(input: {
  href: string;
  locale: Locale;
  title: string;
  description: string;
  /** Image représentative de la page ; à défaut, le tas de bûches de l'accueil. */
  image?: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = localizedUrl(input.href, input.locale);
  const image = input.image?.trim() || DEFAULT_OG_IMAGE;

  return {
    openGraph: {
      type: input.type ?? "website",
      url,
      title: input.title,
      description: input.description,
      siteName: "MLC Bois",
      locale: OG_LOCALE[input.locale],
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
