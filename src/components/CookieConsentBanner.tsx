"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  type ConsentValue,
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
 * S'affiche tant qu'aucun choix n'est enregistré, et reparaît si le visiteur
 * clique sur « Préférences cookies » en pied de page (CookieConsentManage).
 * Accepter et refuser sont deux actions de poids égal, comme l'exige la CNIL —
 * aucune n'est mise en avant au détriment de l'autre.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  // Le cookie vit hors de React : useSyncExternalStore le relit à chaque
  // changement (bandeau répondu, ou « Préférences cookies » en pied de page),
  // sans jamais avoir à appeler setState depuis un effet.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, getServerConsentSnapshot);

  if (consent !== null) return null;

  function respond(value: ConsentValue) {
    writeConsent(value);
  }

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
            onClick={() => respond("declined")}
            className="flex-1 rounded-md border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 sm:flex-none"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 sm:flex-none"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
