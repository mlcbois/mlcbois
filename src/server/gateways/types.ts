/**
 * Contrat commun à tous les prestataires de paiement en ligne.
 *
 * Un adaptateur ne connaît ni la boutique ni la base : il reçoit une commande
 * déjà écrite (voir @/server/orders.createOrder) et rend une URL de redirection,
 * puis interprète les webhooks entrants. Ajouter un prestataire, c'est écrire un
 * fichier qui satisfait `PaymentGateway` et l'inscrire dans le registre
 * (@/server/gateways/index.ts) — rien d'autre dans le tunnel ne change.
 */

import type { PaymentStatus } from "@/lib/orderStatus";

export const GATEWAY_IDS = ["stripe", "mollie", "square", "nexi"] as const;
export type GatewayId = (typeof GATEWAY_IDS)[number];

export function isGatewayId(value: unknown): value is GatewayId {
  return typeof value === "string" && (GATEWAY_IDS as readonly string[]).includes(value);
}

/** Contexte d'une commande à encaisser, transmis à l'adaptateur. */
export interface GatewayOrderContext {
  orderNumber: string;
  accessToken: string;
  /** Montant TTC en centimes. */
  amountCents: number;
  /** Code ISO, ex. « EUR ». */
  currency: string;
  email: string;
  locale: "fr" | "en";
  /** Libellé lisible, ex. « Commande MLC-2026-000123 ». */
  description: string;
  /** URL de retour après paiement réussi (page de confirmation). */
  successUrl: string;
  /** URL de retour après abandon. */
  cancelUrl: string;
}

export interface GatewayCheckoutSession {
  /** URL externe vers laquelle rediriger le navigateur pour payer. */
  redirectUrl: string;
  /** Référence renvoyée par le prestataire (session/intent id). */
  reference: string;
}

export interface GatewayWebhookResult {
  /** Numéro de commande extrait de l'événement, ou null si non identifiable. */
  orderNumber: string | null;
  /** Statut de paiement à appliquer, ou null si l'événement est à ignorer. */
  paymentStatus: PaymentStatus | null;
  /** Référence prestataire à mémoriser (facultatif). */
  reference?: string;
}

/** Un secret à saisir en administration, stocké chiffré via @/server/integrations. */
export interface GatewayKeyField {
  /** Clé de la table Integration, ex. « stripe_secret_key ». */
  integrationKey: string;
  label: string;
  hint: string;
}

/** Métadonnées d'affichage et clés requises d'un prestataire. */
export interface GatewayMeta {
  id: GatewayId;
  label: string;
  /** Note honnête sur la disponibilité France, affichée en administration. */
  availability: string;
  /** Secrets à saisir. */
  keys: GatewayKeyField[];
  /** Vrai si l'adaptateur encaisse réellement, faux si seulement pré-câblé. */
  implemented: boolean;
}

export interface PaymentGateway {
  readonly meta: GatewayMeta;
  /** Vrai si toutes les clés nécessaires sont présentes en base. */
  isConfigured(): Promise<boolean>;
  /** Ouvre une session de paiement et rend l'URL de redirection. */
  createCheckoutSession(order: GatewayOrderContext): Promise<GatewayCheckoutSession>;
  /**
   * Valide la signature du webhook et traduit l'événement. Doit lever une erreur
   * si la signature est invalide : la route répond alors 400 et le prestataire
   * réessaiera.
   */
  handleWebhook(request: Request): Promise<GatewayWebhookResult>;
}
