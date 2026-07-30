import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { getLocale } from "next-intl/server";
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

export const metadata: Metadata = {
  title: "MLC Bois | Bois de chauffage prêt à brûler, moins de 18 % d'humidité",
  description:
    "Hêtre, chêne et bouleau séchés en séchoir, en bûches de 25, 33 et 50 cm. Humidité sur brut inférieure à 18 %, livraison en 48 heures en Île-de-France.",
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
