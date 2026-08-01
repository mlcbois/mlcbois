# Bois en vrac — produit à variations (longueur × volume)

**Date :** 2026-08-01
**Statut :** conception validée oralement, en attente de relecture de la spec écrite

## 1. Objectif

Importer la catégorie **« bois en vrac »** du site de référence
(`leboisquivouschauffe.pro/bois-en-vrac`) sous la forme d'**un seul produit
« variable »**, au lieu d'une fiche par quantité. Le produit porte des
**variations** ; chaque variation combine une **longueur** et un **volume** et a
**son propre prix**, modifiable depuis le back-office.

Bénéfice recherché par le client : réduire au maximum le nombre de fiches et
d'images (une fiche + une galerie au lieu de ~18), et présenter les prix comme
sur sa note manuscrite — regroupés par longueur, un prix à côté de chaque volume.

## 2. Données à importer (source : site de référence)

Trois longueurs, volumes et prix TTC relevés sur le site cible :

| Longueur | Volumes proposés | Prix total par volume (€) |
|----------|------------------|---------------------------|
| 50 cm | 1 → 6 stères | 175 · 250 · 315 · 380 · 435 · 510 |
| 33 cm | 1 → 7 stères | 185 · 270 · 345 · 396 · 455 · 534 · 623 |
| 25 cm | 1 → 7 stères | 195 · 290 · 375 · 412 · 475 · 558 · 651 |

- **Essences :** Chêne, Charme, Hêtre. **Humidité :** ~30 %.
- **Images :** téléchargées depuis le site cible vers `public/images/`.
- Les prix sont des **valeurs de départ** ; ils resteront modifiables au
  back-office.

## 3. Décisions d'architecture

1. **Un produit, deux attributs.** Le produit « Bois de chauffage en vrac » a
   deux attributs de variation : `longueur` (50/33/25 cm) et `volume`
   (1…7 stères). Les variations sont les cellules (longueur × volume)
   réellement proposées — toutes les longueurs n'ont pas le même nombre de
   volumes.
2. **Stock global** au produit (le bois est coupé à la commande) : pas de stock
   par variation.
3. **Flux Google Merchant inchangé** en phase 1 : le produit sort une fois, au
   prix « à partir de ». Les offres par variation sont différées.
4. Le prix « produit » (`priceCents`) devient le **prix minimum des variations**
   (« à partir de X € »), utilisé dans les grilles, la carte, le flux Merchant,
   et le panier avant qu'une variation soit choisie.

## 4. Modèle de données (Prisma)

### 4.1 Nouvelle table `ProductVariant`

```prisma
model ProductVariant {
  id            String  @id @default(cuid())
  productId     String
  // Sélections d'attributs sérialisées, ex. {"longueur":"50","volume":"3"}
  options       String
  // Libellé lisible recopié pour le panier et la commande, ex. "50 cm · 3 stères"
  label         String  @default("")
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

### 4.2 Champs ajoutés à `Product`

```prisma
  // Définition ordonnée des attributs de variation, en JSON :
  // [{ "key":"longueur", "label":"Longueur", "labelEn":"Length",
  //    "options":[{"value":"50","label":"50 cm","labelEn":"50 cm"}, ...] }, ...]
  // Vide ("[]") = produit simple sans variation, comportement actuel inchangé.
  variantAttributes String           @default("[]")
  variants          ProductVariant[]
```

### 4.3 Champs ajoutés à `OrderItem`

```prisma
  variantId    String? // SetNull si la variation disparaît
  variantLabel String  @default("")
```

`OrderItem.variantId` référence `ProductVariant` en `onDelete: SetNull` ; le
libellé recopié garde la commande lisible même si la variation est supprimée
(cohérent avec l'archivage juridique déjà en place sur les commandes).

## 5. Panier (`src/lib/cart.ts`)

- `CartLine` reçoit `variantId?: string` et `variantLabel?: string`.
- La **clé de déduplication** d'une ligne devient `productId + variantId` (deux
  variations du même produit = deux lignes distinctes). Points à modifier :
  `addToCart`, `setCartQuantity`, `removeFromCart`, et le `find`/`some` sur
  `productId`.
- Prix (`priceCents`) et libellé figés à l'ajout, comme aujourd'hui.

## 6. Fiche produit (côté client)

`ProductPurchaseBox` détecte `variantAttributes` non vide et rend :

1. Des boutons **Longueur** : 50 / 33 / 25 cm.
2. Sous la longueur choisie, la **liste des volumes de cette longueur**, chacun
   affichant son **prix total** (et le €/stère en petit) — le rendu de la note
   manuscrite. Sélection par clic.
3. Le prix affiché, l'état de stock et le bouton « Ajouter au panier » suivent
   la **variation sélectionnée** (`variantId`, `priceCents`, `label`).
4. Tant qu'aucune variation n'est choisie : afficher « à partir de » +
   `product.priceCents`, bouton d'ajout désactivé.

Les données de variations sont passées du serveur au composant via le type
`Product` (`src/types/home.ts`), à étendre avec `variantAttributes` et la liste
des variations (`id`, `options`, `label`, `priceCents`, `oldPriceCents`).

## 7. Back-office — éditeur de grille de prix

Dans `ProductForm` (`src/components/admin/ProductForm.tsx`), un nouveau bloc
**« Variations »** :

- Un **tableau longueurs × volumes**. Chaque cellule = le prix de la variation,
  **saisi et modifié directement**.
- Ajouter / retirer une longueur ou un volume (édition des attributs).
- À l'enregistrement, la grille est convertie en `variantAttributes` +
  liste de `ProductVariant` (upsert : création/mise à jour/désactivation).
- Le champ « Prix » simple existant reste utilisé pour les produits **sans**
  variation ; pour un produit à variations, `priceCents` est recalculé =
  minimum des prix de variation.

L'action serveur d'enregistrement produit (`src/server/store.ts` ou l'action
associée au formulaire) est étendue pour persister les variations dans la même
transaction que le produit.

## 8. Commande, facture, e-mails

- La création de commande recopie `variantId` et `variantLabel` dans
  `OrderItem`, et lit le prix depuis la variation choisie.
- Le libellé de la variation s'affiche partout où la ligne de commande est
  rendue : page de confirmation, compte client, back-office commande, facture
  PDF (`src/server/invoice.ts`), e-mails (`src/server/emails/order.ts`).

## 9. Import des données (script de seed)

Un script additif et relançable (sur le modèle de `scripts/seed-brennholz.ts`,
via upsert sur le slug) crée :

- La catégorie d'accueil du produit (groupe/catégorie « bois de chauffage /
  vrac » — réutiliser la structure existante en base ; ne pas ressusciter les
  anciennes catégories d'essence).
- Le produit **« Bois de chauffage en vrac »** avec `variantAttributes` (les
  trois longueurs et leurs volumes) et **une variation par cellule** du tableau
  du § 2, prix inclus.
- Les images téléchargées depuis le site cible.

## 10. Traductions

- Clés d'attributs et libellés bilingues : `longueur`/`Length`, `volume` ;
  libellés d'options identiques dans les deux langues (« 50 cm », « 3 stères »).
- Nouvelles clés d'UI (« Longueur », « Volume », « à partir de », « Choisir une
  option ») ajoutées à `src/messages/fr.json` et `src/messages/en.json`.

## 11. Hors périmètre (différé)

- **Bois en palettes** et **bois pour restaurants** (mêmes mécaniques ; on étend
  après validation de la mécanique sur le vrac).
- **Offres par variation dans le flux Google Merchant** (`item_group_id`).
- **Stock par variation** et **option « en 2 temps »** (confirmé sans objet).

## 12. Tests

- `src/lib/cart.test.ts` (ou équivalent) : déduplication par `productId +
  variantId`, ajout/retrait/quantité sur variations.
- Sérialisation/désérialisation de `variantAttributes` et `options`.
- Rendu de `ProductPurchaseBox` : sélection longueur → volumes filtrés → prix.
- Non-régression : un produit **sans** variation se comporte comme aujourd'hui.
