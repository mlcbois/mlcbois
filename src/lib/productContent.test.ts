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

test("une shortDescription vide est signalée", () => {
  const anomalies = validateProductContent([entree({ shortDescription: "   " })]);
  assert.ok(anomalies.some((a) => a.includes("shortDescription") && a.includes("vide")), anomalies.join(" | "));
});

test("le vocabulaire promotionnel dans shortDescription est signalé", () => {
  const anomalies = validateProductContent([
    entree({ shortDescription: "Livraison offerte, profitez-en !" }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("shortDescription") && a.includes("promotionnel")), anomalies.join(" | "));
});

test("le HTML dans shortDescriptionEn est signalé", () => {
  const anomalies = validateProductContent([
    entree({ shortDescriptionEn: "<b>Beech</b> logs split to 25 cm." }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("shortDescriptionEn") && a.includes("HTML")), anomalies.join(" | "));
});

test("shortDescription hors fourchette 400-800 n'est pas signalée pour sa longueur", () => {
  // Les champs courts visent ~140 caractères : la fourchette 400-800 ne doit
  // pas s'y appliquer.
  const anomalies = validateProductContent([entree({ shortDescription: "Bûches de hêtre." })]);
  assert.ok(!anomalies.some((a) => a.includes("shortDescription") && a.includes("caractères")), anomalies.join(" | "));
});

test("le vocabulaire promotionnel anglais est signalé dans descriptionEn", () => {
  const anomalies = validateProductContent([
    entree({ descriptionEn: `Free shipping on this order. ${"b".repeat(450)}` }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("descriptionEn") && a.includes("promotionnel")), anomalies.join(" | "));
});

test("« sale » n'est pas détecté comme sous-chaîne de mots anglais légitimes", () => {
  const anomalies = validateProductContent([
    entree({ descriptionEn: `Wholesale pricing available for resale partners. ${"b".repeat(450)}` }),
  ]);
  assert.ok(!anomalies.some((a) => a.includes("promotionnel")), anomalies.join(" | "));
});

test("un mot allemand en minuscules est détecté (insensible à la casse)", () => {
  const anomalies = validateProductContent([
    entree({ description: `Ce produit a une bonne ausstattung. ${"a".repeat(450)}` }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("allemand")), anomalies.join(" | "));
});

test("un GTIN en double entre deux entrées est signalé", () => {
  const anomalies = validateProductContent([
    entree({ slug: "produit-un", gtin: "4006381333931" }),
    entree({ slug: "produit-deux", gtin: "4006381333931" }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("GTIN") && a.includes("double")), anomalies.join(" | "));
});

test("un MPN en double entre deux entrées est signalé", () => {
  const anomalies = validateProductContent([
    entree({ slug: "produit-un", mpn: "REF-123" }),
    entree({ slug: "produit-deux", mpn: "REF-123" }),
  ]);
  assert.ok(anomalies.some((a) => a.includes("MPN") && a.includes("double")), anomalies.join(" | "));
});
