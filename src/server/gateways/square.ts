import { scaffoldGateway } from "./scaffold";

/** Square — pré-câblé. Couverture France partielle pour le paiement web. */
export const squareGateway = scaffoldGateway({
  id: "square",
  label: "Square",
  availability: "Couverture France limitée pour le paiement en ligne. À vérifier avant activation.",
  implemented: false,
  keys: [
    {
      integrationKey: "square_access_token",
      label: "Jeton d'accès",
      hint: "Access token de l'application Square (Production ou Sandbox).",
    },
    {
      integrationKey: "square_location_id",
      label: "Identifiant d'établissement",
      hint: "Location ID depuis le tableau de bord Square.",
    },
    {
      integrationKey: "square_webhook_signature_key",
      label: "Clé de signature du webhook",
      hint: "Signature key de l'abonnement webhook Square.",
    },
  ],
});
