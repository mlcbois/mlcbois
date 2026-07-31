/**
 * Ajoute au catalogue les références relevées sur trois sites du marché.
 *
 * Sources : leboisquivouschauffe.pro (vrac au stère), holzkerssenbrock.de
 * (palettes) et monsieur-buche.fr (bûches compressées). Seules les données
 * factuelles en sont reprises — dénomination du produit, longueur de bûche,
 * conditionnement, prix. Les textes sont rédigés ici : recopier la prose d'un
 * concurrent exposerait au grief de contrefaçon et ferait surtout du contenu
 * dupliqué, que les moteurs de recherche déclassent.
 *
 * Les visuels sont ceux du dossier public/images/brennholz : on ne rapatrie pas
 * les photographies des sites sources, qui ne nous appartiennent pas.
 *
 * ADDITIF : le script ne supprime ni ne modifie aucun produit existant. Les
 * références importées portent le préfixe de slug « mkt- » pour rester
 * repérables et se retirer d'un seul coup si besoin.
 *
 * Relançable : chaque produit passe par un upsert sur son slug.
 *
 * Lancement : node --env-file=.env --import tsx scripts/importer-produits-marche.ts
 */
import { prisma } from "../src/server/prisma";

const IMG = "/images/brennholz";

const GOOGLE_CATEGORY =
  "Maison et jardin > Accessoires pour cheminées et poêles à bois > Combustible et bois de chauffage";

interface ProduitImporte {
  slug: string;
  brand: string;
  name: string;
  nameEn: string;
  short: string;
  shortEn: string;
  bullets: string[];
  bulletsEn: string[];
  /** Prix en euros, tel que relevé sur le site source. */
  prix: number;
  image: string;
  /** Poids d'expédition en kilogrammes. */
  poidsKg: number;
  stock: number;
  badge?: string;
  note?: number;
}

interface RayonImporte {
  categorie: string;
  produits: ProduitImporte[];
}

/** Référence produit, dérivée du slug : « mkt-vrac-25 » donne « MKT-VRAC-25 ». */
function reference(slug: string): string {
  return slug.toUpperCase();
}

// ---------------------------------------------------------------------------
// Bois en vrac — relevé sur leboisquivouschauffe.pro
//
// Vendu au stère, essence mixte de feuillus. Le prix baisse avec la longueur :
// plus la bûche est courte, plus il y a de coupes, donc de main-d'œuvre.
// ---------------------------------------------------------------------------

function vrac(options: {
  cm: number;
  prix: number;
  usage: string;
  usageEn: string;
}): ProduitImporte {
  const { cm, prix, usage, usageEn } = options;
  return {
    slug: `mkt-vrac-melange-${cm}cm-stere`,
    brand: "MLC Bois",
    name: `Bûches mélange feuillus ${cm} cm — Vrac, au stère`,
    nameEn: `Mixed hardwood logs ${cm} cm — loose, per stacked m³`,
    short: `Chêne, charme, hêtre et frêne mélangés, fendus à ${cm} cm. Livré en vrac et déversé à l'endroit que vous indiquez. Prix au stère, dégressif à partir de trois stères.`,
    shortEn: `Oak, hornbeam, beech and ash mixed, split to ${cm} cm. Delivered loose and tipped where you ask. Priced per stacked cubic metre, cheaper from three upwards.`,
    bullets: [
      "Mélange de feuillus : chêne, charme, hêtre, frêne",
      `Longueur de bûche ${cm} cm, fendue`,
      usage,
      "Vendu au stère, livré en vrac",
    ],
    bulletsEn: [
      "Hardwood mix: oak, hornbeam, beech, ash",
      `Log length ${cm} cm, split`,
      usageEn,
      "Sold per stacked cubic metre, delivered loose",
    ],
    prix,
    image: `${IMG}/lose-schuettung.jpg`,
    // Un stère de feuillu mi-sec pèse environ 600 kg.
    poidsKg: 600,
    stock: 120,
  };
}

const BOIS_EN_VRAC: RayonImporte = {
  categorie: "vrac",
  produits: [
    vrac({
      cm: 25,
      prix: 93,
      usage: "Pour poêle compact et insert de petite largeur",
      usageEn: "For compact stoves and narrow inserts",
    }),
    vrac({
      cm: 33,
      prix: 89,
      usage: "La longueur la plus courante, convient à la majorité des poêles",
      usageEn: "The most common length, fits most stoves",
    }),
    vrac({
      cm: 40,
      prix: 90,
      usage: "Pour insert large et foyer fermé de grande capacité",
      usageEn: "For wide inserts and large closed fireplaces",
    }),
    vrac({
      cm: 50,
      prix: 85,
      usage: "Pour cheminée ouverte et chaudière à bûches",
      usageEn: "For open fireplaces and log boilers",
    }),
  ],
};

// ---------------------------------------------------------------------------
// Bois sur palette — relevé sur holzkerssenbrock.de
//
// Le catalogue allemand raisonne en Raummeter, qui est le stère français. Les
// dénominations sont traduites, les volumes et les prix repris tels quels.
// « Extra trocken » devient « extra sec » : un séchage poussé sous 15 %, au
// lieu des 18 % du séchage courant.
// ---------------------------------------------------------------------------

function palette(options: {
  cm: number;
  steres: number;
  prix: number;
  extraSec?: boolean;
  /** Vrai pour les lots annoncés 100 % feuillu, par opposition au tout-venant. */
  pur?: boolean;
}): ProduitImporte {
  const { cm, steres, prix, extraSec = false, pur = false } = options;
  const volume = steres.toLocaleString("fr-FR");
  const suffixe = extraSec ? "-extra-sec" : pur ? "-feuillu" : "";
  const qualifiant = extraSec ? " — Extra sec" : pur ? " — 100 % feuillu" : "";
  const qualifiantEn = extraSec ? " — extra dry" : pur ? " — 100% hardwood" : "";

  return {
    slug: `mkt-palette-${cm}cm-${String(steres).replace(".", "-")}st${suffixe}`,
    brand: "MLC Bois",
    name: `Bûches feuillu ${cm} cm — Palette ${volume} stère${steres >= 2 ? "s" : ""}${qualifiant}`,
    nameEn: `Hardwood logs ${cm} cm — pallet ${steres} stacked m³${qualifiantEn}`,
    short: `Bûches de feuillu fendues à ${cm} cm, rangées et cerclées sur palette de ${volume} stère${steres >= 2 ? "s" : ""}. ${
      extraSec
        ? "Séchage poussé sous 15 % d'humidité sur brut : allumage immédiat, rendement maximal."
        : "Séchées sous 18 % d'humidité sur brut, prêtes à brûler dès la livraison."
    }`,
    shortEn: `Hardwood logs split to ${cm} cm, stacked and strapped on a ${steres} stacked m³ pallet. ${
      extraSec
        ? "Dried below 15% moisture: lights immediately, maximum output."
        : "Dried below 18% moisture, ready to burn on delivery."
    }`,
    bullets: [
      extraSec
        ? "Humidité sur brut inférieure à 15 %"
        : "Humidité sur brut inférieure à 18 %",
      `Longueur de bûche ${cm} cm, fendue`,
      pur ? "100 % feuillu, sans résineux" : "Feuillus mélangés",
      `Palette de ${volume} stère${steres >= 2 ? "s" : ""}, déposée au sol par hayon`,
    ],
    bulletsEn: [
      extraSec ? "Moisture content below 15%" : "Moisture content below 18%",
      `Log length ${cm} cm, split`,
      pur ? "100% hardwood, no softwood" : "Mixed hardwoods",
      `${steres} stacked m³ pallet, set down by tail lift`,
    ],
    prix,
    image: `${IMG}/palette-box.jpg`,
    // Un stère de feuillu sec pèse environ 420 kg.
    poidsKg: Math.round(steres * 420),
    stock: 40,
  };
}

const BOIS_SUR_PALETTE: RayonImporte = {
  categorie: "palette",
  produits: [
    palette({ cm: 25, steres: 1.8, prix: 233, extraSec: true }),
    palette({ cm: 25, steres: 2, prix: 269 }),
    palette({ cm: 25, steres: 2, prix: 266, extraSec: true }),
    palette({ cm: 25, steres: 3, prix: 395 }),
    palette({ cm: 30, steres: 2, prix: 264 }),
    palette({ cm: 30, steres: 2, prix: 268, pur: true }),
    palette({ cm: 30, steres: 2.5, prix: 335 }),
    palette({ cm: 30, steres: 3, prix: 394, extraSec: true }),
    palette({ cm: 33, steres: 2.5, prix: 339, pur: true }),
    palette({ cm: 33, steres: 3, prix: 394 }),
    palette({ cm: 40, steres: 1.5, prix: 208, pur: true }),
    palette({ cm: 40, steres: 2, prix: 266, extraSec: true }),
    palette({ cm: 40, steres: 2.5, prix: 334 }),
    palette({ cm: 50, steres: 2, prix: 265 }),
    palette({ cm: 50, steres: 2, prix: 265, pur: true }),
    palette({ cm: 50, steres: 3, prix: 389 }),
  ],
};

// ---------------------------------------------------------------------------
// Bûches compressées — relevé sur monsieur-buche.fr
// ---------------------------------------------------------------------------

const BOIS_COMPRESSE: RayonImporte = {
  categorie: "bois-compresse",
  produits: [
    {
      slug: "mkt-compresse-hetre-pack-5",
      brand: "Ma Bûch'Hêtre",
      name: "Ma Bûch'Hêtre — Pack de 5 bûches compressées",
      nameEn: "Ma Bûch'Hêtre — pack of 5 compressed logs",
      short:
        "Sciure de hêtre compressée sans liant, en pack de cinq bûches. Le format d'appoint : de quoi tenir une soirée, ou tester avant d'engager une palette.",
      shortEn:
        "Beech sawdust compressed without binder, in packs of five logs. The top-up format: an evening's worth, or a trial before committing to a pallet.",
      bullets: [
        "Hêtre compressé, sans liant chimique",
        "Pack de 5 bûches",
        "Rendement trois à quatre fois supérieur au bois bûche",
        "Bois de Normandie",
      ],
      bulletsEn: [
        "Compressed beech, no chemical binder",
        "Pack of 5 logs",
        "Three to four times the output of split logs",
        "Wood from Normandy",
      ],
      prix: 4.5,
      image: `${IMG}/briketts.jpg`,
      poidsKg: 10,
      stock: 400,
    },
    {
      slug: "mkt-compresse-hetre-palette-104",
      brand: "Ma Bûch'Hêtre",
      name: "Ma Bûch'Hêtre — Palette de 104 packs (520 bûches)",
      nameEn: "Ma Bûch'Hêtre — pallet of 104 packs (520 logs)",
      short:
        "La palette complète : 104 packs, soit 520 bûches de hêtre compressé. De quoi passer l'hiver sur un quart de la place qu'exigerait le bois bûche.",
      shortEn:
        "The full pallet: 104 packs, that is 520 compressed beech logs. A whole winter in a quarter of the space split logs would need.",
      bullets: [
        "Hêtre compressé, sans liant chimique",
        "104 packs, soit 520 bûches",
        "Quatre fois moins de place que le bois bûche",
        "Livraison par camion à hayon",
      ],
      bulletsEn: [
        "Compressed beech, no chemical binder",
        "104 packs, that is 520 logs",
        "Four times less storage space than split logs",
        "Delivered by tail-lift lorry",
      ],
      prix: 440,
      image: `${IMG}/briketts.jpg`,
      poidsKg: 960,
      stock: 25,
      badge: "Meilleure vente",
      note: 4.8,
    },
    {
      slug: "mkt-compresse-crepito-palette-104",
      brand: "CREPITO",
      name: "CREPITO — Palette de 104 packs (520 bûches)",
      nameEn: "CREPITO — pallet of 104 packs (520 logs)",
      short:
        "Bûches compressées CREPITO, 104 packs sur palette. Braise longue et rechargement propre : la formule des nuits de chauffe, en complément du bois bûche.",
      shortEn:
        "CREPITO compressed logs, 104 packs on a pallet. Long embers and clean reloading: the overnight option, alongside split logs.",
      bullets: [
        "Sciure compressée sans liant",
        "104 packs, soit 520 bûches",
        "Braise tenue toute la nuit",
        "Livraison par camion à hayon",
      ],
      bulletsEn: [
        "Compressed sawdust, no binder",
        "104 packs, that is 520 logs",
        "Embers hold overnight",
        "Delivered by tail-lift lorry",
      ],
      prix: 440,
      image: `${IMG}/briketts.jpg`,
      poidsKg: 960,
      stock: 25,
    },
  ],
};

const RAYONS = [BOIS_EN_VRAC, BOIS_SUR_PALETTE, BOIS_COMPRESSE];

async function main() {
  let crees = 0;
  let majs = 0;

  for (const rayon of RAYONS) {
    const categorie = await prisma.category.findFirst({ where: { slug: rayon.categorie } });
    if (!categorie) {
      throw new Error(`Catégorie « ${rayon.categorie} » introuvable : lancer d'abord la restructuration.`);
    }

    console.log(`\n=== ${rayon.categorie} — ${rayon.produits.length} références ===`);

    for (const produit of rayon.produits) {
      const donnees = {
        categoryId: categorie.id,
        brand: produit.brand,
        name: produit.name,
        nameEn: produit.nameEn,
        sku: reference(produit.slug),
        shortDescription: produit.short,
        shortDescriptionEn: produit.shortEn,
        description: produit.short,
        descriptionEn: produit.shortEn,
        bullets: JSON.stringify(produit.bullets),
        bulletsEn: JSON.stringify(produit.bulletsEn),
        googleProductCategory: GOOGLE_CATEGORY,
        shippingWeightGrams: produit.poidsKg * 1000,
        image: produit.image,
        images: JSON.stringify([produit.image]),
        priceCents: Math.round(produit.prix * 100),
        badge: produit.badge ?? null,
        editorialRating: produit.note ?? null,
        stock: produit.stock,
        active: true,
      };

      const existant = await prisma.product.findUnique({ where: { slug: produit.slug } });
      await prisma.product.upsert({
        where: { slug: produit.slug },
        update: donnees,
        create: { ...donnees, slug: produit.slug },
      });

      if (existant) majs += 1;
      else crees += 1;
      console.log(`  ${existant ? "maj " : "créé"}  ${produit.name}  —  ${produit.prix} €`);
    }
  }

  console.log(`\n${crees} produits créés, ${majs} mis à jour.`);

  const total = await prisma.category.findMany({
    where: { slug: { in: RAYONS.map((r) => r.categorie) } },
    select: { slug: true, label: true, _count: { select: { products: true } } },
  });
  console.log("\n=== Effectif par rayon ===");
  for (const c of total) console.log(`  ${c.label.padEnd(32)} ${c._count.products} produits`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
