import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidGtin } from "./gtin";

test("isValidGtin accepte les longueurs GTIN officielles", () => {
  assert.equal(isValidGtin("4006381333931"), true); // EAN-13
  assert.equal(isValidGtin("036000291452"), true); // UPC-A
  assert.equal(isValidGtin("96385074"), true); // EAN-8
  assert.equal(isValidGtin("14006381333938"), true); // GTIN-14
});

test("isValidGtin rejette une clé de contrôle fausse", () => {
  assert.equal(isValidGtin("4006381333930"), false); // EAN-13 invalide
  assert.equal(isValidGtin("036000291453"), false); // UPC-A invalide
  assert.equal(isValidGtin("400638133393"), false); // UPC-A, checksum invalide
  assert.equal(isValidGtin("14006381333930"), false); // GTIN-14 invalide
});

test("isValidGtin rejette les longueurs hors spécification", () => {
  assert.equal(isValidGtin("1234567890"), false);
  assert.equal(isValidGtin(""), false);
});

test("isValidGtin accepte GTIN-14 valide et rejette GTIN-14 invalide", () => {
  assert.equal(isValidGtin("14006381333938"), true); // GTIN-14 valide
  assert.equal(isValidGtin("14006381333930"), false); // GTIN-14 invalide
});

test("isValidGtin rejette tout ce qui n'est pas une suite de chiffres", () => {
  assert.equal(isValidGtin("400638133393X"), false);
  assert.equal(isValidGtin("4006-3813-3393-1"), false);
});

test("isValidGtin tolère les espaces autour du code", () => {
  assert.equal(isValidGtin("  4006381333931 "), true);
});
