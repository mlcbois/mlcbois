// src/server/merchant.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMerchantRecord, merchantDescription, type MerchantProduct } from "./merchant";

/** Produit minimal, complété au cas par cas dans chaque test. */
function produit(surcharge: Partial<MerchantProduct> = {}): MerchantProduct {
  return {
    id: "p1",
    brand: "MLC Bois",
    name: "Hêtre 25 cm",
    slug: "hetre-25-cm",
    sku: "MLCBOISHET",
    shortDescription: "Bûches de hêtre.",
    description: "Bûches de hêtre.",
    bullets: JSON.stringify(["Humidité sous 18 %", "Longueur 25 cm"]),
    gtin: null,
    mpn: null,
    condition: "new",
    googleProductCategory: "",
    shippingWeightGrams: null,
    energyEfficiencyClass: null,
    image: "/images/hetre.jpg",
    images: "[]",
    priceCents: 25000,
    oldPriceCents: null,
    stock: 4,
    active: true,
    category: {
      slug: "vrac",
      label: "Bois en vrac",
      description: "Bois de chauffage livré en vrac.",
      image: "/images/vrac.jpg",
      group: { slug: "bois-de-chauffage", label: "Bois de chauffage" },
    },
    ...surcharge,
  } as MerchantProduct;
}

const MOTS_ALLEMANDS = ["von", "Ausstattung", "Zustand", "fabrikneu", "originalverpackt", "Aktion"];

test("le repli de description ne contient aucun mot allemand", () => {
  // Description sous 80 caractères : c'est le seul cas qui déclenche le repli.
  const texte = merchantDescription(produit({ description: "Bûches.", shortDescription: "Bûches." }));
  for (const mot of MOTS_ALLEMANDS) {
    assert.ok(
      !new RegExp(`\\b${mot}\\b`).test(texte),
      `« ${mot} » ne doit plus apparaître dans : ${texte}`,
    );
  }
});

test("le repli reprend les bullets et l'état du produit", () => {
  const texte = merchantDescription(produit({ description: "Bûches.", shortDescription: "Bûches." }));
  assert.ok(texte.includes("Humidité sous 18 %"), texte);
  assert.ok(texte.includes("neuf"), texte);
});

test("une description déjà fournie n'est pas remplacée par le repli", () => {
  const longue = "Bûches de hêtre fendues à 25 cm, séchées sous 18 % d'humidité sur brut, prêtes à brûler.";
  assert.equal(merchantDescription(produit({ description: longue })), longue);
});

test("customLabel1 est en français sur un produit en promotion", () => {
  const record = buildMerchantRecord(produit({ priceCents: 20000, oldPriceCents: 25000 }));
  assert.equal(record.customLabel1, "Promotion");
});

test("customLabel1 reste vide hors promotion", () => {
  const record = buildMerchantRecord(produit());
  assert.equal(record.customLabel1, undefined);
});
