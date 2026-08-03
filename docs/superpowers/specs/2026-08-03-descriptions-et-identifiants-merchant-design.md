# Descriptions produit et identifiants Merchant — conception

**Date :** 3 août 2026
**Périmètre :** les 35 produits du catalogue, champs de contenu et d'identification
uniquement. Aucun changement de prix, de stock ni de structure de catégories.

---

## 1. Problème

L'audit de la base de production relève, sur 35 produits :

| Constat | Mesure |
| --- | --- |
| Longueur des descriptions | 91 à 173 caractères, médiane 134 |
| `description` et `shortDescription` | identiques ou quasi identiques sur une large part du catalogue |
| `gtin` renseignés | 0 / 35 |
| `mpn` renseignés | 0 / 35 |
| `googleProductCategory` | 29 / 35 |
| `shippingWeightGrams` | 20 / 35 |
| `descriptionEn` | 7 vides |
| `energyEfficiencyClass` | 0 / 8 poêles |

Une description de 134 caractères passe la validation Merchant mais n'apporte à Google
aucun élément d'appariement : ni essence, ni taux d'humidité, ni pouvoir calorifique, ni
conditionnement. La duplication `description` = `shortDescription` prive en outre la fiche
produit de tout contenu propre pour le référencement naturel.

Aucun produit ne portant ni GTIN ni MPN, le flux envoie aujourd'hui
`identifier_exists: "no"` sur la totalité du catalogue.

## 2. Décisions retenues

| Question | Décision |
| --- | --- |
| Origine des GTIN | Recherche web produit par produit, avec tableau `SKU → GTIN → URL source` remis pour recoupement |
| Articulation site / flux | Une seule `description` enrichie, servant la fiche produit **et** le flux |
| Périmètre | Descriptions, GTIN, MPN, traductions anglaises, catégorie Google, poids, nettoyage de l'allemand résiduel |
| Application en base | Écriture directe sur la base Neon de production, précédée d'un export JSON de sauvegarde |
| `energyEfficiencyClass` | Renseigné si la donnée constructeur est trouvée, laissé vide sinon |

## 3. Champs écrits

Les six champs visés existent déjà au schéma : **aucune migration Prisma**.

| Champ | Traitement |
| --- | --- |
| `description` | Réécrit à 400-800 caractères |
| `shortDescription` | Ramené à une phrase d'environ 140 caractères, distincte de `description` |
| `descriptionEn`, `shortDescriptionEn` | Traduction des deux précédents |
| `gtin` | Écrit uniquement si trouvé sur source identifiable, `null` sinon |
| `mpn` | Référence fabricant, même règle |
| `googleProductCategory`, `shippingWeightGrams`, `energyEfficiencyClass` | Complétés là où la donnée existe |

`identifier_exists: "no"` reste calculé automatiquement en l'absence de GTIN et de MPN
(`src/server/merchant.ts:500`). Aucune intervention n'est nécessaire sur ce point.

## 4. Gabarit de description

### Contraintes Merchant appliquées

Interdits, chacun étant un motif de refus documenté :

- texte promotionnel (« livraison offerte », « meilleur prix », « promotion ») ;
- balises HTML, texte en capitales d'emphase, emoji ;
- liens et adresses ;
- mention de la boutique ou de ses conditions commerciales ;
- comparaison avec des concurrents ;
- répétition littérale du titre.

L'information discriminante se place en tête : Google tronque à l'affichage.

### Structure

Trois blocs, dans cet ordre :

1. **Nature du produit** — essence ou composition, longueur de bûche, conditionnement,
   volume en mètre cube apparent.
2. **Caractéristiques techniques** — taux d'humidité sur brut, pouvoir calorifique,
   certification lorsqu'elle existe (NF Bois de chauffage, ENplus A1).
3. **Usage** — type d'appareil visé, mise en œuvre.

### Règle sur les données

**Aucune valeur technique n'est inventée.** Les chiffres proviennent des `bullets` déjà
présents en base pour les produits de marque propre, et de sources constructeur vérifiées
pour les marques tierces. Une donnée non sourcée n'est pas écrite : la description est
alors plus courte, ce qui est préférable à une fiche refusée.

## 5. Recherche des identifiants

Le catalogue se répartit en trois lots aux perspectives distinctes :

| Lot | Effectif | Attente |
| --- | --- | --- |
| Marque propre MLC Bois (bûches, vrac, palettes) | 12 | Aucun GTIN. Produit non industriel, sans EAN fabricant. Pas de recherche, `identifier_exists: no` |
| Poêles (INTERSTOVES, DEVILLE, LA NORDICA EXTRAFLAME) | 8 | Favorable : EAN et référence fabricant fréquemment publiés |
| Granulés et bûches compressées | 15 | Défavorable pour le GTIN — l'EAN figure sur le sac, non sur la palette vendue. Correct pour le MPN |

Un GTIN n'est retenu qu'à deux conditions cumulatives : **checksum EAN-13 valide** et
**source identifiable**. Le tableau `SKU → GTIN → URL source` est produit en sortie pour
recoupement.

Cette règle prolonge celle déjà inscrite dans `docs/GOOGLE_MERCHANT.md` § 2 : une GTIN
inventée n'entraîne pas le simple refus du produit, mais expose à la suspension du compte.

## 6. Mécanisme d'écriture

`scripts/enrich-merchant-data.ts` est un vestige de la période électroménager allemand :
sa liste `TYPE_WORDS` énumère « Geschirrspüler », « Waschmaschine », « Gaming-Notebook ».
Il est sans effet sur un catalogue de bois de chauffage. Il est **remplacé**, non doublé.

Deux fichiers :

- `scripts/data/product-content.ts` — contenu par SKU, sources des identifiants en
  commentaire. Versionné : l'historique du contenu vit dans git.
- `scripts/apply-product-content.ts` — applique le contenu par `sku` via
  `prisma.product.update`. Idempotent, réexécutable, ne crée ni ne supprime aucun produit.
  Exporte l'état antérieur des 35 produits en JSON avant la première écriture.

## 7. Nettoyage de l'allemand résiduel

`src/server/merchant.ts` conserve deux fragments issus du clone d'origine :

- lignes 341-344, le repli de description : « von », « Ausstattung: », « Zustand:
  fabrikneu und originalverpackt. ». Latent aujourd'hui — il ne se déclenche qu'en deçà de
  80 caractères, alors que le minimum du catalogue est de 91 — mais fautif.
- ligne 520, `customLabel1: "Aktion"`, envoyé à Google sur chaque produit en promotion.

Les deux passent en français.

## 8. Vérification

1. `npm test`. Attention : `src/server/merchant.ts` n'a **aucun test** à ce jour. Les
   tests de non-régression sont donc à créer — sur la validation du checksum GTIN et sur
   l'absence d'allemand dans l'enregistrement produit.
2. `curl localhost:3000/feed/google` — contrôle du XML produit : présence des
   descriptions longues, cohérence `gtin` / `identifier_exists`, absence d'« Aktion ».
3. Relecture d'une fiche produit de chaque lot sur le site local, en français et en
   anglais.
4. Comptage final des champs renseignés, comparé au tableau du § 1.

## 9. Hors périmètre

- Prix, stocks, images, structure de catégories.
- Création ou suppression de produits.
- Refonte du tableau de bord de conformité `admin/merchant`.
- Champ `certification` du flux, qui suppose des attestations fournisseur non disponibles.
