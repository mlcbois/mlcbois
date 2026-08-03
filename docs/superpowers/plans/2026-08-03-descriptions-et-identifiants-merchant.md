# Descriptions produit et identifiants Merchant — plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser
> `superpowers:subagent-driven-development` (recommandé) ou
> `superpowers:executing-plans` pour dérouler ce plan tâche par tâche. Les étapes
> utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** doter les 35 produits du catalogue de descriptions conformes à Google
Merchant Center et des identifiants (GTIN, MPN) réellement vérifiables, en français et en
anglais.

**Architecture :** le contenu vit dans un module versionné indexé par SKU
(`scripts/data/product-content.ts`) ; un script idempotent l'applique en base par
`prisma.product.update`. Un validateur de checksum GTIN garde la porte : aucun identifiant
non conforme n'atteint la base. Le module `src/server/merchant.ts` est nettoyé de ses
résidus allemands au passage.

**Pile technique :** TypeScript strict, Prisma 7 (client généré dans
`src/generated/prisma`), `node:test` + `node:assert/strict`, `tsx` pour les scripts.

## Contraintes globales

- Base visée : **Neon de production**. Tout script écrivant en base exporte au préalable
  l'état des produits touchés.
- **Aucun GTIN inventé.** Checksum valide + source identifiable, sinon champ laissé `null`.
- **Aucune donnée technique inventée** (humidité, kWh, poids, rendement, classe énergie) :
  elle provient des `bullets` en base ou d'une source constructeur vérifiée.
- Descriptions FR : **400 à 800 caractères**. Interdits : texte promotionnel, HTML,
  capitales d'emphase, emoji, lien, mention de la boutique, comparaison concurrentielle,
  répétition littérale du titre.
- `shortDescription` : une phrase, environ 140 caractères, **distincte** de `description`.
- Aucun mot allemand nulle part — ni en base, ni dans le code, ni dans le flux.
- Commentaires de code en français, TypeScript strict, pas de `any`.
- **`git add -A` et `git commit -a` sont proscrits.** L'arbre contient une intégration
  Square non commitée, étrangère à ce plan : n'indexer que des chemins nommés
  explicitement, et ne jamais toucher à `src/server/gateways/`, `docs/PAIEMENT-SQUARE.md`,
  `docs/DEPLOY.md`, `docs/HANDOVER.md` ni `src/components/admin/GatewaySettingsForm.tsx`.
- Tests lancés par `npm test` (motif `src/**/*.test.ts`). Les scripts de `scripts/` ne sont
  pas couverts par ce motif : leur logique testable vit donc dans `src/lib/`.
- **`npm test` ne suffit pas comme preuve** : `tsx` transpile sans vérifier les types.
  Chaque tâche doit aussi rendre `npx tsc --noEmit -p .` sans aucune erreur, et le
  reporter. Une régression de typage y échappe autrement jusqu'au `npm run build`.

---

### Tâche 1 : validateur de GTIN

Le seul rempart automatique contre un identifiant erroné. Il est écrit en premier parce
que les tâches de recherche s'en servent pour trancher.

**Fichiers :**
- Créer : `src/lib/gtin.ts`
- Test : `src/lib/gtin.test.ts`

**Interfaces :**
- Consomme : rien.
- Produit : `isValidGtin(value: string): boolean`, utilisé par les tâches 3, 4 et 5.

- [ ] **Étape 1 : écrire le test qui échoue**

```ts
// src/lib/gtin.test.ts
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
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

Lancer : `npm test`
Attendu : ÉCHEC, `Cannot find module './gtin'`.

- [ ] **Étape 3 : écrire l'implémentation minimale**

```ts
// src/lib/gtin.ts

// Longueurs admises par Google : EAN-8, UPC-A, EAN-13 et GTIN-14.
const LONGUEURS_ADMISES = new Set([8, 12, 13, 14]);

/**
 * Vérifie la clé de contrôle d'un GTIN.
 *
 * Un code dont le checksum est faux est nécessairement erroné. Le refuser ici
 * évite qu'il ne parte dans le flux : chez Google, un identifiant faux n'entraîne
 * pas le simple refus du produit mais expose à la suspension du compte.
 */
export function isValidGtin(value: string): boolean {
  const code = value.trim();
  if (!/^\d+$/.test(code)) return false;
  if (!LONGUEURS_ADMISES.has(code.length)) return false;

  const chiffres = [...code].map(Number);
  const controle = chiffres.pop();
  if (controle === undefined) return false;

  // Pondération alternée 3 puis 1, en partant du chiffre le plus à droite du corps.
  let somme = 0;
  let poids = 3;
  for (let i = chiffres.length - 1; i >= 0; i--) {
    somme += chiffres[i] * poids;
    poids = poids === 3 ? 1 : 3;
  }

  return (10 - (somme % 10)) % 10 === controle;
}
```

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

Lancer : `npm test`
Attendu : SUCCÈS sur les cinq tests de `gtin.test.ts`.

- [ ] **Étape 5 : commiter**

```bash
git add src/lib/gtin.ts src/lib/gtin.test.ts
git commit -m "Ajoute la vérification du checksum GTIN"
```

---

### Tâche 2 : nettoyage de l'allemand résiduel

**Fichiers :**
- Modifier : `src/server/merchant.ts:341-344` et `src/server/merchant.ts:520`
- Test : `src/server/merchant.test.ts` (à créer — ce module n'a aucun test aujourd'hui)

**Interfaces :**
- Consomme : `buildMerchantRecord`, `merchantDescription`, `MerchantProduct`, tous déjà
  exportés par `src/server/merchant.ts`.
- Produit : rien de nouveau. Les signatures restent inchangées.

- [ ] **Étape 1 : écrire le test qui échoue**

Le repli de description ne se déclenche qu'en deçà de 80 caractères ; le test fabrique
donc un produit à description courte pour l'atteindre.

```ts
// src/server/merchant.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMerchantRecord, merchantDescription, type MerchantProduct } from "./merchant";

/** Produit minimal, complété au cas par cas dans chaque test. */
function produit(surcharge: Partial<MerchantProduct> = {}): MerchantProduct {
  return {
    id: "p1",
    brand: "MLC Bois",
    name: "Hêtre 25 cm",
    slug: "hetre-25-cm",
    sku: "MLCBOISHET",
    shortDescription: "Bûches de hêtre.",
    description: "Bûches de hêtre.",
    bullets: JSON.stringify(["Humidité sous 18 %", "Longueur 25 cm"]),
    gtin: null,
    mpn: null,
    condition: "new",
    googleProductCategory: "",
    shippingWeightGrams: null,
    energyEfficiencyClass: null,
    image: "/images/hetre.jpg",
    images: "[]",
    priceCents: 25000,
    oldPriceCents: null,
    stock: 4,
    active: true,
    category: {
      slug: "vrac",
      label: "Bois en vrac",
      description: "Bois de chauffage livré en vrac.",
      image: "/images/vrac.jpg",
      group: { slug: "bois-de-chauffage", label: "Bois de chauffage" },
    },
    ...surcharge,
  } as MerchantProduct;
}

const MOTS_ALLEMANDS = ["von", "Ausstattung", "Zustand", "fabrikneu", "originalverpackt", "Aktion"];

test("le repli de description ne contient aucun mot allemand", () => {
  // Description sous 80 caractères : c'est le seul cas qui déclenche le repli.
  const texte = merchantDescription(produit({ description: "Bûches.", shortDescription: "Bûches." }));
  for (const mot of MOTS_ALLEMANDS) {
    assert.ok(
      !new RegExp(`\\b${mot}\\b`).test(texte),
      `« ${mot} » ne doit plus apparaître dans : ${texte}`,
    );
  }
});

test("le repli reprend les bullets et l'état du produit", () => {
  const texte = merchantDescription(produit({ description: "Bûches.", shortDescription: "Bûches." }));
  assert.ok(texte.includes("Humidité sous 18 %"), texte);
  assert.ok(texte.includes("neuf"), texte);
});

test("une description déjà fournie n'est pas remplacée par le repli", () => {
  const longue = "Bûches de hêtre fendues à 25 cm, séchées sous 18 % d'humidité sur brut, prêtes à brûler.";
  assert.equal(merchantDescription(produit({ description: longue })), longue);
});

test("customLabel1 est en français sur un produit en promotion", () => {
  const record = buildMerchantRecord(produit({ priceCents: 20000, oldPriceCents: 25000 }));
  assert.equal(record.customLabel1, "Promotion");
});

test("customLabel1 reste vide hors promotion", () => {
  const record = buildMerchantRecord(produit());
  assert.equal(record.customLabel1, undefined);
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

Lancer : `npm test`
Attendu : ÉCHEC sur « le repli de description ne contient aucun mot allemand » (« von »
présent) et sur « customLabel1 est en français » (reçoit `"Aktion"`).

- [ ] **Étape 3 : traduire le repli**

Remplacer `src/server/merchant.ts:340-346` par :

```ts
  const bullets = parseBullets(product.bullets);
  const parts = [
    `${product.brand} ${product.name} — ${product.category.label} par ${product.brand}.`,
    plainText(product.category.description),
    bullets.length > 0 ? `Caractéristiques : ${bullets.join(", ")}.` : "",
    conditionFor(product.condition) === "new" ? "État : neuf, jamais utilisé." : "",
    own,
  ];
```

- [ ] **Étape 4 : traduire le libellé de campagne**

Remplacer `src/server/merchant.ts:520` par :

```ts
    customLabel1: onSale ? "Promotion" : undefined,
```

- [ ] **Étape 5 : lancer les tests et vérifier qu'ils passent**

Lancer : `npm test`
Attendu : SUCCÈS sur les cinq tests de `merchant.test.ts`.

- [ ] **Étape 6 : vérifier qu'il ne reste aucun mot allemand dans le module**

Lancer : `grep -nE '\b(von|Ausstattung|Zustand|fabrikneu|originalverpackt|Aktion)\b' src/server/merchant.ts`
Attendu : aucune sortie.

- [ ] **Étape 7 : commiter**

```bash
git add src/server/merchant.ts src/server/merchant.test.ts
git commit -m "Francise le repli de description et le libellé de campagne du flux"
```

---

### Tâche 3 : module de contenu et script d'application

**Fichiers :**
- Créer : `src/lib/productContent.ts` (types et validation — dans `src/lib` pour être
  couvert par `npm test`)
- Test : `src/lib/productContent.test.ts`
- Créer : `scripts/data/product-content.ts` (les données, vide à ce stade)
- Créer : `scripts/apply-product-content.ts` (sauvegarde puis écriture)
- Supprimer : `scripts/enrich-merchant-data.ts` (calibré sur l'électroménager allemand)
- Modifier : `package.json` (script `content:apply`)

**Interfaces :**
- Consomme : `normalizeGtin` de la tâche 1.
- Produit : le type `ProductContent`, la constante `PRODUCT_CONTENT: ProductContent[]` et
  `validateProductContent(entries: ProductContent[]): string[]` (liste des anomalies, vide
  si tout est conforme). Les tâches 4 à 8 remplissent `PRODUCT_CONTENT`.

- [ ] **Étape 1 : écrire le test qui échoue**

```ts
// src/lib/productContent.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateProductContent, type ProductContent } from "./productContent";

function entree(surcharge: Partial<ProductContent> = {}): ProductContent {
  return {
    sku: "MLCBOISHET",
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

test("un SKU en double est signalé", () => {
  const anomalies = validateProductContent([entree(), entree()]);
  assert.ok(anomalies.some((a) => a.includes("double")), anomalies.join(" | "));
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

Lancer : `npm test`
Attendu : ÉCHEC, `Cannot find module './productContent'`.

- [ ] **Étape 3 : écrire les types et la validation**

```ts
// src/lib/productContent.ts
import { isValidGtin } from "./gtin";

/** Contenu rédigé pour un produit, appliqué en base par son SKU. */
export interface ProductContent {
  sku: string;
  description: string;
  shortDescription: string;
  descriptionEn: string;
  shortDescriptionEn: string;
  /** Écrit seulement si le checksum est valide et la source identifiable. */
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  shippingWeightGrams?: number;
  energyEfficiencyClass?: string;
}

const LONGUEUR_MIN = 400;
const LONGUEUR_MAX = 800;

// Vocabulaire commercial que Google refuse dans une description : il décrit
// l'offre du marchand, pas le produit.
const MOTS_PROMOTIONNELS = [
  "livraison offerte",
  "livraison gratuite",
  "meilleur prix",
  "prix imbattable",
  "promotion",
  "soldes",
  "déstockage",
  "offre spéciale",
  "profitez",
  "commandez",
];

const MOTS_ALLEMANDS = ["Ausstattung", "Zustand", "fabrikneu", "originalverpackt", "Aktion"];

/**
 * Contrôle la conformité du contenu avant écriture. Rend la liste des anomalies,
 * vide si tout est conforme. Ne lève pas : l'appelant décide quoi en faire.
 */
export function validateProductContent(entries: ProductContent[]): string[] {
  const anomalies: string[] = [];
  const vus = new Set<string>();

  for (const entry of entries) {
    const ou = `[${entry.sku}]`;

    if (vus.has(entry.sku)) anomalies.push(`${ou} SKU en double`);
    vus.add(entry.sku);

    for (const [champ, texte] of [
      ["description", entry.description],
      ["descriptionEn", entry.descriptionEn],
    ] as const) {
      if (texte.length < LONGUEUR_MIN) {
        anomalies.push(`${ou} ${champ} fait ${texte.length} caractères, minimum ${LONGUEUR_MIN}`);
      }
      if (texte.length > LONGUEUR_MAX) {
        anomalies.push(`${ou} ${champ} fait ${texte.length} caractères, maximum ${LONGUEUR_MAX}`);
      }
      if (/<[a-z/][^>]*>/i.test(texte)) {
        anomalies.push(`${ou} ${champ} contient du HTML`);
      }
      const minuscule = texte.toLowerCase();
      const trouve = MOTS_PROMOTIONNELS.find((mot) => minuscule.includes(mot));
      if (trouve) {
        anomalies.push(`${ou} ${champ} contient le terme promotionnel « ${trouve} »`);
      }
      const allemand = MOTS_ALLEMANDS.find((mot) => new RegExp(`\\b${mot}\\b`).test(texte));
      if (allemand) {
        anomalies.push(`${ou} ${champ} contient le mot allemand « ${allemand} »`);
      }
    }

    if (entry.description.trim() === entry.shortDescription.trim()) {
      anomalies.push(`${ou} description identique à shortDescription`);
    }
    if (entry.descriptionEn.trim() === entry.shortDescriptionEn.trim()) {
      anomalies.push(`${ou} descriptionEn identique à shortDescriptionEn`);
    }

    if (entry.gtin !== undefined && !isValidGtin(entry.gtin)) {
      anomalies.push(`${ou} GTIN « ${entry.gtin} » : checksum invalide`);
    }
  }

  return anomalies;
}
```

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

Lancer : `npm test`
Attendu : SUCCÈS sur les huit tests de `productContent.test.ts`.

- [ ] **Étape 5 : créer le module de données, vide**

```ts
// scripts/data/product-content.ts
import type { ProductContent } from "../../src/lib/productContent";

/**
 * Contenu rédigé produit par produit, indexé par SKU.
 *
 * Chaque GTIN est accompagné en commentaire de la source où il a été relevé :
 * sans source vérifiable, le champ reste absent et le flux bascule
 * automatiquement sur identifier_exists « no ».
 */
export const PRODUCT_CONTENT: ProductContent[] = [];
```

- [ ] **Étape 6 : écrire le script d'application**

```ts
// scripts/apply-product-content.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/server/prisma";
import { validateProductContent } from "../src/lib/productContent";
import { PRODUCT_CONTENT } from "./data/product-content";

// Applique le contenu rédigé au catalogue, par SKU.
// Lancement : npm run content:apply

async function main() {
  const anomalies = validateProductContent(PRODUCT_CONTENT);
  if (anomalies.length > 0) {
    console.error(`${anomalies.length} anomalie(s), rien n'a été écrit :`);
    for (const a of anomalies) console.error(`  - ${a}`);
    process.exitCode = 1;
    return;
  }

  // Sauvegarde intégrale avant la première écriture : la base visée est celle
  // de production, et un retour en arrière doit rester possible.
  const avant = await prisma.product.findMany();
  const dossier = path.join(process.cwd(), ".tmp-backup");
  await mkdir(dossier, { recursive: true });
  const horodatage = new Date().toISOString().replace(/[:.]/g, "-");
  const fichier = path.join(dossier, `products-${horodatage}.json`);
  await writeFile(fichier, JSON.stringify(avant, null, 2), "utf8");
  console.log(`Sauvegarde de ${avant.length} produits : ${fichier}`);

  let modifies = 0;
  let introuvables = 0;

  for (const entry of PRODUCT_CONTENT) {
    const cible = avant.find((p) => p.sku === entry.sku);
    if (!cible) {
      console.warn(`SKU introuvable en base, ignoré : ${entry.sku}`);
      introuvables += 1;
      continue;
    }

    await prisma.product.update({
      where: { id: cible.id },
      data: {
        description: entry.description,
        shortDescription: entry.shortDescription,
        descriptionEn: entry.descriptionEn,
        shortDescriptionEn: entry.shortDescriptionEn,
        // Les champs absents de l'entrée ne sont pas touchés.
        ...(entry.gtin !== undefined ? { gtin: entry.gtin } : {}),
        ...(entry.mpn !== undefined ? { mpn: entry.mpn } : {}),
        ...(entry.googleProductCategory !== undefined
          ? { googleProductCategory: entry.googleProductCategory }
          : {}),
        ...(entry.shippingWeightGrams !== undefined
          ? { shippingWeightGrams: entry.shippingWeightGrams }
          : {}),
        ...(entry.energyEfficiencyClass !== undefined
          ? { energyEfficiencyClass: entry.energyEfficiencyClass }
          : {}),
      },
    });
    modifies += 1;
  }

  console.log(`${modifies} produit(s) mis à jour, ${introuvables} SKU introuvable(s).`);
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Étape 7 : retirer l'ancien script**

Aucun script npm n'est déclaré : `package.json` porte le travail Square non commité et
reste intouchable pour toute la durée de ce plan. Le script s'invoque directement :

```bash
npx tsx --env-file=.env scripts/apply-product-content.ts
```

`.gitignore` n'a pas besoin d'être modifié non plus : sa règle `/.tmp-*` couvre déjà
`.tmp-backup` — vérifié par `git check-ignore -v .tmp-backup/test.json`.

Supprimer le script devenu inopérant :

```bash
git rm scripts/enrich-merchant-data.ts
```

- [ ] **Étape 8 : vérifier que le script tourne à vide sans rien casser**

Lancer : `npx tsx --env-file=.env scripts/apply-product-content.ts`
Attendu : « Sauvegarde de 35 produits », puis « 0 produit(s) mis à jour ». Aucune écriture,
`PRODUCT_CONTENT` étant vide.

- [ ] **Étape 9 : commiter**

La suppression de `scripts/enrich-merchant-data.ts` est déjà indexée par le `git rm` de
l'étape 7. `package.json` et `.gitignore` ne sont pas touchés.

```bash
git add src/lib/productContent.ts src/lib/productContent.test.ts scripts/data/product-content.ts scripts/apply-product-content.ts
git commit -m "Ajoute le module de contenu produit et son application idempotente"
```

---

### Tâche 4 : identifiants des 8 poêles

Lot le plus prometteur : les poêles sont des produits industriels dont l'EAN et la
référence fabricant sont fréquemment publiés.

**Fichiers :**
- Modifier : `scripts/data/product-content.ts`
- Créer : `docs/research/identifiants-produits.md` (tableau des sources)

**Interfaces :**
- Consomme : `ProductContent` de la tâche 3, `isValidGtin` de la tâche 1.
- Produit : entrées `PRODUCT_CONTENT` partielles pour les 8 SKU de poêles — champs `gtin`,
  `mpn`, `energyEfficiencyClass`, `googleProductCategory`, `shippingWeightGrams`
  uniquement. Les descriptions arrivent à la tâche 7.

- [ ] **Étape 1 : lister les 8 poêles avec leur SKU**

```bash
npx tsx --env-file=.env -e "
import { prisma } from './src/server/prisma';
prisma.product.findMany({ where: { brand: { in: ['INTERSTOVES','DEVILLE','LA NORDICA EXTRAFLAME'] } }, select: { sku: true, name: true, brand: true } })
  .then(r => { for (const p of r) console.log(p.sku, '|', p.brand, '|', p.name); })
  .finally(() => prisma.\$disconnect());
"
```

- [ ] **Étape 2 : rechercher les identifiants, un produit à la fois**

Pour chacun des 8 modèles (INTERSTOVES ALESSIA 14 kW, JUAN 14 kW, MATTEO 10 kW ; DEVILLE
SANDY 8 kW LAB, TORON 50 8 kW, ORENSE 8 kW, EGUZKI étanche 6 kW ; LA NORDICA EXTRAFLAME
Isetta Evo 4.0) : chercher sur le site du fabricant, puis chez les revendeurs spécialisés.

Relever pour chaque produit : EAN-13, référence fabricant, classe énergétique, poids net.
Ne retenir un GTIN que si `isValidGtin` le valide **et** que l'URL de la source est notée.

- [ ] **Étape 3 : consigner les sources**

Créer `docs/research/identifiants-produits.md` avec une ligne par produit :

```markdown
| SKU | Produit | GTIN | MPN | Classe énergie | Source |
| --- | --- | --- | --- | --- | --- |
| … | INTERSTOVES ALESSIA 14 kW | … | … | … | https://… |
```

Les produits sans identifiant trouvé y figurent aussi, avec « non trouvé » en clair : la
trace de la recherche vaut autant que son résultat.

- [ ] **Étape 4 : ne rien écrire encore dans le module de contenu**

`scripts/data/product-content.ts` n'est pas modifié par cette tâche. Une entrée
`ProductContent` exige ses quatre champs de texte, rédigés en tâches 7 et 8 ; les
identifiants y seront reportés à ce moment-là, depuis le tableau de recherche. La sortie de
cette tâche est le seul fichier `docs/research/identifiants-produits.md`.

- [ ] **Étape 5 : commiter**

```bash
git add docs/research/identifiants-produits.md
git commit -m "Relève les identifiants fabricant des huit poêles"
```

---

### Tâche 5 : identifiants des granulés et bûches compressées

15 produits : 11 granulés en palette (Woodstock, Badger, Total Energies, Piveteau HP+,
Starforest, Crépito, Butagaz, Limouzi, Hélios, Cogra) et 4 bûches compressées (CREPITO, Ma
Bûch'Hêtre, RUF, NESTRO/PINI KAY).

Pronostic faible pour le GTIN : l'EAN est imprimé sur le sac de 15 kg, alors que l'unité
vendue est la palette de 66 ou 72 sacs. Un EAN de sac appliqué à une palette serait un
identifiant faux. **Il ne doit pas être retenu.**

**Fichiers :**
- Modifier : `docs/research/identifiants-produits.md`

**Interfaces :**
- Consomme : le tableau créé en tâche 4.
- Produit : les lignes correspondantes, plus la certification relevée (ENplus A1, DINplus,
  NF), réutilisée dans les descriptions de la tâche 7.

- [ ] **Étape 1 : lister les 15 produits avec leur SKU**

```bash
npx tsx --env-file=.env -e "
import { prisma } from './src/server/prisma';
prisma.product.findMany({ where: { NOT: { brand: 'MLC Bois' }, AND: { NOT: { brand: { in: ['INTERSTOVES','DEVILLE','LA NORDICA EXTRAFLAME'] } } } }, select: { sku: true, name: true, brand: true } })
  .then(r => { for (const p of r) console.log(p.sku, '|', p.brand, '|', p.name); })
  .finally(() => prisma.\$disconnect());
"
```

- [ ] **Étape 2 : rechercher, produit par produit**

Relever la certification (ENplus A1, DINplus, NF Biocombustibles), le taux de cendres, le
pouvoir calorifique et l'essence, tous utiles aux descriptions. Le GTIN n'est retenu que
s'il désigne **l'unité de vente réelle**, la palette.

- [ ] **Étape 3 : compléter le tableau des sources**

Ajouter les 15 lignes à `docs/research/identifiants-produits.md`. Pour les GTIN de sac
écartés, l'indiquer explicitement : « EAN sac 15 kg écarté, unité de vente = palette ».

- [ ] **Étape 4 : commiter**

```bash
git add docs/research/identifiants-produits.md
git commit -m "Relève les certifications et identifiants des granulés et compressés"
```

---

### Tâche 6 : descriptions françaises des 12 produits MLC Bois

Bûches prêtes à brûler (hêtre, chêne, bouleau, frêne), bois en vrac 25/33/50 cm, bois sur
palette 25/30/33/40/50 cm. Marque propre : aucun GTIN, aucune recherche externe. Toutes les
données techniques proviennent des `bullets` déjà en base.

**Fichiers :**
- Modifier : `scripts/data/product-content.ts`

**Interfaces :**
- Consomme : `ProductContent` de la tâche 3.
- Produit : 12 entrées ajoutées à `PRODUCT_CONTENT`, avec `descriptionEn` et
  `shortDescriptionEn` posés à `""` — la tâche 8 les remplit. `validateProductContent` les
  signalera donc jusque-là : c'est attendu, et c'est précisément ce qui garantit qu'aucune
  traduction ne sera oubliée. Le script d'application refuse d'écrire tant qu'il reste une
  anomalie, la base est donc protégée pendant tout l'intervalle.

- [ ] **Étape 1 : extraire les données réelles de chaque produit**

```bash
npx tsx --env-file=.env -e "
import { prisma } from './src/server/prisma';
prisma.product.findMany({ where: { brand: 'MLC Bois' }, include: { variants: true, category: true } })
  .then(r => { for (const p of r) console.log(JSON.stringify({ sku: p.sku, name: p.name, bullets: JSON.parse(p.bullets), variants: p.variants.map(v => v.label), cat: p.category.slug }, null, 1)); })
  .finally(() => prisma.\$disconnect());
"
```

- [ ] **Étape 2 : rédiger les 12 descriptions**

Gabarit en trois blocs — nature, technique, usage. Exemple pour le hêtre 25 cm, à partir
des bullets réels (« Humidité sur brut inférieure à 18 % », « Longueur de bûche 25 cm,
fendue », « 2 100 kWh par stère », « Flamme calme, peu d'étincelles ») :

```ts
  {
    sku: "MLCBOISHET",
    shortDescription:
      "Bûches de hêtre fendues à 25 cm, séchées sous 18 % d'humidité, livrées en 2 mètres cubes apparents.",
    description:
      "Bûches de hêtre fendues à 25 cm, conditionnées par 2 mètres cubes apparents, soit environ 1,4 stère. " +
      "Le hêtre est un feuillu dur dont la combustion produit une flamme calme et peu d'étincelles, ce qui le " +
      "destine aussi bien aux foyers ouverts qu'aux inserts et poêles à bûches. " +
      "Séchage en séchoir jusqu'à un taux d'humidité sur brut inférieur à 18 %, mesuré avant expédition : le bois " +
      "est prêt à brûler dès la livraison, sans stockage complémentaire. À ce taux, le pouvoir calorifique atteint " +
      "environ 2 100 kWh par stère. " +
      "La longueur de 25 cm convient aux foyers compacts et aux poêles dont la chambre de combustion mesure moins " +
      "de 35 cm de profondeur.",
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
  },
```

Vérifier pour chaque texte : 400-800 caractères, aucun terme de la liste
`MOTS_PROMOTIONNELS`, aucune donnée absente des bullets.

- [ ] **Étape 3 : vérifier les longueurs**

```bash
npx tsx -e "
import { PRODUCT_CONTENT } from './scripts/data/product-content';
for (const e of PRODUCT_CONTENT) console.log(e.sku, e.description.length, e.shortDescription.length);
"
```
Attendu : toutes les longueurs de `description` entre 400 et 800.

- [ ] **Étape 4 : commiter**

```bash
git add scripts/data/product-content.ts
git commit -m "Rédige les descriptions des douze produits de marque MLC Bois"
```

---

### Tâche 7 : descriptions françaises des 23 produits de marque tierce

8 poêles, 11 granulés, 4 bûches compressées. Les descriptions intègrent les données
relevées aux tâches 4 et 5, et **uniquement** celles-là.

**Fichiers :**
- Modifier : `scripts/data/product-content.ts`

**Interfaces :**
- Consomme : `docs/research/identifiants-produits.md` (tâches 4 et 5),
  `ProductContent` (tâche 3).
- Produit : 23 entrées, incluant `gtin`, `mpn`, `energyEfficiencyClass`,
  `googleProductCategory` et `shippingWeightGrams` là où la donnée existe.

- [ ] **Étape 1 : rédiger les 8 descriptions de poêles**

Blocs : type d'appareil et puissance nominale → rendement, norme EcoDesign, classe
énergétique, dimensions et poids → volume chauffé et type d'installation. Chaque valeur
doit figurer dans le tableau de recherche ; sinon elle est omise.

- [ ] **Étape 2 : rédiger les 11 descriptions de granulés**

Blocs : essence et composition, certification (ENplus A1, DINplus) → taux de cendres,
d'humidité, pouvoir calorifique, diamètre → conditionnement exact (nombre de sacs, poids
du sac, poids de palette) et compatibilité appareil.

- [ ] **Étape 3 : rédiger les 4 descriptions de bûches compressées**

Blocs : composition (sciure compressée sans liant), forme (ronde à trou, brique) → densité,
humidité, durée de combustion → usage en poêle, insert ou chaudière.

- [ ] **Étape 4 : ajouter les identifiants relevés**

Reporter `gtin`, `mpn`, `energyEfficiencyClass` depuis
`docs/research/identifiants-produits.md`. Ne rien reporter qui n'y figure pas.

- [ ] **Étape 5 : vérifier**

```bash
npx tsx -e "
import { PRODUCT_CONTENT } from './scripts/data/product-content';
import { validateProductContent } from './src/lib/productContent';
console.log('entrées :', PRODUCT_CONTENT.length);
const a = validateProductContent(PRODUCT_CONTENT);
console.log(a.length ? a.join('\n') : 'aucune anomalie hors traductions');
"
```
Attendu : 35 entrées. Les seules anomalies acceptables à ce stade concernent
`descriptionEn`, rempli en tâche 8.

- [ ] **Étape 6 : commiter**

```bash
git add scripts/data/product-content.ts docs/research/identifiants-produits.md
git commit -m "Rédige les descriptions des vingt-trois produits de marque tierce"
```

---

### Tâche 8 : traductions anglaises

**Fichiers :**
- Modifier : `scripts/data/product-content.ts`

**Interfaces :**
- Consomme : les 35 entrées françaises des tâches 6 et 7.
- Produit : `descriptionEn` et `shortDescriptionEn` sur les 35 entrées, ce qui rend
  `validateProductContent` intégralement satisfait.

- [ ] **Étape 1 : traduire les 35 descriptions et les 35 phrases courtes**

Conserver les unités françaises avec leur équivalent : « mètre cube apparent » →
« loose cubic metre (stère equivalent) ». Les certifications gardent leur nom officiel
(ENplus A1, DINplus, NF). Même fourchette de longueur : 400-800 caractères.

- [ ] **Étape 2 : vérifier que la validation passe intégralement**

```bash
npx tsx -e "
import { PRODUCT_CONTENT } from './scripts/data/product-content';
import { validateProductContent } from './src/lib/productContent';
const a = validateProductContent(PRODUCT_CONTENT);
console.log(PRODUCT_CONTENT.length, 'entrées —', a.length ? a.join('\n') : 'aucune anomalie');
"
```
Attendu : « 35 entrées — aucune anomalie ».

- [ ] **Étape 3 : commiter**

```bash
git add scripts/data/product-content.ts
git commit -m "Traduit en anglais les descriptions des trente-cinq produits"
```

---

### Tâche 9 : application en base et vérification

**Fichiers :**
- Aucun fichier source modifié. Écriture en base et contrôles.

**Interfaces :**
- Consomme : `npm run content:apply` (tâche 3), `PRODUCT_CONTENT` complet (tâches 6 à 8).
- Produit : la base à jour, plus un relevé d'écart avant/après.

- [ ] **Étape 1 : lancer les tests**

Lancer : `npm test`
Attendu : SUCCÈS sur l'ensemble, dont `gtin.test.ts`, `productContent.test.ts` et
`merchant.test.ts`.

- [ ] **Étape 2 : appliquer**

Lancer : `npx tsx --env-file=.env scripts/apply-product-content.ts`
Attendu : « Sauvegarde de 35 produits : .tmp-backup/products-… », puis « 35 produit(s) mis
à jour, 0 SKU introuvable(s) ».

- [ ] **Étape 3 : compter les champs renseignés après écriture**

```bash
npx tsx --env-file=.env -e "
import { prisma } from './src/server/prisma';
prisma.product.findMany().then(p => {
  const n = (f) => p.filter(f).length;
  console.log('total', p.length);
  console.log('gtin', n(x => x.gtin));
  console.log('mpn', n(x => x.mpn));
  console.log('googleProductCategory', n(x => x.googleProductCategory.trim()));
  console.log('shippingWeightGrams', n(x => x.shippingWeightGrams));
  console.log('descriptionEn vides', n(x => !x.descriptionEn.trim()));
  const l = p.map(x => x.description.length).sort((a,b)=>a-b);
  console.log('description min/med/max', l[0], l[Math.floor(l.length/2)], l.at(-1));
}).finally(() => prisma.\$disconnect());
"
```
Attendu : `descriptionEn vides` = 0, `description min` ≥ 400, `max` ≤ 800.

- [ ] **Étape 4 : contrôler le flux XML**

```bash
curl -s http://localhost:3000/feed/google > /tmp/feed.xml
grep -c '<item>' /tmp/feed.xml
grep -cE 'Aktion|Ausstattung|fabrikneu' /tmp/feed.xml
grep -c '<g:gtin>' /tmp/feed.xml
grep -c '<g:identifier_exists>no</g:identifier_exists>' /tmp/feed.xml
```
Attendu : 35 items, **0** occurrence allemande, et la somme `gtin` + `identifier_exists no`
cohérente avec le tableau de recherche.

- [ ] **Étape 5 : relire une fiche par lot, dans les deux langues**

Ouvrir sur `http://localhost:3000` une fiche MLC Bois, un poêle et un granulé, puis leurs
équivalents sous `/en`. Vérifier que `shortDescription` et `description` ne se répètent
plus et que le texte anglais s'affiche bien.

- [ ] **Étape 6 : consigner le relevé final**

Cette tâche écrit en base et ne modifie aucun fichier source : il n'y a normalement rien à
commiter. Reporter le relevé de l'étape 3 dans le rapport de tâche.

**`git add -A` est proscrit sur ce dépôt** : l'arbre de travail contient une intégration
Square non commitée, étrangère à ce plan, qu'un ajout global emporterait. N'indexer que des
chemins nommés explicitement, ici comme dans toutes les autres tâches.

---

## Hors périmètre

Prix, stocks, images, structure de catégories, création ou suppression de produits, refonte
du tableau de bord `admin/merchant`, attribut `certification` du flux.
