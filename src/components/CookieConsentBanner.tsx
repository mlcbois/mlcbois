"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  CONSENT_CHANGED_EVENT,
  getServerConsentSnapshot,
  readConsent,
  subscribeConsent,
  writeConsent,
} from "@/lib/cookieConsent";

/**
 * Bandeau de consentement pour le seul cookie non strictement nécessaire du
 * site : celui du chat en direct (Smartsupp). Les cookies de session, panier
 * et langue restent dispensés de consentement (article 82 de la loi
 * Informatique et Libertés) et ne dépendent pas de ce bandeau.
 *
 * Accepter est définitif — le choix est enregistré six mois (writeConsent) et
 * le bandeau ne reparaît plus, sauf via « Préférences cookies » en pied de
 * page. Refuser, en revanche, n'est volontairement PAS enregistré : le
 * bandeau reparaît à chaque nouvelle page tant que le visiteur n'a pas
 * accepté, pour lui laisser une nouvelle occasion de le faire plutôt que de
 * mémoriser un refus pour six mois. C'est un choix produit, pas une
 * obligation de la CNIL — un refus mémorisé serait tout aussi conforme.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const pathname = usePathname();
  // Le cookie vit hors de React : useSyncExternalStore le relit à chaque
  // changement (bandeau accepté, ou « Préférences cookies » en pied de page),
  // sans jamais avoir à appeler setState depuis un effet.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, getServerConsentSnapshot);

  // Page sur laquelle le visiteur a cliqué « Refuser » pour la dernière fois.
  // Un simple état local, jamais persisté : il se réinitialise à chaque
  // navigation, ce qui suffit à faire reparaître le bandeau sur la page
  // suivante sans avoir à traquer un historique de refus.
  const [declinedOnPathname, setDeclinedOnPathname] = useState<string | null>(null);

  // « Préférences cookies » en pied de page efface le cookie (consentement
  // accepté) et prévient de ce changement — c'est aussi le signal qui doit
  // rouvrir le bandeau même si le refus courant portait déjà sur cette page.
  useEffect(() => {
    function handleChange(event: Event) {
      const detail = (event as CustomEvent<string | null>).detail;
      if (detail === null) setDeclinedOnPathname(null);
    }
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  if (consent === "accepted" || declinedOnPathname === pathname) return null;

  return (
    <div
      role="region"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-foreground">
          {t("message")}{" "}
          <Link href="/confidentialite" className="font-semibold text-primary underline">
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setDeclinedOnPathname(pathname)}
            className="flex-1 rounded-md border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 sm:flex-none"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => writeConsent("accepted")}
            className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 sm:flex-none"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
