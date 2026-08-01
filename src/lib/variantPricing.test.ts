// src/lib/variantPricing.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { minActivePriceCents, cartLineKey } from "./variantPricing";

test("minActivePriceCents renvoie le plus petit prix actif", () => {
  assert.equal(
    minActivePriceCents([
      { priceCents: 51000, active: true },
      { priceCents: 17500, active: true },
      { priceCents: 25000, active: true },
    ]),
    17500,
  );
});

test("minActivePriceCents ignore les variations inactives", () => {
  assert.equal(
    minActivePriceCents([
      { priceCents: 9900, active: false },
      { priceCents: 17500, active: true },
    ]),
    17500,
  );
});

test("minActivePriceCents renvoie undefined sans variation active", () => {
  assert.equal(minActivePriceCents([]), undefined);
  assert.equal(minActivePriceCents([{ priceCents: 100, active: false }]), undefined);
});

test("cartLineKey distingue les variations d'un même produit", () => {
  assert.notEqual(cartLineKey("p1", "v1"), cartLineKey("p1", "v2"));
  assert.equal(cartLineKey("p1", "v1"), cartLineKey("p1", "v1"));
});

test("cartLineKey sans variation retombe sur le seul productId", () => {
  assert.equal(cartLineKey("p1"), "p1");
  assert.equal(cartLineKey("p1", undefined), "p1");
});
