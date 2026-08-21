/**
 * Déclencheur de l'envoi des relances de panier abandonné.
 *
 * Même principe que /api/cron/campaigns : une tâche planifiée extérieure
 * appelle cette route, l'état vit entièrement en base. La première relance
 * partant 25 minutes après la dernière activité, cette route doit être
 * appelée plus souvent que celle des campagnes — toutes les cinq minutes
 * suffit largement, voir docs/DEPLOY.md pour l'exemple de tâche planifiée.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dispatchDueAbandonedCartReminders } from "@/server/abandonedCarts";

export const dynamic = "force-dynamic";

function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function readProvidedSecret(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (bearer) return bearer;
  return new URL(request.url).searchParams.get("secret")?.trim() ?? "";
}

async function handle(request: Request) {
  const expected = process.env.CRON_SECRET?.trim() ?? "";

  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET n'est pas configuré : le déclencheur est désactivé." },
        { status: 503 },
      );
    }
    const report = await dispatchDueAbandonedCartReminders();
    return NextResponse.json({
      warning: "CRON_SECRET absent : route ouverte en développement uniquement.",
      ...report,
    });
  }

  const provided = readProvidedSecret(request);
  if (!provided || !secretMatches(provided, expected)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const report = await dispatchDueAbandonedCartReminders();
  return NextResponse.json(report);
}

export async function POST(request: Request) {
  return handle(request);
}

/** Toléré : beaucoup d'ordonnanceurs simples ne savent émettre qu'un GET. */
export async function GET(request: Request) {
  return handle(request);
}
