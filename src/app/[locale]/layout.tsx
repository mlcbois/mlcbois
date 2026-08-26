import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/cart/CartProvider";
import { PaymentMethodsBar } from "@/components/PaymentMethodsBar";
import { DeferredWidgets } from "@/components/DeferredWidgets";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CodeSnippets } from "@/components/CodeSnippets";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Permet le rendu statique des pages qui utilisent les traductions
  setRequestLocale(locale);

  // Le panier vit dans localStorage : le fournisseur enveloppe toute la
  // boutique pour que le Header et les fiches produit y accèdent. Les pages
  // restent des composants serveur, seul le contexte est côté client.
  //
  // Le tiroir est monté ici pour être disponible sur toutes les pages. Les
  // moyens de paiement lui sont passés déjà rendus : la lecture en base reste
  // côté serveur, le tiroir n'embarque aucune requête.
  return (
    <NextIntlClientProvider>
      {/* Fragments posés depuis « Scripts & balises ». Placés ici, ils ne
          touchent que la boutique : /admin ne traverse pas ce layout. */}
      <CodeSnippets placement="head" />
      <CodeSnippets placement="bodyStart" />
      <CartProvider>
        {children}
        {/* Tiroir panier, popup de sortie, boutons de contact flottants :
            aucun n'a de rôle dans le premier rendu, tous chargés hors du
            paquet JS initial — voir DeferredWidgets. */}
        <DeferredWidgets paymentSlot={<PaymentMethodsBar variant="inline" />} />
        {/* Recueille le consentement avant tout chargement automatique du
            chat — voir SmartsuppLauncher pour la raison. */}
        <CookieConsentBanner />
        <CodeSnippets placement="bodyEnd" />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
