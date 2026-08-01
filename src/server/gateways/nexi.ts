import { scaffoldGateway } from "./scaffold";

/** Nexi — pré-câblé. Orienté Italie/Europe du Sud, intégration plus lourde. */
export const nexiGateway = scaffoldGateway({
  id: "nexi",
  label: "Nexi",
  availability: "Orienté Italie/Europe du Sud. Support France plus limité, intégration plus lourde.",
  implemented: false,
  keys: [
    {
      integrationKey: "nexi_api_key",
      label: "Clé API",
      hint: "Clé API du compte Nexi / Nexi XPay.",
    },
    {
      integrationKey: "nexi_webhook_secret",
      label: "Secret du webhook",
      hint: "Secret de validation des notifications Nexi.",
    },
  ],
});
