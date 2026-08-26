import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { getLocale } from "next-intl/server";
import { siteUrl } from "@/server/merchant";
import "./globals.css";

// Police unique du site : titres, texte courant et grandeurs mesurées. Les
// trois rôles typographiques restent distincts par la graisse, la chasse et
// l'interlettrage — pas par la famille.
const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

// Titre, description et aperçu de secours : servis tels quels par les pages
// qui ne définissent pas leur propre `generateMetadata` (essentiellement les
// pages d'administration et d'erreur), et repris comme base par les pages qui,
// elles, précisent openGraph/twitter avec leur propre contenu.
const FALLBACK_TITLE = "MLC Bois | Bois de chauffage prêt à brûler, moins de 18 % d'humidité";
const FALLBACK_DESCRIPTION =
  "Hêtre, chêne et bouleau séchés en séchoir, en bûches de 25, 33 et 50 cm, sous 18 % d'humidité. Livraison en France et Belgique.";
/** Seule image du site qui représente la boutique sans dépendre d'un produit précis. */
const FALLBACK_IMAGE = "/images/bois/hero-holzstapel.jpg";

export const metadata: Metadata = {
  // Nécessaire pour que Next résolve en URL absolue les chemins d'image
  // relatifs des blocs openGraph/twitter (ici et dans les pages qui les posent).
  metadataBase: new URL(siteUrl()),
  title: FALLBACK_TITLE,
  description: FALLBACK_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "MLC Bois",
    locale: "fr_FR",
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    images: [{ url: FALLBACK_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    images: [FALLBACK_IMAGE],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // La langue vient du routage pour la boutique ; le back-office, hors
  // middleware, retombe sur la langue par défaut (français).
  const locale = await getLocale();

  // suppressHydrationWarning ne porte que sur <html> : les extensions de
  // navigateur y posent leurs propres attributs (data-qb-installed, thèmes
  // sombres, gestionnaires de mots de passe…) avant que React ne s'hydrate.
  // L'écart est alors inévitable et sans conséquence ; la vérification reste
  // entière pour tout le contenu de la page.
  return (
    <html
      lang={locale}
      className={`${lato.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
