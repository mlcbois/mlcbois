"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Calculator, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Stapelrechner } from "@/components/home/Stapelrechner";

/**
 * Bouton fixe qui ouvre et referme le calculateur de volume dans un panneau
 * latéral, sur le même principe que le tiroir du panier (CartDrawer) : ce
 * dernier n'apparaît qu'une fois le panier non vide, donc jamais en même
 * temps que ce bouton-ci en bas d'écran — pas de risque de recouvrement.
 *
 * Sorti du hero pour lui laisser toute la place ; le calculateur reste à un
 * clic, sur toutes les pages où ce composant est monté.
 */

/** Le panneau se referme sur Échap et rend le reste de la page inerte. */
function useDismissable(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);
}

export function StapelrechnerToggle() {
  const t = useTranslations("rechner");
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismissable(open, close);

  // Le focus entre dans le panneau à l'ouverture et revient sur le bouton à la
  // fermeture, comme pour le tiroir du panier.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("openAria")}
        className="fixed right-0 bottom-6 z-40 flex items-center justify-center rounded-l-sm bg-secondary p-3.5 text-secondary-foreground shadow-lg transition-all hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Calculator className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={t("closeAria")}
            onClick={close}
            className="absolute inset-0 bg-black/50 motion-safe:animate-in motion-safe:fade-in"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-muted shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-200"
          >
            <header className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
              <h2 id={titleId} className="flex items-center gap-2 text-lg font-black text-foreground">
                <Calculator className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                {t("openLabel")}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={t("closeAria")}
                className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div className="p-5">
              <Stapelrechner />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
