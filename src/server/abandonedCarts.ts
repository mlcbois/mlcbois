/**
 * Relance des paniers abandonnés — trois e-mails au maximum.
 *
 * Capture : dès que l'e-mail est saisi à l'étape « contact » du tunnel de
 * commande (avant toute validation), le panier est suivi via `trackAbandonedCart`.
 * Chaque nouvelle activité repousse `nextReminderAt` : le compte à rebours part
 * du dernier geste du client, pas du premier.
 *
 * Séquence : 25 minutes après la dernière activité, puis 9 heures, puis
 * 9 heures — voir REMINDER_DELAYS_MS. Une commande passée avec cette adresse
 * arrête aussitôt la séquence (`markAbandonedCartRecovered`). Le
 * répartiteur (`dispatchDueAbandonedCartReminders`) est appelé par
 * /api/cron/abandoned-carts, sur le même principe que le répartiteur de
 * campagnes : verrou par ligne, vérification de la liste de blocage à
 * l'envoi (pas seulement à la capture), échec d'un envoi sans effet sur les
 * autres.
 */

import { randomBytes } from "node:crypto";
import { prisma } from "@/server/prisma";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import {
  buildAbandonedCartReminder1,
  buildAbandonedCartReminder2,
  buildAbandonedCartReminder3,
  type AbandonedCartItem,
} from "@/server/emails/abandonedCart";

const TOKEN_BYTES = 32;

/** 25 minutes, puis 9 heures, puis 9 heures. */
const REMINDER_DELAYS_MS = [25 * 60_000, 9 * 60 * 60_000, 9 * 60 * 60_000] as const;
export const MAX_REMINDERS = REMINDER_DELAYS_MS.length;

/** Verrou considéré abandonné au-delà de cette durée — reprise possible au passage suivant. */
const LOCK_TIMEOUT_MS = 10 * 60_000;

/** Nombre de lignes traitées par appel du répartiteur : borne raisonnable, jamais atteinte en pratique à cette échelle. */
const BATCH_LIMIT = 50;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function newToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export type AbandonedCartLocale = "fr" | "en";

export interface TrackedCartItem {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  path: string;
  priceCents: number;
  quantity: number;
}

/** Une entrée illisible ne doit jamais faire échouer la lecture des autres. */
function isTrackedCartItem(value: unknown): value is TrackedCartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    item.productId.length > 0 &&
    typeof item.priceCents === "number" &&
    Number.isFinite(item.priceCents) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

export function parseItems(raw: string): TrackedCartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTrackedCartItem).map((item) => ({
      productId: item.productId,
      variantId: typeof item.variantId === "string" ? item.variantId : undefined,
      variantLabel: typeof item.variantLabel === "string" ? item.variantLabel : undefined,
      slug: typeof item.slug === "string" ? item.slug : "",
      brand: typeof item.brand === "string" ? item.brand : "",
      name: typeof item.name === "string" ? item.name : "",
      image: typeof item.image === "string" ? item.image : "",
      path: typeof item.path === "string" ? item.path : "",
      priceCents: Math.max(0, Math.round(item.priceCents)),
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
  } catch {
    return [];
  }
}

/**
 * Capture ou met à jour le panier suivi pour cette adresse. Une adresse
 * bloquée (désinscrite d'une campagne, rejetée, plainte) n'est jamais suivie :
 * inutile de retenir un panier qu'on ne relancera de toute façon jamais.
 */
export async function trackAbandonedCart(input: {
  email: string;
  firstName: string;
  locale: AbandonedCartLocale;
  items: readonly TrackedCartItem[];
}): Promise<void> {
  const email = normalizeEmail(input.email);
  if (!email || input.items.length === 0) return;

  const suppressed = await prisma.emailSuppression.findUnique({ where: { email } });
  if (suppressed) return;

  const now = new Date();
  const nextReminderAt = new Date(now.getTime() + REMINDER_DELAYS_MS[0]);
  const items = JSON.stringify(input.items);
  const existing = await prisma.abandonedCart.findUnique({ where: { email } });

  if (!existing) {
    await prisma.abandonedCart.create({
      data: {
        token: newToken(),
        email,
        firstName: input.firstName.trim(),
        locale: input.locale,
        items,
        nextReminderAt,
      },
    });
    return;
  }

  // Séquence déjà conclue (commande passée, ou trois relances épuisées sans
  // retour) : nouveau cycle, nouveau jeton — un lien déjà envoyé ne doit pas
  // rouvrir un panier périmé depuis longtemps. Séquence encore active : le
  // jeton reste stable, un lien déjà en boîte de réception doit continuer de
  // fonctionner.
  const cycleEnded = existing.recoveredAt !== null || existing.nextReminderAt === null;

  await prisma.abandonedCart.update({
    where: { email },
    data: {
      firstName: input.firstName.trim() || existing.firstName,
      locale: input.locale,
      items,
      nextReminderAt,
      ...(cycleEnded
        ? {
            token: newToken(),
            remindersSent: 0,
            lastReminderAt: null,
            recoveredAt: null,
            recoveredOrderId: null,
          }
        : {}),
    },
  });
}

/**
 * Arrête la séquence : une commande vient d'être passée avec cette adresse.
 * `updateMany` avec garde plutôt que `update` : idempotent, ne lève jamais si
 * aucune ligne ne correspond (adresse jamais suivie, ou déjà marquée).
 */
export async function markAbandonedCartRecovered(email: string, orderId: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  await prisma.abandonedCart.updateMany({
    where: { email: normalized, recoveredAt: null },
    data: { recoveredAt: new Date(), recoveredOrderId: orderId, nextReminderAt: null },
  });
}

interface DispatchReport {
  sent: number;
  failed: number;
  skipped: number;
}

/** Compose le message correspondant à l'étape de la séquence (0, 1 ou 2). */
async function buildReminder(
  step: number,
  cart: { token: string; email: string; firstName: string; locale: string },
  items: TrackedCartItem[],
) {
  const locale: AbandonedCartLocale = cart.locale === "en" ? "en" : "fr";
  const base = { token: cart.token, firstName: cart.firstName, locale };

  if (step === 0) return buildAbandonedCartReminder1({ ...base, items });
  if (step === 1) return buildAbandonedCartReminder2({ ...base, items });

  // Troisième relance : le ton est pressant, mais l'annonce de rareté ne
  // porte que sur un stock réellement bas — jamais une pénurie inventée
  // (article L121-2 du Code de la consommation sur les pratiques commerciales
  // trompeuses).
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true, lowStockThreshold: true, active: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const withStock: AbandonedCartItem[] = items.map((item) => {
    const product = byId.get(item.productId);
    return {
      ...item,
      currentStock: product?.stock ?? item.quantity,
      lowStockThreshold: product?.lowStockThreshold ?? 5,
      stillAvailable: product?.active !== false,
    };
  });

  return buildAbandonedCartReminder3({ ...base, items: withStock });
}

/**
 * Traite les relances dues. Verrou par ligne (comme Campaign.dispatchingAt) :
 * deux passages du cron qui se chevauchent ne renvoient jamais la même
 * relance deux fois. L'échec d'un envoi ne bloque jamais les suivants.
 */
export async function dispatchDueAbandonedCartReminders(): Promise<DispatchReport> {
  const now = new Date();
  const staleLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);

  const due = await prisma.abandonedCart.findMany({
    where: {
      nextReminderAt: { not: null, lte: now },
      recoveredAt: null,
      OR: [{ sendingAt: null }, { sendingAt: { lt: staleLock } }],
    },
    orderBy: { nextReminderAt: "asc" },
    take: BATCH_LIMIT,
  });

  const report: DispatchReport = { sent: 0, failed: 0, skipped: 0 };

  for (const cart of due) {
    const claim = await prisma.abandonedCart.updateMany({
      where: { id: cart.id, OR: [{ sendingAt: null }, { sendingAt: { lt: staleLock } }] },
      data: { sendingAt: now },
    });
    if (claim.count === 0) continue; // pris par un autre passage entre-temps

    try {
      const suppressed = await prisma.emailSuppression.findUnique({ where: { email: cart.email } });
      const items = parseItems(cart.items);

      if (suppressed || items.length === 0 || !isMailConfigured()) {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { nextReminderAt: null, sendingAt: null },
        });
        report.skipped += 1;
        continue;
      }

      const step = cart.remindersSent;
      const message = await buildReminder(step, cart, items);
      await sendMail({ to: cart.email, ...message });

      const remindersSent = step + 1;
      const nextReminderAt =
        remindersSent < REMINDER_DELAYS_MS.length
          ? new Date(now.getTime() + REMINDER_DELAYS_MS[remindersSent])
          : null;

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { remindersSent, lastReminderAt: now, nextReminderAt, sendingAt: null },
      });
      report.sent += 1;
    } catch (error) {
      console.error("[abandoned-cart] envoi de relance impossible :", error);
      // Verrou relâché sans avancer le compteur : la même relance sera
      // retentée au prochain passage plutôt que sautée.
      await prisma.abandonedCart
        .update({ where: { id: cart.id }, data: { sendingAt: null } })
        .catch(() => {});
      report.failed += 1;
    }
  }

  return report;
}

export type AbandonedCartStatus = "recovered" | "pending" | "exhausted";

export interface AdminAbandonedCartRow {
  id: string;
  email: string;
  firstName: string;
  locale: string;
  itemCount: number;
  totalCents: number;
  remindersSent: number;
  lastReminderAt: Date | null;
  nextReminderAt: Date | null;
  status: AbandonedCartStatus;
  recoveredOrderId: string | null;
  createdAt: Date;
}

function cartStatus(cart: { recoveredAt: Date | null; nextReminderAt: Date | null }): AbandonedCartStatus {
  if (cart.recoveredAt) return "recovered";
  if (cart.nextReminderAt) return "pending";
  return "exhausted";
}

/**
 * Liste les paniers suivis pour le back-office, la relance la plus récente
 * en premier. Lecture seule, comme `listCustomersForAdmin` : aucune action
 * n'est proposée ici, la séquence tourne d'elle-même via le répartiteur.
 */
export async function listAbandonedCartsForAdmin(query?: string): Promise<AdminAbandonedCartRow[]> {
  const search = query?.trim().toLowerCase() ?? "";

  const rows = await prisma.abandonedCart.findMany({
    where: search
      ? { OR: [{ email: { contains: search } }, { firstName: { contains: search } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const items = parseItems(row.items);
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      locale: row.locale,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      totalCents: items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
      remindersSent: row.remindersSent,
      lastReminderAt: row.lastReminderAt,
      nextReminderAt: row.nextReminderAt,
      status: cartStatus(row),
      recoveredOrderId: row.recoveredOrderId,
      createdAt: row.createdAt,
    };
  });
}
