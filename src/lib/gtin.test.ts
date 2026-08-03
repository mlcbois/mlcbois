import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidGtin } from "./gtin";

test("isValidGtin accepte les longueurs GTIN officielles", () => {
  assert.equal(isValidGtin("4006381333931"), true); // EAN-13
  assert.equal(isValidGtin("036000291452"), true); // UPC-A
  assert.equal(isValidGtin("96385074"), true); // EAN-8
});

test("isValidGtin rejette une clé de contrôle fausse", () => {
  assert.equal(isValidGtin("4006381333930"), false);
  assert.equal(isValidGtin("036000291453"), false);
});

test("isValidGtin rejette les longueurs hors spécification", () => {
  assert.equal(isValidGtin("400638133393"), false); // 12 chiffres mais checksum EAN-13
  assert.equal(isValidGtin("1234567890"), false);
  assert.equal(isValidGtin(""), false);
});

test("isValidGtin rejette tout ce qui n'est pas une suite de chiffres", () => {
  assert.equal(isValidGtin("400638133393X"), false);
  assert.equal(isValidGtin("4006-3813-3393-1"), false);
});

test("isValidGtin tolère les espaces autour du code", () => {
  assert.equal(isValidGtin("  4006381333931 "), true);
});
