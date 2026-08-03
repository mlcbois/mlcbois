// src/lib/productContent.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateProductContent, type ProductContent } from "./productContent";

function entree(surcharge: Partial<ProductContent> = {}): ProductContent {
  return {
    slug: "hetre-pret-a-bruler-25-cm",
    description: "a".repeat(500),
    shortDescription: "Bûches de hêtre fendues à 25 cm, séchées sous 18 % d'humidité.",
    descriptionEn: "b".repeat(500),
    shortDescriptionEn: "Beech logs split to 25 cm, kiln dried below 18 % moisture.",
    ...surcharge,
  };
}

test("une entrée conforme ne remonte aucune anomalie", () => {
  assert.deepEqual(validateProductContent([entree()]), []);
});

test("une description hors de la fourchette 400-800 est signalée", () => {
  assert.ok(validateProductContent([entree({ description: "a".repeat(120) })])[0].includes("400"));
  assert.ok(validateProductContent([entree({ description: "a".repeat(900) })])[0].includes("800"));
});

test("une description identique à la description courte est signalée", () => {
  const texte = "a".repeat(500);
  const anomalies = validateProductContent([entree({ description: texte, shortDescription: texte })]);
  assert.ok(anomalies.some((a) => a.includes("identique")), anomalies.join(" | "));
});

test("le vocabulaire promotionnel est signalé", () => {
  const anomalies = validateProductContent([
    entree({ description: `Livraison offerte sur ce produit. ${"a".repeat(450)}` }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("promotionnel")), anomalies.join(" | "));
});

test("le HTML est signalé", () => {
  const anomalies = validateProductContent([entree({ description: `<b>Hêtre</b> ${"a".repeat(450)}` })]);
  assert.ok(anomalies.some((a) => a.includes("HTML")), anomalies.join(" | "));
});

test("un GTIN au checksum faux est signalé", () => {
  const anomalies = validateProductContent([entree({ gtin: "4006381333930" })]);
  assert.ok(anomalies.some((a) => a.includes("GTIN")), anomalies.join(" | "));
});

test("un GTIN valide passe", () => {
  assert.deepEqual(validateProductContent([entree({ gtin: "4006381333931" })]), []);
});

test("un slug en double est signalé", () => {
  const anomalies = validateProductContent([entree(), entree()]);
  assert.ok(anomalies.some((a) => a.includes("double")), anomalies.join(" | "));
});
