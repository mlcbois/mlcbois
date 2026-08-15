import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MERCHANT_SELECTION,
  coerceMerchantSelection,
  filterForFeed,
  isInFeed,
  type MerchantSelection,
} from "./merchantSelection";

const PRODUCTS = [{ id: "a" }, { id: "b" }, { id: "c" }];

test("isInFeed accepte tout quand la sélection n'est pas restreinte", () => {
  const selection: MerchantSelection = { restricted: false, includedProductIds: [] };
  for (const product of PRODUCTS) assert.equal(isInFeed(product, selection), true);
});

test("isInFeed n'accepte que la liste blanche quand la sélection est restreinte", () => {
  const selection: MerchantSelection = { restricted: true, includedProductIds: ["a", "c"] };
  assert.equal(isInFeed({ id: "a" }, selection), true);
  assert.equal(isInFeed({ id: "b" }, selection), false);
  assert.equal(isInFeed({ id: "c" }, selection), true);
});

test("filterForFeed renvoie tout le catalogue quand la sélection n'est pas restreinte", () => {
  const selection: MerchantSelection = { restricted: false, includedProductIds: ["a"] };
  assert.deepEqual(filterForFeed(PRODUCTS, selection), PRODUCTS);
});

test("filterForFeed ne garde que la liste blanche quand la sélection est restreinte", () => {
  const selection: MerchantSelection = { restricted: true, includedProductIds: ["b"] };
  assert.deepEqual(filterForFeed(PRODUCTS, selection), [{ id: "b" }]);
});

test("filterForFeed renvoie un flux vide si la liste blanche ne correspond à aucun produit", () => {
  const selection: MerchantSelection = { restricted: true, includedProductIds: ["z"] };
  assert.deepEqual(filterForFeed(PRODUCTS, selection), []);
});

test("coerceMerchantSelection retombe sur le catalogue entier si la valeur est illisible", () => {
  assert.deepEqual(coerceMerchantSelection(null), DEFAULT_MERCHANT_SELECTION);
  assert.deepEqual(coerceMerchantSelection(undefined), DEFAULT_MERCHANT_SELECTION);
  assert.deepEqual(coerceMerchantSelection("oops"), DEFAULT_MERCHANT_SELECTION);
  assert.deepEqual(coerceMerchantSelection(42), DEFAULT_MERCHANT_SELECTION);
  assert.deepEqual(coerceMerchantSelection([]), DEFAULT_MERCHANT_SELECTION);
});

test("coerceMerchantSelection retombe sur le catalogue entier si la forme est corrompue", () => {
  assert.deepEqual(coerceMerchantSelection({}), DEFAULT_MERCHANT_SELECTION);
  assert.deepEqual(
    coerceMerchantSelection({ restricted: "true", includedProductIds: ["a"] }),
    { restricted: false, includedProductIds: ["a"] },
  );
  assert.deepEqual(
    coerceMerchantSelection({ restricted: true, includedProductIds: "a" }),
    { restricted: true, includedProductIds: [] },
  );
  assert.deepEqual(
    coerceMerchantSelection({ restricted: true, includedProductIds: [1, "a", null, "b"] }),
    { restricted: true, includedProductIds: ["a", "b"] },
  );
});

test("coerceMerchantSelection lit une sélection valide telle quelle", () => {
  const value = { restricted: true, includedProductIds: ["a", "b"] };
  assert.deepEqual(coerceMerchantSelection(value), value);
});
