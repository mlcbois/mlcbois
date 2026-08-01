# Bois de chauffage — produits à variations de volume (vrac & palette)

**Date :** 2026-08-01
**Statut :** conception validée oralement, en attente de relecture de la spec écrite

## 1. Objectif

Importer deux catégories de bois de chauffage sous forme de **produits à
variations**, où **le volume est la variation** et chaque volume porte **son
propre prix**, modifiable depuis le back-office :

1. **Bois de chauffage en vrac** — source : `leboisquivouschauffe.pro/bois-en-vrac`
2. **Bois de chauffage sur palette** — source : `holzkerssenbrock.de/produkt-kategorie/brennholz`

**Principe : un produit par longueur.** « Regrouper par la taille » = chaque
longueur est un produit, et ses volumes deviennent les variations. Une fiche +
une galerie par longueur, au lieu d'une fiche par volume.

Ce mécanisme ne concerne QUE ces deux catégories. Les autres produits du
catalogue (granulés, bûches compressées, poêles, allumage) restent des produits
simples à prix unique — comportement actuel inchangé.

## 2. Produits et prix à importer

Prix TTC, **valeurs de départ** issues des sites sources ; tous modifiables au
back-office.

### 2.1 Bois de chauffage EN VRAC — 3 produits

Unité : le stère. Source : `leboisquivouschauffe.pro`.

| Produit (longueur) | Variations : volume → prix total (€) |
|---|---|
| **50 cm** | 1 st 175 · 2 st 250 · 3 st 315 · 4 st 380 · 5 st 435 · 6 st 510 |
| **33 cm** | 1 st 185 · 2 st 270 · 3 st 345 · 4 st 396 · 5 st 455 · 6 st 534 · 7 st 623 |
| **25 cm** | 1 st 195 · 2 st 290 · 3 st 375 · 4 st 412 · 5 st 475 · 6 st 558 · 7 st 651 |

### 2.2 Bois de chauffage SUR PALETTE — 5 produits

Unité : le stère (≈ Raummeter de la source). Source : `holzkerssenbrock.de`.
Les volumes sont fractionnaires (1,5 / 2 / 2,5 / 3 stères).

| Produit (longueur) | Variations : volume → prix total (€) |
|---|---|
| **50 cm** | 2 st 265 · 3 st 389 |
| **40 cm** | 1,5 st 208 · 2 st 266 · 2,5 st 334 |
| **33 cm** | 2,5 st 339 · 3 st 394 |
| **30 cm** | 2 st 268 · 2,5 st 335 · 3 st 394 |
| **25 cm** | 1,8 st 233 · 2 st 269 · 3 st 395 |

- **Essences / description :** reprises de chaque source (vrac : Chêne/Charme/
  Hêtre, ~30 % d'humidité ; palette : bois dur extra-sec). Contenu **rédigé en
  français** (le site palette est allemand — on ne traduit pas la langue du site,
  on réécrit une fiche française).
- **Images :** téléchargées depuis les sites sources vers `public/images/`.

## 3. Décisions d'architecture

1. **Un produit par longueur**, une **seule dimension de variation : le volume.**
   Pas de menu « longueur » dans la fiche — la longueur est le produit.
2. **Stock global** au produit (bois coupé à la commande) : pas de stock par
   variation.
3. **Prix produit (`priceCents`) = prix minimum des variations** (« à partir de
   X € »), utilisé dans les grilles, la carte, le flux Merchant et le panier
   avant sélection.
4. **Flux Google Merchant inchangé** en phase 1 : le produit sort une fois, au
   prix « à partir de ». Offres par variation différées.

## 4. Modèle de données (Prisma)

### 4.1 Nouvelle table `ProductVariant`

```prisma
model ProductVariant {
  id            String  @id @default(cuid())
  productId     String
  // Libellé du volume, recopié tel quel dans le panier et la commande.
  label         String  // ex. "3 stères"
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

Un produit est « à variations » dès qu'il possède au moins une ligne
`ProductVariant`. Aucun champ supplémentaire sur `Product` n'est nécessaire : la
dimension (le volume) est un concept fixe de ces deux catégories, dont l'intitulé
(« Volume ») vient des traductions.

### 4.2 Champs ajoutés à `Product`

```prisma
  variants ProductVariant[]
```

`priceCents` conserve son rôle mais, pour un produit à variations, il est
recalculé = **minimum des `priceCents` des variations actives** à chaque
enregistrement.

### 4.3 Champs ajoutés à `OrderItem`

```prisma
  variantId    String? // onDelete: SetNull
  variantLabel String  @default("")
```

Le libellé recopié garde la commande lisible même si la variation disparaît
(cohérent avec l'archivage juridique des commandes déjà en place).

## 5. Panier (`src/lib/cart.ts`)

- `CartLine` reçoit `variantId?: string` et `variantLabel?: string`.
- **Clé de déduplication** d'une ligne = `productId + variantId` (deux volumes du
  même produit = deux lignes). À adapter : `addToCart`, `setCartQuantity`,
  `removeFromCart`, et les `find`/`some` sur `productId`.
- Prix et libellé figés à l'ajout, comme aujourd'hui.

## 6. Fiche produit (côté client)

`ProductPurchaseBox` : si le produit a des variations, il affiche un
**sélecteur de volume** — la liste des volumes, chacun avec **son prix total
à côté** (et le €/stère en petit), sélection par clic. Le rendu de la note
manuscrite du client.

- Le prix affiché, l'état de stock et « Ajouter au panier » suivent la variation
  choisie (`variantId`, `priceCents`, `label`).
- Avant sélection : « à partir de » + `product.priceCents`, bouton désactivé.
- Un produit **sans** variation garde l'affichage actuel (prix unique).

Le type `Product` (`src/types/home.ts`) est étendu avec la liste des variations
(`id`, `label`, `priceCents`, `oldPriceCents`), passée du serveur au composant.

## 7. Back-office — éditeur des variations

Dans `ProductForm` (`src/components/admin/ProductForm.tsx`), un bloc
**« Variations de volume »** :

- Une **liste de lignes** : libellé du volume (« 3 stères ») + prix, **modifiables
  directement**. Ajouter / retirer / réordonner une ligne.
- À l'enregistrement, les lignes sont persistées en `ProductVariant` (upsert :
  création / mise à jour / désactivation), et `priceCents` du produit est
  recalculé = minimum des prix.
- Le champ « Prix » simple reste utilisé pour les produits **sans** variation.

L'action serveur d'enregistrement produit (`src/server/store.ts` et l'action de
formulaire associée) persiste les variations dans la même transaction que le
produit.

## 8. Commande, facture, e-mails

- La création de commande recopie `variantId` + `variantLabel` dans `OrderItem`
  et lit le prix depuis la variation choisie.
- Le libellé de la variation s'affiche partout où la ligne de commande est
  rendue : confirmation, compte client, back-office commande, facture PDF
  (`src/server/invoice.ts`), e-mails (`src/server/emails/order.ts`).

## 9. Import des données (script de seed)

Un script additif et relançable (sur le modèle de `scripts/seed-brennholz.ts`,
upsert sur le slug) crée dans les deux catégories existantes du catalogue
(`bois-de-chauffage / vrac` et `bois-de-chauffage / palette`) :

- **3 produits vrac** (§ 2.1) et **5 produits palette** (§ 2.2), chacun avec ses
  variations de volume et leurs prix.
- Les images téléchargées depuis les sources.

Ne pas ressusciter les anciennes catégories d'essence supprimées : réutiliser la
structure de catégories actuelle en base.

## 10. Traductions

- Nouvelles clés d'UI (« Volume », « à partir de », « Choisir un volume »)
  ajoutées à `src/messages/fr.json` et `src/messages/en.json`.
- Libellés de variation bilingues (`label` / `labelEn`) — unité « stère »
  conservée dans les deux langues.

## 11. Hors périmètre (différé)

- **Bois pour restaurants** et toute autre catégorie (restent des produits
  simples).
- **Offres par variation dans le flux Google Merchant** (`item_group_id`).
- **Stock par variation.**

## 12. Tests

- Panier : déduplication par `productId + variantId`, ajout / retrait / quantité
  sur variations.
- `ProductPurchaseBox` : sélection d'un volume → prix et bouton mis à jour.
- Enregistrement produit : variations persistées, `priceCents` recalculé au
  minimum.
- Non-régression : un produit **sans** variation se comporte comme aujourd'hui.
