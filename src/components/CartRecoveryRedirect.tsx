"use client";

import { useEffect } from "react";
import { replaceCart, type CartLine } from "@/lib/cart";

/**
 * Écrit le panier restauré dans localStorage puis part vers /panier.
 *
 * `window.location.href` plutôt que le routeur : cette page vit hors du
 * routage multilingue (voir AbandonedCartRecoveryPage), la destination porte
 * donc déjà son préfixe de langue au besoin.
 */
export function CartRecoveryRedirect({
  items,
  destination,
}: {
  items: CartLine[];
  destination: string;
}) {
  useEffect(() => {
    replaceCart(items);
    window.location.href = destination;
  }, [items, destination]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <p className="text-sm text-muted-foreground">Redirection…</p>
    </main>
  );
}
