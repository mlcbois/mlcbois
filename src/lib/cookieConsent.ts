/**
 * Consentement au cookie non strictement nécessaire du site — aujourd'hui,
 * uniquement celui du chat en direct (Smartsupp). Lu et écrit côté client
 * seulement : un consentement se recueille, il ne se présume pas au rendu
 * serveur.
 *
 * Durée alignée sur la recommandation de la CNIL : au-delà de six mois, le
 * consentement doit être redemandé plutôt que reconduit tacitement.
 */

export const COOKIE_CONSENT_NAME = "cookie_consent";
export const CONSENT_CHANGED_EVENT = "mlc:cookie-consent-changed";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 182; // ~6 mois

export type ConsentValue = "accepted" | "declined";

/** Choix déjà enregistré, ou `null` si le visiteur n'a pas encore répondu. */
export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_CONSENT_NAME}=(accepted|declined)`),
  );
  const value = match?.[1];
  return value === "accepted" || value === "declined" ? value : null;
}

/** Enregistre le choix et prévient les composants qui en dépendent (le chat). */
export function writeConsent(value: ConsentValue): void {
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; max-age=${MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<ConsentValue | null>(CONSENT_CHANGED_EVENT, { detail: value }));
}

/** Efface le choix : le bandeau reparaît, le consentement est redemandé. */
export function clearConsent(): void {
  document.cookie = `${COOKIE_CONSENT_NAME}=; max-age=0; path=/`;
  window.dispatchEvent(new CustomEvent<ConsentValue | null>(CONSENT_CHANGED_EVENT, { detail: null }));
}

/**
 * Abonnement pour `useSyncExternalStore` : le cookie de consentement vit hors
 * de React, c'est la façon prévue de le lire sans provoquer d'appel à
 * `setState` dans un effet (voir CookieConsentBanner et SmartsuppLauncher).
 */
export function subscribeConsent(onStoreChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
}

/** Snapshot pour le rendu serveur : jamais de cookie à lire, donc « pas encore répondu ». */
export function getServerConsentSnapshot(): ConsentValue | null {
  return null;
}
