import { scaffoldGateway } from "./scaffold";

/** Mollie — pré-câblé. Bon choix Europe : CB, iDEAL, Bancontact, SEPA. */
export const mollieGateway = scaffoldGateway({
  id: "mollie",
  label: "Mollie",
  availability: "Bien adapté à la France. Tarification simple, CB + virements européens.",
  implemented: false,
  keys: [
    {
      integrationKey: "mollie_api_key",
      label: "Clé API",
      hint: "live_… (ou test_…). Tableau de bord Mollie → Développeurs → Clés API.",
    },
  ],
});
