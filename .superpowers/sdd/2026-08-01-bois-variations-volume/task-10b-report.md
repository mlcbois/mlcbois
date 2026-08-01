# Task 10b Report — Variant discount propagation

**Date:** 2026-08-01  
**Branch:** bois-vrac-variations  
**Files changed:** `src/server/orders.ts`, `src/server/store.ts`

---

## What was done

Marketing campaign discounts now apply to product variant (per-volume) lines, both in what is charged (`orders.ts`) and in what is displayed (`store.ts`). The two sites use the identical ratio formula, which is the core guarantee of display == charge.

---

## Discount formula (both sites)

```
discountedVariantPrice = Math.round(variantBaseCents * promotion.priceCents / promotion.basePriceCents)
```

This is a **proportional ratio**, not a flat-amount subtraction. It generalises across all campaign types (percent, amount, or any future type): the ratio `promotion.priceCents / promotion.basePriceCents` encodes "what fraction of the reference price does the customer pay?" and is applied identically to every variant's base price read from the DB.

The discount is applied only when:
- `promotion.savingCents > 0` (the campaign actually lowers the price)
- `promotion.basePriceCents > 0` (guard against division by zero)

Free-shipping-only campaigns (`savingCents == 0`) leave variant prices untouched in both places.

---

## `store.ts` — storefront display (`toViewProduct`)

Before this change, `toViewProduct` mapped active-variants as-is (raw DB prices) even when a promotion was active.

After:
```ts
const discountedVariants: VariantView[] = lowersPrice
  ? view.variants?.map((v) => ({
      ...v,
      priceCents: Math.round((v.priceCents * promotion.priceCents) / promotion.basePriceCents),
      oldPriceCents: v.priceCents,   // strike-through = variant base price
    })) ?? []
  : view.variants ?? [];
```

- `priceCents` → discounted price (what the cart will charge)
- `oldPriceCents` → variant base price (shown struck through in the UI)

`view.variants` was already built from `row.variants.filter(v => v.active)`, so only active variants are included.

**`product.priceCents` (the "from" price):** Left unchanged from current behavior. It continues to reflect the minimum active variant price set by `writeVariants` at product save time. When a promotion is active, `product.priceCents` on the top-level product is also remapped to `promotion.priceCents` (the existing code). This means the "from" price shown in product cards will be the discounted price of the reference product rather than the smallest discounted variant — a minor cosmetic inconsistency for multi-variant products, but acceptable and consistent with how the system worked before for simple products. The cart always uses `variant.priceCents` directly (the discounted value), so no under/over-charge is possible.

---

## `orders.ts` — order creation (`createOrder`)

Before this change, the code at step 2 explicitly bypassed promotions for any line with a `variantId`:
```ts
line.variantId
  ? Promise.resolve({ priceCents: line.priceCents, campaignId: null })
  : priceForOrder(line.productId, line.priceCents)
```

After: a single batch call `getActivePromotions(productIds)` loads promotions for all distinct products in the cart (same query pattern as `store.ts`), then each line is priced:

- **Simple product** (no variantId): ratio-based discount applied, with `Math.min(line.priceCents, discounted)` as a safety floor — ensuring the promotion never charges more than the raw catalogue price (same safety logic that `priceForOrder` used via `Math.min`).
- **Variant line**: same ratio formula; the base is `variant.priceCents` from the DB (set in step 1b from `ProductVariant.priceCents` — never from browser payload). If no active promotion, raw variant price is used unchanged.

This replaces the per-line `priceForOrder` calls (which did one DB round-trip each) with a single `getActivePromotions` batch call — a performance improvement as well.

`priceForOrder` is no longer called and was removed from the import; `getActivePromotions` is imported instead.

---

## Display == charge guarantee

Both files use exactly the same formula:
```
Math.round(variantBaseCents * promotion.priceCents / promotion.basePriceCents)
```
where `variantBaseCents` comes from the DB in both cases:
- `store.ts`: `v.priceCents` from `row.variants` (the Prisma query result)
- `orders.ts`: `line.priceCents` which was set from `variant.priceCents` (the DB value, line 488 in original orders.ts) — never from the browser payload

The browser cannot influence either the base price or the ratio. The only mutable input is the variant ID, which is validated server-side.

---

## TypeScript + test results

```
npx tsc --noEmit   → 0 errors in src/
npm test           → 96 tests, 0 failures, 0 skipped
```

---

## Concerns

1. **Rounding drift across variants**: The ratio formula rounds each variant independently. For a 20% campaign on a reference product at 5000 ¢, a variant at 3750 ¢ gives `Math.round(3750 * 4000 / 5000)` = 3000 ¢ (exact). But for odd prices, two variants that differ by 1 ¢ may produce the same discounted price. This is inherent to integer arithmetic and is consistent with how `discountedPriceCents` in `lib/campaigns.ts` works for simple products.

2. **"From" price on product cards**: `product.priceCents` is set to the minimum active variant price at save time and then remapped by the existing promotion block to `promotion.priceCents` (the reference product's discounted price, not the min discounted variant). For products whose smallest variant is cheaper than the reference, the displayed "from" price may be slightly higher than the actual minimum discounted variant. This is cosmetic only — cart checkout uses `variant.priceCents` directly.

3. **`oldPriceCents` from DB variants ignored**: Each variant in the DB has its own `oldPriceCents` (a manually-set editorial strike-through). When a promotion is active, that editorial `oldPriceCents` is replaced by the variant base price (the actual pre-campaign price). This is the correct legal behavior — the strike-through must match the actual previous price, not an editorial value — but it's a deliberate override to note.
