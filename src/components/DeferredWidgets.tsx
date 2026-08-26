"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/**
 * Regroupe les composants qui n'ont aucun rôle dans le premier rendu — tiroir
 * panier, popup de sortie, boutons de contact flottants — et les charge en
 * dehors du paquet JS initial. `ssr: false` n'est permis qu'à l'intérieur d'un
 * composant client, d'où ce petit fichier plutôt qu'un `dynamic()` posé
 * directement dans la mise en page (composant serveur).
 */
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), {
  ssr: false,
});
const ExitIntentPopup = dynamic(
  () => import("@/components/ExitIntentPopup").then((m) => m.ExitIntentPopup),
  { ssr: false },
);
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton").then((m) => m.WhatsAppButton), {
  ssr: false,
});
const SmartsuppChat = dynamic(() => import("@/components/SmartsuppChat").then((m) => m.SmartsuppChat), {
  ssr: false,
});

export function DeferredWidgets({ paymentSlot }: { paymentSlot: ReactNode }) {
  return (
    <>
      <CartDrawer paymentSlot={paymentSlot} />
      <ExitIntentPopup />
      <WhatsAppButton />
      <SmartsuppChat />
    </>
  );
}
