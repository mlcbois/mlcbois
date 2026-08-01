# Bois de chauffage — variations de volume (vrac & palette) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vendre le bois de chauffage vrac et palette comme des produits à variations de volume (un produit par longueur, chaque volume avec son prix, modifiable au back-office).

**Architecture:** Nouvelle table `ProductVariant` reliée à `Product`. Le prix produit (`priceCents`) devient le minimum des variations (« à partir de »). La variation choisie circule du sélecteur de fiche → panier (`CartLine`) → tunnel (`CheckoutInput`) → commande (`OrderItem`). Le back-office gère les variations dans le formulaire produit. Les autres produits (sans variation) gardent leur comportement actuel.

**Tech Stack:** Next.js 16 (App Router, React 19), Prisma 7 + PostgreSQL, next-intl, tests via `node --test --import tsx`.

## Global Constraints

- TypeScript strict, **pas de `any`**. Exports nommés, composants PascalCase, utils camelCase.
- Prix stockés **en centimes**, TTC. TVA **10 %** *contenue* dans le total (jamais un supplément).
- **Ni enum Prisma ni liste scalaire** (portabilité SQL) : les listes sont du JSON `String`.
- **Aucune confiance au navigateur** : le prix dû est toujours relu/recalculé côté base par `createOrder`.
- Français à la racine, anglais sous `/en` ; tout libellé produit a un champ `…En` (vide = repli FR).
- Tests = fonctions pures uniquement (pas de base ni de DOM), colocés en `*.test.ts`.
- Livraison France métropolitaine, unité de vente affichée : le **stère**.
- Terminer chaque message de commit git par : `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

**Branche de travail :** `bois-vrac-variations` (déjà créée, contient la spec).

---

## Découpage des fichiers

**Créés :**
- `src/lib/variantPricing.ts` — helpers purs (min prix, clé de ligne panier).
- `src/lib/variantPricing.test.ts` — tests.
- `scripts/seed-bois-variations.ts` — import des 8 produits + variations.

**Modifiés (par couche) :**
- Schéma : `prisma/schema.prisma` (+ migration).
- Types : `src/server/types.ts`, `src/types/home.ts`.
- Store : `src/server/store.ts`.
- Validation : `src/server/productInput.ts`, `src/server/checkoutInput.ts`.
- Panier : `src/lib/cart.ts`, `src/components/cart/AddToCartButton.tsx`, `src/components/cart/CartView.tsx`, `src/components/cart/CartDrawer.tsx`.
- Fiche : `src/components/ProductPurchaseBox.tsx`.
- Back-office : `src/components/admin/ProductForm.tsx`.
- Commande : `src/server/orders.ts`, puis rendu (`invoice.ts`, `emails/order.ts`, pages commande).
- Traductions : `src/messages/fr.json`, `src/messages/en.json`.

Le plan est volontairement séquencé « données → lecture → écriture → panier → tunnel → commande → rendu → import ». Chaque tâche est livrable et vérifiable seule.

---
### Task 1 : Schéma Prisma + migration

**Files:**
- Modify: `prisma/schema.prisma` (modèle `Product` ~71-121, `OrderItem` ~303-327 ; nouveau modèle `ProductVariant`)

**Interfaces:**
- Produces : table `ProductVariant`, relation `Product.variants`, colonnes `OrderItem.variantId` / `OrderItem.variantLabel`.

- [ ] **Step 1 : Ajouter le modèle `ProductVariant`** (après le modèle `Product`)

```prisma
// Variation d'un produit vendu par volume (bois vrac & palette). Le produit
// porte une variation par volume ; chacune a son prix. Un produit sans ligne
// ici reste un produit simple à prix unique.
model ProductVariant {
  id            String  @id @default(cuid())
  productId     String
  // Libellé du volume, recopié tel quel dans le panier et la commande.
  label         String
  labelEn       String  @default("")
  sku           String  @default("")
  priceCents    Int
  oldPriceCents Int?
  position      Int     @default(0)
  active        Boolean @default(true)

  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@index([productId])
}
```

- [ ] **Step 2 : Déclarer la relation sur `Product`** — dans le modèle `Product`, à côté de `reviews`, `orderItems`, etc. :

```prisma
  variants ProductVariant[]
```

- [ ] **Step 3 : Ajouter les colonnes sur `OrderItem`** — après `productId String?` :

```prisma
  variantId    String?
  variantLabel String  @default("")
```
et dans les relations de `OrderItem`, après `product Product?  @relation(...)` :
```prisma
  variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
```
puis ajouter l'index : `@@index([variantId])`

- [ ] **Step 4 : Générer la migration**

Run: `npm run db:migrate -- --name product_variants`
Expected : migration créée sous `prisma/migrations/…_product_variants`, client Prisma régénéré, aucune erreur.

- [ ] **Step 5 : Valider le schéma**

Run: `npx prisma validate`
Expected : « The schema … is valid ».

- [ ] **Step 6 : Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "$(cat <<'EOF'
Ajoute la table des variations de volume au schéma

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2 : Types de variation + helpers purs

**Files:**
- Create: `src/lib/variantPricing.ts`
- Create: `src/lib/variantPricing.test.ts`
- Modify: `src/server/types.ts` (après `ProductRecord`), `src/types/home.ts` (dans `Product`)

**Interfaces:**
- Produces :
  - `interface VariantInput { id?: string; label: string; labelEn?: string; priceCents: number; oldPriceCents?: number; position?: number; active?: boolean }`
  - `interface VariantView { id: string; label: string; priceCents: number; oldPriceCents?: number }`
  - `minActivePriceCents(variants: { priceCents: number; active?: boolean }[]): number | undefined`
  - `cartLineKey(productId: string, variantId?: string): string`

- [ ] **Step 1 : Écrire les tests**

```ts
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
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npm test -- --test-name-pattern="minActivePriceCents|cartLineKey"` (ou `node --test --import tsx src/lib/variantPricing.test.ts`)
Expected : FAIL — module `./variantPricing` introuvable.

- [ ] **Step 3 : Écrire l'implémentation**

```ts
// src/lib/variantPricing.ts

/** Vue d'une variation exposée à la boutique et au panier. */
export interface VariantView {
  id: string;
  label: string;
  priceCents: number;
  oldPriceCents?: number;
}

/** Variation transmise au serveur pour enregistrement (create/update). */
export interface VariantInput {
  id?: string;
  label: string;
  labelEn?: string;
  priceCents: number;
  oldPriceCents?: number;
  position?: number;
  active?: boolean;
}

/**
 * Prix « à partir de » : plus petit prix parmi les variations actives.
 * `undefined` si aucune variation active — l'appelant garde alors le prix
 * simple du produit.
 */
export function minActivePriceCents(
  variants: { priceCents: number; active?: boolean }[],
): number | undefined {
  const actifs = variants.filter((v) => v.active !== false).map((v) => v.priceCents);
  return actifs.length > 0 ? Math.min(...actifs) : undefined;
}

/**
 * Clé d'identité d'une ligne de panier. Deux volumes d'un même produit doivent
 * faire deux lignes ; un produit sans variation garde son seul identifiant.
 */
export function cartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}
```

- [ ] **Step 4 : Étendre les types de données** — dans `src/server/types.ts`, ajouter à l'interface `ProductRecord` :

```ts
  /** Variations de volume ; vide pour un produit simple. */
  variants?: VariantInput[];
```
et l'import en tête : `import type { VariantInput } from "@/lib/variantPricing";`

Dans `src/types/home.ts`, ajouter à l'interface `Product` :
```ts
  /** Variations de volume proposées ; vide pour un produit simple. */
  variants?: VariantView[];
```
et l'import : `import type { VariantView } from "@/lib/variantPricing";`

- [ ] **Step 5 : Lancer le test, vérifier le succès**

Run: `node --test --import tsx src/lib/variantPricing.test.ts`
Expected : PASS (5 tests).

- [ ] **Step 6 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 7 : Commit**

```bash
git add src/lib/variantPricing.ts src/lib/variantPricing.test.ts src/server/types.ts src/types/home.ts
git commit -m "$(cat <<'EOF'
Ajoute les types et helpers purs des variations de volume

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3 : Store — lire les variations

**Files:**
- Modify: `src/server/store.ts` (`productInclude` ~108-110, `ProductRow` ~76-101, `toProductRecord` ~135-160, `toViewProduct` ~458-511)

**Interfaces:**
- Consumes : `VariantInput`, `VariantView`, `minActivePriceCents` (Task 2).
- Produces : `ProductRecord.variants` et `Product.variants` remplis depuis la base.

- [ ] **Step 1 : Inclure les variations dans les requêtes** — modifier `productInclude` :

```ts
const productInclude = {
  category: { include: { group: true } },
  variants: { orderBy: { position: "asc" } },
} as const;
```

- [ ] **Step 2 : Étendre `ProductRow`** — ajouter après `category: { … }` le champ :

```ts
  variants: {
    id: string;
    label: string;
    labelEn: string;
    priceCents: number;
    oldPriceCents: number | null;
    position: number;
    active: boolean;
  }[];
```

- [ ] **Step 3 : Mapper dans `toProductRecord`** (vue admin — toutes les variations, actives ou non) :

```ts
    variants: row.variants.map((v) => ({
      id: v.id,
      label: v.label,
      labelEn: v.labelEn,
      priceCents: v.priceCents,
      oldPriceCents: v.oldPriceCents ?? undefined,
      position: v.position,
      active: v.active,
    })),
```

- [ ] **Step 4 : Mapper dans `toViewProduct`** (vue boutique — variations actives seulement) — dans l'objet `view`, ajouter :

```ts
    variants: row.variants
      .filter((v) => v.active)
      .map((v) => ({
        id: v.id,
        label: v.label,
        priceCents: v.priceCents,
        oldPriceCents: v.oldPriceCents ?? undefined,
      })),
```
Importer en tête de fichier : `import { minActivePriceCents } from "@/lib/variantPricing";` (utilisé Task 4 aussi).

- [ ] **Step 5 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/server/store.ts
git commit -m "$(cat <<'EOF'
Lit les variations de volume depuis la base

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4 : Store — écrire les variations et recalculer le prix « à partir de »

**Files:**
- Modify: `src/server/store.ts` (`createProduct` ~303-345, `updateProduct` ~358-418 ; nouvel helper `writeVariants`)

**Interfaces:**
- Consumes : `ProductRecord.variants` (`VariantInput[]`), `minActivePriceCents`.
- Produces : lignes `ProductVariant` en base ; `Product.priceCents` = min des variations actives quand il y en a.

- [ ] **Step 1 : Helper de réécriture des variations** — ajouter dans `store.ts` :

```ts
/**
 * Réécrit les variations d'un produit (ardoise propre : pas de clé naturelle
 * stable côté formulaire). Renvoie le prix « à partir de » à appliquer au
 * produit, ou undefined si le produit n'a pas de variation.
 */
async function writeVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: VariantInput[] | undefined,
): Promise<number | undefined> {
  if (variants === undefined) return undefined; // champ non transmis : ne pas toucher
  await tx.productVariant.deleteMany({ where: { productId } });
  if (variants.length === 0) return undefined;
  await tx.productVariant.createMany({
    data: variants.map((v, index) => ({
      productId,
      label: v.label,
      labelEn: v.labelEn ?? "",
      sku: "",
      priceCents: v.priceCents,
      oldPriceCents: v.oldPriceCents ?? null,
      position: v.position ?? index,
      active: v.active ?? true,
    })),
  });
  return minActivePriceCents(variants.map((v) => ({ priceCents: v.priceCents, active: v.active })));
}
```
Importer en tête : `import { Prisma } from "@/generated/prisma";` (vérifier le chemin du client généré : `generator.output` = `../src/generated/prisma`). Importer aussi `VariantInput` depuis `@/lib/variantPricing`.

- [ ] **Step 2 : Brancher dans `createProduct`** — envelopper la création dans une transaction : après `prisma.product.create(...)` (sans `include`), appeler `writeVariants(tx, row.id, input.variants)`, puis si le prix « à partir de » n'est pas `undefined`, `tx.product.update({ where: { id: row.id }, data: { priceCents: fromPrice } })`. Relire ensuite via `tx.product.findUnique({ where: { id: row.id }, include: productInclude })` et renvoyer `toProductRecord`. Utiliser `prisma.$transaction(async (tx) => { … })`.

- [ ] **Step 3 : Brancher dans `updateProduct`** — de même : dans une `prisma.$transaction`, faire le `tx.product.update` existant, puis `const fromPrice = await writeVariants(tx, id, patch.variants)`, puis si `fromPrice !== undefined` refaire `tx.product.update({ where: { id }, data: { priceCents: fromPrice } })`. Relire avec `include: productInclude` et renvoyer `toProductRecord`.

- [ ] **Step 4 : Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 5 : Vérification manuelle (base de dev)**

Créer un produit avec deux variations via un appel HTTP (ou `db:studio`), vérifier que `Product.priceCents` = min des variations et que les lignes `ProductVariant` existent.

- [ ] **Step 6 : Commit**

```bash
git add src/server/store.ts
git commit -m "$(cat <<'EOF'
Enregistre les variations et fixe le prix « à partir de » au minimum

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5 : Validation d'entrée produit — champ `variants`

**Files:**
- Modify: `src/server/productInput.ts` (`parseProductInput`)
- Create: `src/server/productInput.variants.test.ts`

**Interfaces:**
- Consumes : `VariantInput`, `toCents`.
- Produces : `ProductInput.variants?: VariantInput[]` validé.

- [ ] **Step 1 : Écrire le test**

```ts
// src/server/productInput.variants.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductInput } from "./productInput";

test("parseProductInput accepte une liste de variations valides", () => {
  const { values, errors } = parseProductInput(
    { variants: [{ label: "1 stère", price: "175,00 €" }, { label: "2 stères", price: "250,00 €" }] },
    "update",
  );
  assert.deepEqual(errors, []);
  assert.equal(values.variants?.length, 2);
  assert.equal(values.variants?.[0].priceCents, 17500);
  assert.equal(values.variants?.[0].label, "1 stère");
});

test("parseProductInput rejette une variation sans libellé", () => {
  const { errors } = parseProductInput({ variants: [{ label: "", price: "10 €" }] }, "update");
  assert.ok(errors.length > 0);
});

test("parseProductInput rejette un prix de variation invalide", () => {
  const { errors } = parseProductInput({ variants: [{ label: "1 stère", price: "0" }] }, "update");
  assert.ok(errors.length > 0);
});

test("parseProductInput accepte une liste de variations vide (efface)", () => {
  const { values, errors } = parseProductInput({ variants: [] }, "update");
  assert.deepEqual(errors, []);
  assert.deepEqual(values.variants, []);
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `node --test --import tsx src/server/productInput.variants.test.ts`
Expected : FAIL (`values.variants` indéfini).

- [ ] **Step 3 : Implémenter le parsing** — dans `parseProductInput`, avant `return { values, errors }`, ajouter :

```ts
  if (has("variants")) {
    const rawVariants = body.variants;
    if (!Array.isArray(rawVariants)) {
      errors.push("Les variations doivent être une liste.");
    } else {
      const parsed: VariantInput[] = [];
      rawVariants.forEach((entry, index) => {
        const v = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
        const label = asTrimmedString(v.label) ?? "";
        const price = asTrimmedString(v.price) ?? "";
        const oldPrice = asTrimmedString(v.oldPrice) ?? "";
        if (!label) {
          errors.push(`Variation ${index + 1} : libellé manquant.`);
          return;
        }
        if (!price || toCents(price) <= 0) {
          errors.push(`Variation ${index + 1} : prix invalide.`);
          return;
        }
        parsed.push({
          id: asTrimmedString(v.id) || undefined,
          label,
          labelEn: asTrimmedString(v.labelEn) ?? "",
          priceCents: toCents(price),
          oldPriceCents: oldPrice ? toCents(oldPrice) : undefined,
          position: asInteger(v.position) ?? index,
          active: v.active === undefined ? true : v.active !== false,
        });
      });
      if (parsed.length === rawVariants.length || rawVariants.length === 0) {
        values.variants = parsed;
      }
    }
  }
```
Importer en tête : `import type { VariantInput } from "@/lib/variantPricing";`

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `node --test --import tsx src/server/productInput.variants.test.ts`
Expected : PASS (4 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/server/productInput.ts src/server/productInput.variants.test.ts
git commit -m "$(cat <<'EOF'
Valide le champ variations à l'entrée produit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6 : Panier — identité de ligne par produit + variation

**Files:**
- Modify: `src/lib/cart.ts` (`CartLine` ~88-102, `addToCart` ~319, `setCartQuantity` ~341, `removeFromCart` ~356)
- Modify: `src/components/cart/CartView.tsx`, `src/components/cart/CartDrawer.tsx` (sites d'appel)

**Interfaces:**
- Consumes : `cartLineKey` (Task 2).
- Produces : `CartLine.variantId?`, `CartLine.variantLabel?` ; dédup par `cartLineKey(productId, variantId)`.
  - `addToCart(entry: Omit<CartLine, "quantity">, quantity: number)` (inchangé, `entry` porte désormais `variantId`)
  - `setCartQuantity(productId: string, variantId: string | undefined, quantity: number)`
  - `removeFromCart(productId: string, variantId?: string)`

- [ ] **Step 1 : Étendre `CartLine`** — ajouter après `productId` :

```ts
  /** Variation choisie (volume) ; absente pour un produit simple. */
  variantId?: string;
  variantLabel?: string;
```

- [ ] **Step 2 : Dédupliquer par clé** — importer `import { cartLineKey } from "@/lib/variantPricing";` et remplacer, dans `addToCart`, la recherche `current.find((entry) => entry.productId === line.productId)` par une comparaison de clés :

```ts
  const key = cartLineKey(line.productId, line.variantId);
  const existing = current.find((entry) => cartLineKey(entry.productId, entry.variantId) === key);
```

- [ ] **Step 3 : Adapter `setCartQuantity` et `removeFromCart`** — nouvelle signature avec `variantId` :

```ts
export function setCartQuantity(productId: string, variantId: string | undefined, quantity: number): void {
  const key = cartLineKey(productId, variantId);
  if (quantity <= 0) {
    removeFromCart(productId, variantId);
    return;
  }
  commit(
    getCartSnapshot().map((entry) =>
      cartLineKey(entry.productId, entry.variantId) === key ? { ...entry, quantity } : entry,
    ),
  );
}

export function removeFromCart(productId: string, variantId?: string): void {
  const key = cartLineKey(productId, variantId);
  commit(getCartSnapshot().filter((entry) => cartLineKey(entry.productId, entry.variantId) !== key));
}
```

- [ ] **Step 4 : Mettre à jour les sites d'appel** — dans `CartView.tsx` et `CartDrawer.tsx`, chaque appel `setCartQuantity(line.productId, n)` devient `setCartQuantity(line.productId, line.variantId, n)` et `removeFromCart(line.productId)` devient `removeFromCart(line.productId, line.variantId)`. Afficher `line.variantLabel` sous le nom de l'article quand il est présent. (Localiser via : `grep -rn "setCartQuantity\|removeFromCart" src/components`.)

- [ ] **Step 5 : Vérifier compilation + tests existants**

Run: `npx tsc --noEmit && npm test`
Expected : compilation OK, tests au vert.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/cart.ts src/components/cart
git commit -m "$(cat <<'EOF'
Identifie une ligne de panier par produit et variation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7 : Bouton d'ajout — porter la variation

**Files:**
- Modify: `src/components/cart/AddToCartButton.tsx` (props ~11-46, `ajouter` ~62-64)

**Interfaces:**
- Consumes : `CartLine.variantId/variantLabel`.
- Produces : props optionnelles `variantId?`, `variantLabel?` transmises à `add(...)`.

- [ ] **Step 1 : Ajouter les props** — dans `AddToCartButtonProps` :

```ts
  /** Variation choisie (volume) ; absente pour un produit simple. */
  variantId?: string;
  variantLabel?: string;
```
Les déstructurer dans la signature du composant.

- [ ] **Step 2 : Les transmettre à l'ajout** — remplacer `ajouter` :

```ts
  function ajouter() {
    add({ productId, slug, brand, name, image, path, priceCents, stock, variantId, variantLabel }, quantity);
  }
```

- [ ] **Step 3 : Vérifier compilation**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/components/cart/AddToCartButton.tsx
git commit -m "$(cat <<'EOF'
Transmet la variation choisie au panier

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8 : Fiche produit — sélecteur de volume

**Files:**
- Modify: `src/components/ProductPurchaseBox.tsx`
- Modify: `src/messages/fr.json`, `src/messages/en.json` (section `product`)

**Interfaces:**
- Consumes : `Product.variants` (`VariantView[]`), `formatCents` (`@/lib/cart`).
- Produces : sélection d'un volume → prix, stock et bouton d'ajout pilotés par la variation.

- [ ] **Step 1 : Ajouter les clés de traduction** — dans `product` de `fr.json` : `"chooseVolume": "Choisissez un volume"`, `"fromPrice": "à partir de"`, `"perStere": "le stère"`. Dans `en.json` : `"chooseVolume": "Choose a volume"`, `"fromPrice": "from"`, `"perStere": "per stère"`.

- [ ] **Step 2 : Gérer l'état de sélection** — au début du composant :

```ts
"use client";
import { useState } from "react";
import { formatCents } from "@/lib/cart";
// …
const variants = product.variants ?? [];
const hasVariants = variants.length > 0;
const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
const selected = variants.find((v) => v.id === selectedId);
const displayPriceCents = selected?.priceCents ?? product.priceCents ?? 0;
```

- [ ] **Step 3 : Rendu du sélecteur** — quand `hasVariants`, remplacer l'affichage du prix unique par : le prix « à partir de » tant qu'aucune variation n'est choisie, puis la liste des volumes (chaque bouton affiche `v.label` et `formatCents(v.priceCents)`), le bouton sélectionné passant en surbrillance :

```tsx
{hasVariants ? (
  <div className="flex flex-col gap-2">
    <p className="text-sm font-semibold text-foreground">{t("chooseVolume")}</p>
    {!selected && (
      <p className="text-3xl font-black text-primary">
        <span className="text-sm font-normal text-muted-foreground">{t("fromPrice")} </span>
        {formatCents(product.priceCents ?? 0)}
      </p>
    )}
    <ul className="flex flex-col gap-1.5">
      {variants.map((v) => (
        <li key={v.id}>
          <button
            type="button"
            onClick={() => setSelectedId(v.id)}
            aria-pressed={selectedId === v.id}
            className={`flex w-full items-center justify-between rounded-sm border px-3 py-2 text-sm transition-colors ${
              selectedId === v.id ? "border-primary bg-muted font-bold" : "border-border hover:bg-muted"
            }`}
          >
            <span>{v.label}</span>
            <span className="font-bold text-primary">{formatCents(v.priceCents)}</span>
          </button>
        </li>
      ))}
    </ul>
    {selected && <p className="text-3xl font-black text-primary">{formatCents(selected.priceCents)}</p>}
  </div>
) : (
  /* bloc de prix simple existant, inchangé */
)}
```

- [ ] **Step 4 : Piloter le bouton d'ajout** — passer la variation choisie à `AddToCartButton`, et désactiver l'ajout tant que rien n'est choisi sur un produit à variations :

```tsx
<AddToCartButton
  productId={product.id ?? ""}
  slug={product.slug ?? ""}
  brand={product.brand}
  name={product.name}
  image={product.image}
  path={product.href}
  priceCents={displayPriceCents}
  stock={hasVariants && !selected ? 0 : (product.stock ?? 0)}
  variantId={selected?.id}
  variantLabel={selected?.label}
  withBuyNow
/>
```
(Le `stock = 0` tant qu'aucune variation n'est choisie réutilise l'état « épuisé » déjà géré par le bouton pour le désactiver ; ajouter un libellé d'aide « Choisissez un volume » au-dessus si besoin.)

- [ ] **Step 5 : Vérifier compilation + build**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 6 : Vérification manuelle**

Sur une fiche à variations, cliquer un volume met à jour le prix et active « Ajouter au panier » ; la ligne de panier porte le bon volume et le bon prix.

- [ ] **Step 7 : Commit**

```bash
git add src/components/ProductPurchaseBox.tsx src/messages/fr.json src/messages/en.json
git commit -m "$(cat <<'EOF'
Affiche le sélecteur de volume sur la fiche produit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9 : Tunnel — transmettre la variation dans la charge utile

**Files:**
- Modify: `src/server/checkoutInput.ts` (`CheckoutInput.items` ~62, boucle de parsing ~154-172)
- Create: `src/server/checkoutInput.variants.test.ts`

**Interfaces:**
- Produces : `CheckoutInput.items: { productId: string; variantId?: string; quantity: number }[]` ; dédup par `productId + variantId`.

- [ ] **Step 1 : Écrire le test**

```ts
// src/server/checkoutInput.variants.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCheckoutPayload } from "./checkoutInput";

const base = {
  email: "jean@exemple.fr", phone: "0612345678",
  billing: { firstName: "Jean", lastName: "Dupont", street: "1 rue des Bois", postalCode: "75001", city: "Paris", country: "FR" },
  shippingSameAsBilling: true, paymentMethodKey: "virement",
  termsAccepted: true, withdrawalAcknowledged: true,
};

test("deux variations d'un même produit font deux lignes", () => {
  const { input, errors } = parseCheckoutPayload({
    ...base,
    items: [
      { productId: "p1", variantId: "v1", quantity: 1 },
      { productId: "p1", variantId: "v2", quantity: 2 },
    ],
  });
  assert.deepEqual(errors, []);
  assert.equal(input?.items.length, 2);
  assert.equal(input?.items[1].variantId, "v2");
});

test("la même variation deux fois est dédupliquée", () => {
  const { input } = parseCheckoutPayload({
    ...base,
    items: [
      { productId: "p1", variantId: "v1", quantity: 1 },
      { productId: "p1", variantId: "v1", quantity: 3 },
    ],
  });
  assert.equal(input?.items.length, 1);
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `node --test --import tsx src/server/checkoutInput.variants.test.ts`
Expected : FAIL (deux lignes fusionnées ou `variantId` absent).

- [ ] **Step 3 : Implémenter** — étendre le type `items` avec `variantId?: string`, puis dans la boucle : lire `const variantId = text(line.variantId, 60) || undefined;`, construire la clé de dédup `const dedup = variantId ? `${productId}::${variantId}` : productId;` et l'utiliser dans `seen` à la place de `productId`. Pousser `{ productId, variantId, quantity }`.

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `node --test --import tsx src/server/checkoutInput.variants.test.ts && npm test`
Expected : PASS, aucune régression.

- [ ] **Step 5 : Commit**

```bash
git add src/server/checkoutInput.ts src/server/checkoutInput.variants.test.ts
git commit -m "$(cat <<'EOF'
Transmet la variation dans la charge utile du tunnel

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10 : Commande — prix serveur de la variation + écriture

**Files:**
- Modify: `src/server/orders.ts` (`createOrder` ~430-620 : chargement produits ~436-449, construction des lignes ~453-474, écriture des items ~591-602)

**Interfaces:**
- Consumes : `CheckoutInput.items[].variantId`.
- Produces : lignes de commande au prix de la variation ; `OrderItem.variantId` + `variantLabel` renseignés.

- [ ] **Step 1 : Charger les variations utiles** — après le `findMany` des produits, charger les variations citées :

```ts
  const variantIds = input.items.map((i) => i.variantId).filter((x): x is string => !!x);
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds }, active: true },
        select: { id: true, productId: true, label: true, priceCents: true },
      })
    : [];
  const variantById = new Map(variants.map((v) => [v.id, v]));
```

- [ ] **Step 2 : Prix et libellé par ligne** — dans la boucle de construction des `lines`, quand `item.variantId` est présent : récupérer `const variant = variantById.get(item.variantId);` ; si absent ou `variant.productId !== product.id`, `throw new OrderError("product_unavailable")`. Utiliser `variant.priceCents` comme `priceCents` de la ligne et propager `variantId`/`variantLabel`. Étendre le type local `CartLine`/l'objet poussé avec `variantId` et `variantLabel: variant?.label ?? ""`.

- [ ] **Step 3 : Écrire dans `OrderItem`** — dans le bloc `items: { create: lines.map(...) }`, ajouter les champs :

```ts
        variantId: line.variantId ?? null,
        variantLabel: line.variantLabel ?? "",
```
(Le prix `unitPriceCents: line.priceCents` porte déjà le prix de la variation ; le moteur de promotions ne s'applique pas aux lignes à variation — le prix de la variation fait foi.)

- [ ] **Step 4 : Vérifier que `priceForOrder` ne réécrase pas** — s'assurer que la ligne à variation utilise bien `variant.priceCents` et non le prix produit remisé. Si `priceForOrder(line.productId, line.priceCents)` (~483) est appliqué à toutes les lignes, l'exclure pour les lignes portant un `variantId` (renvoyer `line.priceCents` tel quel).

- [ ] **Step 5 : Vérifier compilation**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 6 : Vérification manuelle** — passer une commande avec deux volumes d'un même produit ; vérifier en base que chaque `OrderItem` porte le bon `unitPriceCents`, `variantId` et `variantLabel`.

- [ ] **Step 7 : Commit**

```bash
git add src/server/orders.ts
git commit -m "$(cat <<'EOF'
Facture la commande au prix de la variation choisie

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11 : Rendu de la variation dans les commandes

**Files:**
- Modify: `src/server/orders.ts` (type `OrderItemRecord` ~55-64, mapping ~190-199)
- Modify: `src/server/invoice.ts`, `src/server/emails/order.ts`
- Modify: pages commande : `src/app/[locale]/confirmation/[orderNumber]/page.tsx`, `src/app/[locale]/compte/commandes/[orderNumber]/page.tsx`, `src/app/admin/(protected)/orders/[id]/page.tsx`

**Interfaces:**
- Consumes : `OrderItem.variantLabel`.
- Produces : `OrderItemRecord.variantLabel` affiché sous chaque ligne.

- [ ] **Step 1 : Exposer `variantLabel`** — dans le type `OrderItemRecord` ajouter `variantLabel: string;` ; dans le mapping (~190-199) ajouter `variantLabel: item.variantLabel ?? "",` ; s'assurer que le `select`/`include` des items lit `variantLabel`.

- [ ] **Step 2 : Afficher le libellé** — dans chaque endroit qui rend le nom d'une ligne (`invoice.ts`, `emails/order.ts`, et les trois pages), afficher `item.variantLabel` en second, sous le nom, quand il est non vide. Suivre le style d'affichage du nom déjà présent (même composant/même helper). Localiser via : `grep -rn "\.name" src/server/invoice.ts src/server/emails/order.ts`.

- [ ] **Step 3 : Vérifier compilation + tests e-mail**

Run: `npx tsc --noEmit && node --test --import tsx src/server/emails/order.test.ts`
Expected : compilation OK, test e-mail au vert (adapter l'attendu si le gabarit change).

- [ ] **Step 4 : Commit**

```bash
git add src/server/orders.ts src/server/invoice.ts src/server/emails src/app
git commit -m "$(cat <<'EOF'
Affiche le volume choisi dans les commandes, factures et e-mails

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12 : Back-office — éditeur de variations

**Files:**
- Modify: `src/components/admin/ProductForm.tsx` (état ~40-70, corps du formulaire, charge utile de soumission)

**Interfaces:**
- Consumes : `ProductRecord.variants` (`initialData`), routes `POST /api/admin/products` et `PUT /api/admin/products/[id]` (champ `variants`).
- Produces : bloc d'édition « Variations de volume » ; envoi de `variants` dans le corps JSON.

- [ ] **Step 1 : État local des variations** — ajouter :

```ts
interface VariantRow { id?: string; label: string; price: string; oldPrice: string }
const [variants, setVariants] = useState<VariantRow[]>(
  (initialData?.variants ?? []).map((v) => ({
    id: v.id,
    label: v.label,
    price: (v.priceCents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
    oldPrice: v.oldPriceCents ? (v.oldPriceCents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : "",
  })),
);
```

- [ ] **Step 2 : UI d'édition** — sous le champ « Prix », ajouter un bloc listant les lignes de variation : pour chaque ligne, un champ « Volume » (`label`), un champ « Prix », un champ « Ancien prix » (facultatif), et un bouton « Retirer ». Un bouton « Ajouter un volume » ajoute une ligne vide. Réordonnancement facultatif (l'ordre du tableau fait `position`). Style aligné sur les autres champs du formulaire.

- [ ] **Step 3 : Inclure `variants` dans la soumission** — dans la fonction qui construit le corps JSON (POST/PUT), ajouter :

```ts
  variants: variants
    .filter((v) => v.label.trim() && v.price.trim())
    .map((v, index) => ({
      id: v.id,
      label: v.label.trim(),
      price: v.price.trim(),
      oldPrice: v.oldPrice.trim(),
      position: index,
      active: true,
    })),
```
(Ne pas envoyer `variants` du tout si le produit ne doit pas avoir de variation — ou envoyer `[]` pour effacer. Un produit simple laisse le tableau vide et n'ajoute pas la clé.)

- [ ] **Step 4 : Vérifier compilation + build**

Run: `npx tsc --noEmit`
Expected : aucune erreur.

- [ ] **Step 5 : Vérification manuelle** — éditer un produit, ajouter deux volumes avec prix, enregistrer, rouvrir : les variations sont là, `priceCents` produit = min.

- [ ] **Step 6 : Commit**

```bash
git add src/components/admin/ProductForm.tsx
git commit -m "$(cat <<'EOF'
Ajoute l'éditeur de variations au formulaire produit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13 : Import — script de seed des 8 produits

**Files:**
- Create: `scripts/seed-bois-variations.ts`

**Interfaces:**
- Consumes : Prisma (`@/server/prisma`), catégories existantes `bois-de-chauffage/vrac` et `bois-de-chauffage/palette`.
- Produces : 3 produits vrac + 5 produits palette, chacun avec ses variations.

- [ ] **Step 1 : Vérifier les catégories cibles** — confirmer en base l'existence des groupes/catégories `bois-de-chauffage` › `vrac` et `bois-de-chauffage` › `palette` (via `db:studio`). Si absentes, les créer dans le script par `upsert` (groupe `bois-de-chauffage`, catégories `vrac` et `palette`) — ne PAS recréer d'anciennes catégories d'essence.

- [ ] **Step 2 : Écrire le script** — structure additive et relançable (upsert sur `slug`), sur le modèle de `scripts/seed-brennholz.ts`. Données (prix TTC, en euros) :

```ts
// Chaque produit : { slug, longueurCm, image, variations: [{ stere, prix }] }
const VRAC = [
  { slug: "bois-vrac-50cm", longueurCm: 50, variations: [
    { s: "1 stère", p: 175 }, { s: "2 stères", p: 250 }, { s: "3 stères", p: 315 },
    { s: "4 stères", p: 380 }, { s: "5 stères", p: 435 }, { s: "6 stères", p: 510 } ] },
  { slug: "bois-vrac-33cm", longueurCm: 33, variations: [
    { s: "1 stère", p: 185 }, { s: "2 stères", p: 270 }, { s: "3 stères", p: 345 },
    { s: "4 stères", p: 396 }, { s: "5 stères", p: 455 }, { s: "6 stères", p: 534 }, { s: "7 stères", p: 623 } ] },
  { slug: "bois-vrac-25cm", longueurCm: 25, variations: [
    { s: "1 stère", p: 195 }, { s: "2 stères", p: 290 }, { s: "3 stères", p: 375 },
    { s: "4 stères", p: 412 }, { s: "5 stères", p: 475 }, { s: "6 stères", p: 558 }, { s: "7 stères", p: 651 } ] },
];
const PALETTE = [
  { slug: "bois-palette-50cm", longueurCm: 50, variations: [ { s: "2 stères", p: 265 }, { s: "3 stères", p: 389 } ] },
  { slug: "bois-palette-40cm", longueurCm: 40, variations: [ { s: "1,5 stère", p: 208 }, { s: "2 stères", p: 266 }, { s: "2,5 stères", p: 334 } ] },
  { slug: "bois-palette-33cm", longueurCm: 33, variations: [ { s: "2,5 stères", p: 339 }, { s: "3 stères", p: 394 } ] },
  { slug: "bois-palette-30cm", longueurCm: 30, variations: [ { s: "2 stères", p: 268 }, { s: "2,5 stères", p: 335 }, { s: "3 stères", p: 394 } ] },
  { slug: "bois-palette-25cm", longueurCm: 25, variations: [ { s: "1,8 stère", p: 233 }, { s: "2 stères", p: 269 }, { s: "3 stères", p: 395 } ] },
];
```
Pour chaque produit : `name` = ex. « Bois de chauffage en vrac 50 cm » / « … sur palette 50 cm » ; `nameEn` équivalent ; `brand` = « MLC Bois » ; `shortDescription` = essences (Chêne, Charme, Hêtre) + humidité (vrac ~30 %, palette extra-sec) ; `image` = chemin sous `/images/bois/…` (Task 14) ; `priceCents` = min des variations × 100 ; `googleProductCategory` = celle de `seed-brennholz.ts`. Upsert le produit sur `slug`, puis `deleteMany` + `createMany` des `ProductVariant` (label = `s`, labelEn = même, priceCents = `p*100`, position = index).

- [ ] **Step 3 : Lancer le script**

Run: `node --env-file=.env --import tsx scripts/seed-bois-variations.ts`
Expected : « … 8 produits, N variations » sans erreur.

- [ ] **Step 4 : Vérifier** — dans la boutique (dev), les fiches vrac/palette montrent le sélecteur de volume aux bons prix.

- [ ] **Step 5 : Commit**

```bash
git add scripts/seed-bois-variations.ts
git commit -m "$(cat <<'EOF'
Importe les produits vrac et palette avec leurs variations

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14 : Images des produits

**Files:**
- Create: `public/images/bois/*.jpg` (8 visuels)
- Optionnel : `scripts/download-bois-images.ts`

**Interfaces:**
- Produces : les visuels référencés par le seed (Task 13).

- [ ] **Step 1 : Récupérer les visuels** — depuis les pages sources (`leboisquivouschauffe.pro/bois-en-vrac` et `holzkerssenbrock.de/produkt-kategorie/brennholz`), télécharger un visuel représentatif par longueur/conditionnement. En attendant, réutiliser une image de repli existante (`/images/brennholz/lose-schuettung.jpg` pour le vrac, `/images/brennholz/palette-box.jpg` pour la palette) afin que les fiches ne soient jamais sans image.
- [ ] **Step 2 : Placer les fichiers** sous `public/images/bois/` avec les noms attendus par le seed, et vérifier qu'ils s'affichent (dimensions raisonnables, format JPG/WebP).
- [ ] **Step 3 : Commit**

```bash
git add public/images/bois scripts/download-bois-images.ts
git commit -m "$(cat <<'EOF'
Ajoute les visuels des produits bois vrac et palette

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Vérification finale (avant de clore la branche)

- [ ] `npx tsc --noEmit` — aucune erreur.
- [ ] `npm test` — tous les tests au vert.
- [ ] `npm run lint` — aucune erreur.
- [ ] `npm run build` — build de production réussi.
- [ ] Parcours manuel : fiche à variations → choix d'un volume → panier (deux volumes = deux lignes) → commande → confirmation, e-mail et facture affichent le volume ; back-office : modifier un prix de variation se reflète en boutique ; un produit **simple** se comporte comme avant.

## Auto-revue du plan (couverture de la spec)

- Spec §4 (schéma) → Task 1 ✓ · §4.1/4.2 lecture → Task 3 ✓ · écriture → Task 4 ✓
- Spec §5 (panier) → Task 6 ✓
- Spec §6 (fiche client) → Task 8 (+ Task 7 bouton) ✓
- Spec §7 (back-office) → Task 12 (+ Task 5 validation) ✓
- Spec §8 (commande/facture/e-mails) → Tasks 9, 10, 11 ✓
- Spec §9 (import) → Task 13 ✓ · images → Task 14 ✓
- Spec §10 (traductions) → Task 8 (clés fiche) ✓ ; libellés variations bilingues via seed/éditeur.
- Spec §3 (prix « à partir de » = min) → Tasks 4 & 3 ✓
- Hors périmètre (§11) : restaurants, offres Merchant par variation, stock par variation — non traités, conforme.


