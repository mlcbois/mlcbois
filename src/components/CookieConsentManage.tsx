"use client";

import { useTranslations } from "next-intl";
import { clearConsent } from "@/lib/cookieConsent";

/**
 * Lien de pied de page qui rouvre le bandeau de consentement — le seul moyen,
 * une fois un choix fait, de le changer. `clearConsent()` efface le cookie et
 * prévient CookieConsentBanner, qui se réaffiche.
 */
export function CookieConsentManage() {
  const t = useTranslations("footer");

  return (
    <button type="button" onClick={clearConsent} className="hover:underline">
      {t("linkCookies")}
    </button>
  );
}
