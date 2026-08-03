import type { ProductContent } from "../../src/lib/productContent";

/**
 * Contenu rédigé produit par produit, indexé par slug.
 *
 * Chaque GTIN est accompagné en commentaire de la source où il a été relevé :
 * sans source vérifiable, le champ reste absent et le flux bascule
 * automatiquement sur identifier_exists « no ».
 *
 * L'indexation se fait par slug, et non par SKU : `slug` est `@unique` dans
 * `prisma/schema.prisma`, alors que le SKU ne l'est pas — il est dérivé par
 * troncature du slug à 12 caractères alphanumériques dans
 * `scripts/seed-bois-variations.ts` (`skuFromSlug`), ce qui produit des
 * collisions (ex. "bois-palette-30cm" et "bois-palette-33cm" partagent tous
 * deux le SKU "BOISPALETTE3"). Le slug, lui, distingue correctement les
 * 35 produits en base ; c'est donc la clé fiable pour `apply-product-content.ts`.
 */
export const PRODUCT_CONTENT: ProductContent[] = [
  // --- Bûches prêtes à brûler, marque MLC Bois ---
  {
    slug: "mlc-bois-hetre-pret-a-bruler-25-cm-2-metre-cube",
    shortDescription:
      "Bûches de hêtre fendues à 25 cm, séchées en séchoir sous 18 % d'humidité sur brut, conditionnées en 2 mètres cubes apparents, prêtes à brûler.",
    description:
      "Bûches de hêtre fendues à 25 cm, conditionnées par 2 mètres cubes apparents, soit environ 1,4 stère. " +
      "Le hêtre est un feuillu dur dont la combustion produit une flamme calme et peu d'étincelles, ce qui le " +
      "destine aussi bien aux foyers ouverts qu'aux inserts et poêles à bûches. " +
      "Séchage en séchoir jusqu'à un taux d'humidité sur brut inférieur à 18 %, contrôlé avant expédition : le " +
      "bois est prêt à brûler dès la livraison, sans stockage complémentaire. À ce taux, le pouvoir calorifique " +
      "atteint environ 2 100 kWh par stère. " +
      "La longueur de 25 cm convient aux foyers et poêles à chambre de combustion compacte.",
    descriptionEn: "Beech logs split to 25 cm, packed by loose cubic metre (stacked volume): this pack holds 2, about 1.4 stère (one loose cubic metre equals roughly 0.7 stère, the French cord unit for stacked wood). Beech is a dense hardwood that burns with a calm flame and few sparks, suiting open fireplaces as well as inserts and wood-burning stoves. Kiln dried to a moisture content on a wet basis below 18%, checked before dispatch: the wood is ready to burn on delivery, with no further seasoning required. At this moisture level, the calorific value reaches about 2,100 kWh per stère. The 25 cm length suits fireplaces and stoves with a compact firebox.",
    shortDescriptionEn: "Beech logs split to 25 cm, kiln dried below 18% moisture content on a wet basis, packed in 2 loose cubic metres, ready to burn.",
  },
  {
    slug: "mlc-bois-chene-pret-a-bruler-50-cm-2-metre-cube",
    shortDescription:
      "Bûches de chêne fendues à 50 cm, séchées sous 18 % d'humidité sur brut, à la phase de braise longue, conditionnées en 2 mètres cubes apparents.",
    description:
      "Bûches de chêne fendues à 50 cm, conditionnées par 2 mètres cubes apparents, soit environ 1,4 stère. " +
      "Le chêne est un feuillu dur réputé pour sa phase de braise très longue, ce qui en fait un bois de fond de " +
      "feu apprécié dans les inserts et les poêles à bûches. " +
      "Séchage en séchoir jusqu'à un taux d'humidité sur brut inférieur à 18 %, contrôlé avant expédition : le " +
      "bois est prêt à brûler dès la livraison, sans stockage complémentaire. À ce taux, le pouvoir calorifique " +
      "atteint environ 2 100 kWh par stère. " +
      "La longueur de 50 cm convient aux foyers et inserts à grande chambre de combustion.",
    descriptionEn: "Oak logs split to 50 cm, packed by loose cubic metre (stacked volume): this pack holds 2, about 1.4 stère (one loose cubic metre equals roughly 0.7 stère, the French cord unit for stacked wood). Oak is a dense hardwood known for a very long ember phase, which makes it a favourite base-load fuel in inserts and wood-burning stoves. Kiln dried to a moisture content on a wet basis below 18%, checked before dispatch: the wood is ready to burn on delivery, with no further seasoning required. At this moisture level, the calorific value reaches about 2,100 kWh per stère. The 50 cm length suits fireplaces and inserts with a large firebox.",
    shortDescriptionEn: "Oak logs split to 50 cm, kiln dried below 18% moisture content on a wet basis, known for a long ember phase, packed in 2 loose cubic metres.",
  },
  {
    slug: "mlc-bois-bouleau-pret-a-bruler-25-cm-2-3-metre-cube",
    shortDescription:
      "Bûches de bouleau fendues à 25 cm, séchées sous 18 % d'humidité sur brut, à la flamme claire, conditionnées en 2,3 mètres cubes apparents.",
    description:
      "Bûches de bouleau fendues à 25 cm, conditionnées par 2,3 mètres cubes apparents, soit environ 1,6 stère. " +
      "Le bouleau est un feuillu clair dont la combustion donne une flamme vive et un parfum agréable, apprécié " +
      "en foyer ouvert comme en insert. " +
      "Séchage en séchoir jusqu'à un taux d'humidité sur brut inférieur à 18 %, contrôlé avant expédition : le " +
      "bois est prêt à brûler dès la livraison, sans stockage complémentaire. À ce taux, le pouvoir calorifique " +
      "atteint environ 1 900 kWh par stère. " +
      "La longueur de 25 cm convient aux foyers et poêles à chambre de combustion compacte.",
    descriptionEn: "Birch logs split to 25 cm, packed by loose cubic metre (stacked volume): this pack holds 2.3, about 1.6 stère (one loose cubic metre equals roughly 0.7 stère, the French cord unit for stacked wood). Birch is a light hardwood that burns with a bright flame and a pleasant scent, well suited to open fireplaces as well as inserts. Kiln dried to a moisture content on a wet basis below 18%, checked before dispatch: the wood is ready to burn on delivery, with no further seasoning required. At this moisture level, the calorific value reaches about 1,900 kWh per stère. The 25 cm length suits fireplaces and stoves with a compact firebox.",
    shortDescriptionEn: "Birch logs split to 25 cm, kiln dried below 18% moisture content on a wet basis, bright flame, packed in 2.3 loose cubic metres.",
  },
  {
    slug: "mlc-bois-frene-pret-a-bruler-50-cm-2-5-metre-cube",
    shortDescription:
      "Bûches de frêne fendues à 50 cm, séchées sous 18 % d'humidité sur brut, à combustion peu cendreuse, conditionnées en 2,5 mètres cubes apparents.",
    description:
      "Bûches de frêne fendues à 50 cm, conditionnées par 2,5 mètres cubes apparents, soit environ 1,75 stère. " +
      "Le frêne est un feuillu dur dont la combustion produit peu de cendres et reste très calme, ce qui limite " +
      "l'entretien du foyer entre deux recharges. " +
      "Séchage en séchoir jusqu'à un taux d'humidité sur brut inférieur à 18 %, contrôlé avant expédition : le " +
      "bois est prêt à brûler dès la livraison, sans stockage complémentaire. À ce taux, le pouvoir calorifique " +
      "atteint environ 2 100 kWh par stère. " +
      "La longueur de 50 cm convient aux foyers et inserts à grande chambre de combustion.",
    descriptionEn: "Ash logs split to 50 cm, packed by loose cubic metre (stacked volume): this pack holds 2.5, about 1.75 stère (one loose cubic metre equals roughly 0.7 stère, the French cord unit for stacked wood). Ash is a dense hardwood that produces little ash and burns very calmly, which reduces firebox maintenance between reloads. Kiln dried to a moisture content on a wet basis below 18%, checked before dispatch: the wood is ready to burn on delivery, with no further seasoning required. At this moisture level, the calorific value reaches about 2,100 kWh per stère. The 50 cm length suits fireplaces and inserts with a large firebox.",
    shortDescriptionEn: "Ash logs split to 50 cm, kiln dried below 18% moisture content on a wet basis, low-ash burn, packed in 2.5 loose cubic metres.",
  },

  // --- Bois en vrac ---
  {
    slug: "bois-vrac-50cm",
    shortDescription:
      "Bûches de feuillus durs — chêne, charme et hêtre — de 50 cm, livrées en vrac par camion-grue, humidité autour de 30 %, de 1 à 6 stères.",
    description:
      "Bûches de feuillus durs — chêne, charme et hêtre — coupées à 50 cm et livrées en vrac, sans " +
      "conditionnement individuel. " +
      "L'humidité se situe autour de 30 %, un taux courant pour du bois non extra-sec : un temps de stockage à " +
      "l'abri est recommandé avant utilisation en foyer fermé. La livraison s'effectue par camion-grue, qui " +
      "dépose le bois au sol, ce qui suppose un accès dégagé et un espace de stockage disponible chez le client. " +
      "Le volume se choisit de 1 à 6 stères selon les besoins. " +
      "La longueur de 50 cm convient aux foyers ouverts et aux inserts à grande chambre de combustion.",
    descriptionEn: "Hardwood logs — oak, hornbeam and beech — cut to 50 cm and delivered loose, with no individual packaging. Moisture content sits around 30%, a common level for wood that is not extra-dry: a period of covered storage is recommended before use in a closed firebox. Delivery is by crane truck, which unloads the wood on the ground, so a clear access route and storage space on site are needed. Volume can be chosen from 1 to 6 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 50 cm length suits open fireplaces and inserts with a large firebox.",
    shortDescriptionEn: "Loose-tipped hardwood logs — oak, hornbeam, beech — 50 cm, delivered by crane truck, about 30% moisture, 1 to 6 stères.",
  },
  {
    slug: "bois-vrac-33cm",
    shortDescription:
      "Bûches de feuillus durs — chêne, charme et hêtre — de 33 cm, livrées en vrac par camion-grue, humidité autour de 30 %, de 1 à 7 stères.",
    description:
      "Bûches de feuillus durs — chêne, charme et hêtre — coupées à 33 cm et livrées en vrac, sans " +
      "conditionnement individuel. " +
      "L'humidité se situe autour de 30 %, un taux courant pour du bois non extra-sec : un temps de stockage à " +
      "l'abri est recommandé avant utilisation en foyer fermé. La livraison s'effectue par camion-grue, qui " +
      "dépose le bois au sol, ce qui suppose un accès dégagé et un espace de stockage disponible chez le client. " +
      "Le volume se choisit de 1 à 7 stères selon les besoins. " +
      "La longueur de 33 cm convient à la plupart des inserts et poêles à bûches du marché.",
    descriptionEn: "Hardwood logs — oak, hornbeam and beech — cut to 33 cm and delivered loose, with no individual packaging. Moisture content sits around 30%, a common level for wood that is not extra-dry: a period of covered storage is recommended before use in a closed firebox. Delivery is by crane truck, which unloads the wood on the ground, so a clear access route and storage space on site are needed. Volume can be chosen from 1 to 7 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 33 cm length fits most inserts and wood-burning stoves on the market.",
    shortDescriptionEn: "Loose-tipped hardwood logs — oak, hornbeam, beech — 33 cm, delivered by crane truck, about 30% moisture, 1 to 7 stères.",
  },
  {
    slug: "bois-vrac-25cm",
    shortDescription:
      "Bûches de feuillus durs — chêne, charme et hêtre — de 25 cm, livrées en vrac par camion-grue, humidité autour de 30 %, de 1 à 7 stères.",
    description:
      "Bûches de feuillus durs — chêne, charme et hêtre — coupées à 25 cm et livrées en vrac, sans " +
      "conditionnement individuel. " +
      "L'humidité se situe autour de 30 %, un taux courant pour du bois non extra-sec : un temps de stockage à " +
      "l'abri est recommandé avant utilisation en foyer fermé. La livraison s'effectue par camion-grue, qui " +
      "dépose le bois au sol, ce qui suppose un accès dégagé et un espace de stockage disponible chez le client. " +
      "Le volume se choisit de 1 à 7 stères selon les besoins. " +
      "La longueur de 25 cm convient aux foyers et poêles à chambre de combustion compacte.",
    descriptionEn: "Hardwood logs — oak, hornbeam and beech — cut to 25 cm and delivered loose, with no individual packaging. Moisture content sits around 30%, a common level for wood that is not extra-dry: a period of covered storage is recommended before use in a closed firebox. Delivery is by crane truck, which unloads the wood on the ground, so a clear access route and storage space on site are needed. Volume can be chosen from 1 to 7 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 25 cm length suits fireplaces and stoves with a compact firebox.",
    shortDescriptionEn: "Loose-tipped hardwood logs — oak, hornbeam, beech — 25 cm, delivered by crane truck, about 30% moisture, 1 to 7 stères.",
  },

  // --- Bois sur palette ---
  {
    slug: "bois-palette-40cm",
    shortDescription:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — de 40 cm, sur palette filmée, humidité sous 20 %, de 1,5 à 2,5 stères.",
    description:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — coupées à 40 cm et livrées sur palette " +
      "filmée. " +
      "L'humidité reste sous 20 %, ce qui rend le bois prêt à brûler dès la livraison, sans séchage " +
      "complémentaire. Le film plastique protège les bûches durant le transport ; il se retire dès réception " +
      "pour laisser le bois respirer. Le conditionnement sur palette facilite le déchargement à l'aide d'un " +
      "engin de manutention ou d'un transpalette. Le volume se choisit de 1,5 à 2,5 stères selon les besoins. " +
      "La longueur de 40 cm convient aux foyers ouverts et aux inserts à grande chambre de combustion.",
    descriptionEn: "Extra-dry hardwood logs — oak, hornbeam and beech — cut to 40 cm and delivered on a shrink-wrapped pallet. Moisture content stays below 20%, so the wood is ready to burn on delivery, with no further drying needed. The plastic film protects the logs in transit; remove it on receipt so the wood can breathe. The pallet packaging makes unloading easier with a forklift or pallet truck. Volume can be chosen from 1.5 to 2.5 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 40 cm length suits open fireplaces and inserts with a large firebox.",
    shortDescriptionEn: "Extra-dry hardwood logs — oak, hornbeam, beech — 40 cm, shrink-wrapped pallet, below 20% moisture, 1.5 to 2.5 stères.",
  },
  {
    slug: "bois-palette-33cm",
    shortDescription:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — de 33 cm, sur palette filmée, humidité sous 20 %, de 2,5 à 3 stères.",
    description:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — coupées à 33 cm et livrées sur palette " +
      "filmée. " +
      "L'humidité reste sous 20 %, ce qui rend le bois prêt à brûler dès la livraison, sans séchage " +
      "complémentaire. Le film plastique protège les bûches durant le transport ; il se retire dès réception " +
      "pour laisser le bois respirer. Le conditionnement sur palette facilite le déchargement à l'aide d'un " +
      "engin de manutention ou d'un transpalette. Le volume se choisit de 2,5 à 3 stères selon les besoins. " +
      "La longueur de 33 cm convient à la plupart des inserts et poêles à bûches du marché.",
    descriptionEn: "Extra-dry hardwood logs — oak, hornbeam and beech — cut to 33 cm and delivered on a shrink-wrapped pallet. Moisture content stays below 20%, so the wood is ready to burn on delivery, with no further drying needed. The plastic film protects the logs in transit; remove it on receipt so the wood can breathe. The pallet packaging makes unloading easier with a forklift or pallet truck. Volume can be chosen from 2.5 to 3 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 33 cm length fits most inserts and wood-burning stoves on the market.",
    shortDescriptionEn: "Extra-dry hardwood logs — oak, hornbeam, beech — 33 cm, shrink-wrapped pallet, below 20% moisture, 2.5 to 3 stères.",
  },
  {
    // 12e entrée : produit auparavant non couvert (voir note en tête de fichier),
    // désormais distinguable de la palette 33 cm grâce à l'indexation par slug.
    slug: "bois-palette-30cm",
    shortDescription:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — de 30 cm, sur palette filmée, humidité sous 20 %, de 2 à 3 stères.",
    description:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — coupées à 30 cm et livrées sur palette " +
      "filmée. " +
      "L'humidité reste sous 20 %, ce qui rend le bois prêt à brûler dès la livraison, sans séchage " +
      "complémentaire. Le film plastique protège les bûches durant le transport ; il se retire dès réception " +
      "pour laisser le bois respirer. Le conditionnement sur palette facilite le déchargement à l'aide d'un " +
      "engin de manutention ou d'un transpalette. Le volume se choisit de 2 à 3 stères selon les besoins. " +
      "La longueur de 30 cm convient à la plupart des inserts et poêles à bûches du marché.",
    descriptionEn: "Extra-dry hardwood logs — oak, hornbeam and beech — cut to 30 cm and delivered on a shrink-wrapped pallet. Moisture content stays below 20%, so the wood is ready to burn on delivery, with no further drying needed. The plastic film protects the logs in transit; remove it on receipt so the wood can breathe. The pallet packaging makes unloading easier with a forklift or pallet truck. Volume can be chosen from 2 to 3 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 30 cm length fits most inserts and wood-burning stoves on the market.",
    shortDescriptionEn: "Extra-dry hardwood logs — oak, hornbeam, beech — 30 cm, shrink-wrapped pallet, below 20% moisture, 2 to 3 stères.",
  },
  {
    slug: "bois-palette-25cm",
    shortDescription:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — de 25 cm, sur palette filmée, humidité sous 20 %, de 1,8 à 3 stères.",
    description:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — coupées à 25 cm et livrées sur palette " +
      "filmée. " +
      "L'humidité reste sous 20 %, ce qui rend le bois prêt à brûler dès la livraison, sans séchage " +
      "complémentaire. Le film plastique protège les bûches durant le transport ; il se retire dès réception " +
      "pour laisser le bois respirer. Le conditionnement sur palette facilite le déchargement à l'aide d'un " +
      "engin de manutention ou d'un transpalette. Le volume se choisit de 1,8 à 3 stères selon les besoins. " +
      "La longueur de 25 cm convient aux foyers et poêles à chambre de combustion compacte.",
    descriptionEn: "Extra-dry hardwood logs — oak, hornbeam and beech — cut to 25 cm and delivered on a shrink-wrapped pallet. Moisture content stays below 20%, so the wood is ready to burn on delivery, with no further drying needed. The plastic film protects the logs in transit; remove it on receipt so the wood can breathe. The pallet packaging makes unloading easier with a forklift or pallet truck. Volume can be chosen from 1.8 to 3 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 25 cm length suits fireplaces and stoves with a compact firebox.",
    shortDescriptionEn: "Extra-dry hardwood logs — oak, hornbeam, beech — 25 cm, shrink-wrapped pallet, below 20% moisture, 1.8 to 3 stères.",
  },
  {
    slug: "bois-palette-50cm",
    shortDescription:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — de 50 cm, sur palette filmée, humidité sous 20 %, de 2 à 3 stères.",
    description:
      "Bûches de feuillus durs extra-secs — chêne, charme et hêtre — coupées à 50 cm et livrées sur palette " +
      "filmée. " +
      "L'humidité reste sous 20 %, ce qui rend le bois prêt à brûler dès la livraison, sans séchage " +
      "complémentaire. Le film plastique protège les bûches durant le transport ; il se retire dès réception " +
      "pour laisser le bois respirer. Le conditionnement sur palette facilite le déchargement à l'aide d'un " +
      "engin de manutention ou d'un transpalette. Le volume se choisit de 2 à 3 stères selon les besoins. " +
      "La longueur de 50 cm convient aux foyers et inserts à grande chambre de combustion.",
    descriptionEn: "Extra-dry hardwood logs — oak, hornbeam and beech — cut to 50 cm and delivered on a shrink-wrapped pallet. Moisture content stays below 20%, so the wood is ready to burn on delivery, with no further drying needed. The plastic film protects the logs in transit; remove it on receipt so the wood can breathe. The pallet packaging makes unloading easier with a forklift or pallet truck. Volume can be chosen from 2 to 3 stères (French cord units, each approx. 0.7 m³ of stacked wood) depending on needs. The 50 cm length suits fireplaces and inserts with a large firebox.",
    shortDescriptionEn: "Extra-dry hardwood logs — oak, hornbeam, beech — 50 cm, shrink-wrapped pallet, below 20% moisture, 2 to 3 stères.",
  },

  // --- Poêles à bois, marques tierces (identifiants : docs/research/identifiants-poeles.md) ---
  {
    slug: "mkt-poele-interstoves-alessia-14-kw",
    shortDescription:
      "Poêle à bûches Interstoves Alessia 14 kW, rendement 82 %, classe énergétique A+, 70 kg, pose par un professionnel exigée.",
    description:
      "Poêle à bois de la marque Interstoves, modèle Alessia, d'une puissance nominale de 14 kW. " +
      "Le rendement mesuré atteint 82 %, conforme à la norme Eco Design 2022, pour une classe " +
      "d'efficacité énergétique A+. L'appareil, en acier, pèse 70 kg et fonctionne exclusivement aux " +
      "bûches, sans électricité. Il permet de chauffer environ 140 m² dans un logement correctement " +
      "isolé. L'installation doit être réalisée par un professionnel qualifié, une exigence posée par " +
      "les compagnies d'assurance habitation pour tout appareil de chauffage au bois raccordé à un " +
      "conduit de fumée.",
    descriptionEn: "Wood-burning stove from Interstoves, Alessia model, with a nominal output of 14 kW. Measured efficiency reaches 82%, compliant with the EcoDesign 2022 standard, for an energy efficiency class of A+. The steel appliance weighs 70 kg and runs solely on logs, with no electricity required. It can heat around 140 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers for any wood-burning heating appliance connected to a flue.",
    shortDescriptionEn: "Interstoves Alessia wood-burning stove, 14 kW, 82% efficiency, energy class A+, 70 kg, professional installation required.",
    gtin: "3760366603266", // gtin13 structuré + tableau EAN, e.leclerc.fr ; recoupé but.fr
    mpn: "ALESSIAC50NOIR",
    energyEfficiencyClass: "A+",
  },
  {
    slug: "mkt-poele-interstoves-juan-14-kw",
    shortDescription:
      "Poêle à bûches Interstoves Juan avec four intégré, 14 kW, rendement 82 %, classe énergétique A+, 70 kg.",
    description:
      "Poêle à bois de la marque Interstoves, modèle Juan, doté d'un four intégré, d'une puissance " +
      "nominale de 14 kW. Le rendement atteint 82 %, conforme à la norme Eco Design 2022, pour une " +
      "classe d'efficacité énergétique A+. L'appareil, en acier, pèse 70 kg et fonctionne " +
      "exclusivement aux bûches, sans électricité. Il permet de chauffer environ 140 m² dans un " +
      "logement correctement isolé. L'installation doit être confiée à un professionnel qualifié, " +
      "une exigence posée par les compagnies d'assurance habitation pour tout appareil de chauffage " +
      "au bois raccordé à un conduit de fumée.",
    descriptionEn: "Wood-burning stove from Interstoves, Juan model, fitted with a built-in oven, with a nominal output of 14 kW. Efficiency reaches 82%, compliant with the EcoDesign 2022 standard, for an energy efficiency class of A+. The steel appliance weighs 70 kg and runs solely on logs, with no electricity required. It can heat around 140 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers for any wood-burning heating appliance connected to a flue.",
    shortDescriptionEn: "Interstoves Juan wood-burning stove with built-in oven, 14 kW, 82% efficiency, energy class A+, 70 kg.",
    gtin: "3760366603273", // gtin13 structuré + tableau EAN, e.leclerc.fr
    mpn: "JUANC50NOIR",
    energyEfficiencyClass: "A+",
  },
  {
    // GTIN volontairement absent : le code releve (7421097382238) porte un prefixe GS1 "742"
    // (Amerique centrale), incoherent avec les deux autres Interstoves du lot ("376", France).
    // Malgre un checksum valide et un recoupement chez plusieurs revendeurs, ce prefixe suggere
    // un code interne de revendeur plutot qu'un GTIN fabricant fiable : le champ reste vide et
    // le flux Merchant basculera sur identifier_exists=no pour cette fiche, ce qui est conforme.
    slug: "mkt-poele-interstoves-matteo-10-kw",
    shortDescription:
      "Poêle à bûches Interstoves Matteo, 10 kW, rendement 78,9 %, Flamme Verte 7 étoiles, classe énergétique A+, 98 kg.",
    description:
      "Poêle à bois de la marque Interstoves, modèle Matteo, d'une puissance nominale de 10 kW. " +
      "Le rendement atteint 78,9 %, conforme à la norme Eco Design 2022 et au label Flamme Verte " +
      "7 étoiles, pour une classe d'efficacité énergétique A+. L'appareil, en acier noir, pèse 98 kg " +
      "et fonctionne exclusivement aux bûches, sans électricité. Il permet de chauffer environ " +
      "100 m² dans un logement correctement isolé. L'installation doit être confiée à un " +
      "professionnel qualifié, une exigence posée par les compagnies d'assurance habitation pour " +
      "tout appareil de chauffage au bois raccordé à un conduit de fumée.",
    descriptionEn: "Wood-burning stove from Interstoves, Matteo model, with a nominal output of 10 kW. Efficiency reaches 78.9%, compliant with the EcoDesign 2022 standard and the Flamme Verte 7-star label, for an energy efficiency class of A+. The black steel appliance weighs 98 kg and runs solely on logs, with no electricity required. It can heat around 100 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers for any wood-burning heating appliance connected to a flue.",
    shortDescriptionEn: "Interstoves Matteo wood-burning stove, 10 kW, 78.9% efficiency, Flamme Verte 7-star, energy class A+, 98 kg.",
    mpn: "MATTEO500NR",
    energyEfficiencyClass: "A+",
  },
  {
    slug: "mkt-poele-deville-sandy-8-kw-lab",
    shortDescription:
      "Poêle à bûches Deville C077BD.06-DD, 8 kW, rendement 77 %, classe énergétique A, 112 kg.",
    description:
      "Poêle à bois de la marque Deville, référence C077BD.06-DD, d'une puissance nominale de 8 kW. " +
      "Le rendement utile atteint 77 %, conforme à la norme EN 13240 et à la réglementation " +
      "Eco Design 2022, pour une classe d'efficacité énergétique A et un indice d'efficacité " +
      "énergétique de 102. L'appareil pèse 112 kg et fonctionne exclusivement aux bûches, sans " +
      "électricité. Il permet de chauffer environ 80 m² dans un logement correctement isolé. " +
      "L'installation doit être confiée à un professionnel qualifié, une exigence posée par les " +
      "compagnies d'assurance habitation.",
    descriptionEn: "Wood-burning stove from Deville, reference C077BD.06-DD, with a nominal output of 8 kW. Useful efficiency reaches 77%, compliant with the EN 13240 standard and the EcoDesign 2022 regulation, for an energy efficiency class of A and an energy efficiency index of 102. The appliance weighs 112 kg and runs solely on logs, with no electricity required. It can heat around 80 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers.",
    shortDescriptionEn: "Deville C077BD.06-DD wood-burning stove, 8 kW, 77% efficiency, EN 13240 compliant, energy class A, 112 kg.",
    gtin: "3244330110009", // itemprop="gtin13", primo-ideo.com ; fiche officielle deville.fr pour le reste
    mpn: "C077BD.06-DD",
    energyEfficiencyClass: "A",
  },
  {
    slug: "mkt-poele-deville-toron-50-8-kw",
    shortDescription:
      "Poêle à bûches Deville Toron 50, référence C07768.06, 8 kW, rendement 77 %, classe A, 150 kg.",
    description:
      "Poêle à bois de la marque Deville, modèle Toron 50, référence C07768.06, d'une puissance " +
      "nominale de 8 kW. Le rendement utile atteint 77 %, conforme à la norme EN 13240 et à la " +
      "réglementation Eco Design 2022, pour une classe d'efficacité énergétique A et un indice " +
      "d'efficacité énergétique de 102. L'appareil pèse 150 kg et fonctionne exclusivement aux " +
      "bûches, sans électricité. Il permet de chauffer environ 80 m² dans un logement correctement " +
      "isolé. L'installation doit être confiée à un professionnel qualifié, une exigence posée par " +
      "les compagnies d'assurance habitation.",
    descriptionEn: "Wood-burning stove from Deville, Toron 50 model, reference C07768.06, with a nominal output of 8 kW. Useful efficiency reaches 77%, compliant with the EN 13240 standard and the EcoDesign 2022 regulation, for an energy efficiency class of A and an energy efficiency index of 102. The appliance weighs 150 kg and runs solely on logs, with no electricity required. It can heat around 80 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers.",
    shortDescriptionEn: "Deville Toron 50 wood-burning stove, reference C07768.06, 8 kW, 77% efficiency, class A, 150 kg.",
    gtin: "3244330110542", // gtin13 structuré poeleplus.fr, recoupé codep.fr ; fiche officielle deville.fr
    mpn: "C07768.06",
    energyEfficiencyClass: "A",
  },
  {
    slug: "mkt-poele-deville-orense-8-kw",
    shortDescription:
      "Poêle à bûches Deville Orense, référence C077CD-06, 8 kW, rendement 77 %, classe énergétique A, 192 kg.",
    description:
      "Poêle à bois de la marque Deville, modèle Orense, référence C077CD-06, d'une puissance " +
      "nominale de 8 kW. Le rendement utile atteint 77 %, conforme à la norme EN 13240 et à la " +
      "réglementation Eco Design 2022, pour une classe d'efficacité énergétique A et un indice " +
      "d'efficacité énergétique de 102. L'appareil pèse 192 kg et fonctionne exclusivement aux " +
      "bûches, sans électricité. Il permet de chauffer environ 80 m² dans un logement correctement " +
      "isolé. L'installation doit être confiée à un professionnel qualifié, une exigence posée par " +
      "les compagnies d'assurance habitation.",
    descriptionEn: "Wood-burning stove from Deville, Orense model, reference C077CD-06, with a nominal output of 8 kW. Useful efficiency reaches 77%, compliant with the EN 13240 standard and the EcoDesign 2022 regulation, for an energy efficiency class of A and an energy efficiency index of 102. The appliance weighs 192 kg and runs solely on logs, with no electricity required. It can heat around 80 m² in a properly insulated home. Installation must be carried out by a qualified professional, a requirement set by home insurers.",
    shortDescriptionEn: "Deville Orense wood-burning stove, reference C077CD-06, 8 kW, 77% efficiency, energy class A, 192 kg.",
    gtin: "3244330110696", // gtin13 + sku + mpn structurés, poeleplus.fr ; fiche officielle deville.fr
    mpn: "C077CD-06",
    energyEfficiencyClass: "A",
  },
  {
    // Reference fabricant actuelle C077BXN-06 (l'ancienne C077BX-06 est en fin de vie chez
    // Deville) ; c'est le GTIN associe a cette reference actuelle qui est retenu.
    slug: "mkt-poele-deville-eguzki-etanche-6-kw",
    shortDescription:
      "Poêle à bûches étanche Deville Eguzki, référence C077BXN-06, 6 kW, rendement 75 %, classe A, 124 kg.",
    description:
      "Poêle à bois étanche de la marque Deville, modèle Eguzki, référence C077BXN-06, d'une " +
      "puissance nominale de 6 kW. Le rendement utile atteint 75 %, avec un rendement saisonnier de " +
      "65 %, conforme à la norme EN 16510 et au label Flamme Verte, pour une classe d'efficacité " +
      "énergétique A et un indice d'efficacité énergétique de 99. Étanche, il puise l'air de " +
      "combustion à l'extérieur du logement. L'appareil pèse 124 kg et fonctionne exclusivement aux " +
      "bûches, sans électricité. Il permet de chauffer environ 60 m² dans un logement correctement " +
      "isolé, avec une pose confiée à un professionnel qualifié.",
    descriptionEn: "Airtight wood-burning stove from Deville, Eguzki model, reference C077BXN-06, with a nominal output of 6 kW. Useful efficiency reaches 75%, with a seasonal efficiency of 65%, compliant with the EN 16510 standard and the Flamme Verte label, for an energy efficiency class of A and an energy efficiency index of 99. Being airtight, it draws combustion air from outside the home. The appliance weighs 124 kg and runs solely on logs, with no electricity required. It can heat around 60 m² in a properly insulated home, with installation carried out by a qualified professional.",
    shortDescriptionEn: "Deville Eguzki airtight wood-burning stove, reference C077BXN-06, 6 kW, 75% efficiency, class A, 124 kg.",
    gtin: "3244330110801", // proxiconfort.fr + blancbrun.fr, associé à la référence actuelle C077BXN-06
    mpn: "C077BXN-06",
    energyEfficiencyClass: "A",
  },
  {
    slug: "mkt-poele-la-nordica-extraflame-isetta-evo-4-0",
    shortDescription:
      "Poêle à bûches La Nordica Extraflame Isetta Evo 4.0, 7,3 kW, rendement 83,6 %, classe énergétique A+, 160 kg.",
    description:
      "Poêle à bois de la marque La Nordica Extraflame, modèle Isetta Evo 4.0, d'une puissance " +
      "nominale de 7,3 kW. Le rendement atteint 83,6 %, conforme à la norme NF EN 13240 et à la " +
      "réglementation Eco Design 2022, pour une classe d'efficacité énergétique A+. L'appareil pèse " +
      "160 kg, avec un raccord de fumée en sortie arrière ou dessus et un diamètre de buse de " +
      "150 mm. Il fonctionne exclusivement aux bûches, sans électricité, et permet de chauffer un " +
      "volume d'environ 338 m³ dans un logement correctement isolé. L'installation doit être " +
      "confiée à un professionnel qualifié.",
    descriptionEn: "Wood-burning stove from La Nordica Extraflame, Isetta Evo 4.0 model, with a nominal output of 7.3 kW. Efficiency reaches 83.6%, compliant with the NF EN 13240 standard and the EcoDesign 2022 regulation, for an energy efficiency class of A+. The appliance weighs 160 kg, with a flue outlet at the rear or top and a flue pipe diameter of 150 mm. It runs solely on logs, with no electricity required, and can heat a volume of around 338 m³ in a properly insulated home. Installation must be carried out by a qualified professional.",
    shortDescriptionEn: "La Nordica Extraflame Isetta Evo 4.0 wood-burning stove, 7.3 kW, 83.6% efficiency, energy class A+, 160 kg.",
    gtin: "8022724371008", // itemprop="gtin13" + EAN visible, maison-energy.com ; recoupé chemineeo.fr
    mpn: "7119002", // référence numérique reprise par chemineeo.fr et bernay-habitat.com
    energyEfficiencyClass: "A+",
  },

  // --- Granulés de bois, marques tierces (identifiants : docs/research/identifiants-granules.md) ---
  {
    slug: "mkt-granules-starforest-palette",
    shortDescription:
      "Granulés de bois résineux Starforest, DINplus classe A1, cendres sous 0,7 %, palette de 70 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, certifiés DINplus (n° 7A268), classe A1, conformes à la " +
      "norme DIN EN ISO 17225-2. Le taux de cendres reste inférieur ou égal à 0,7 %, pour une " +
      "humidité inférieure ou égale à 10 % et un pouvoir calorifique supérieur ou égal à 5 kWh par " +
      "kilogramme. Le diamètre des granulés est de 6 mm. La palette regroupe 70 sacs de 15 kg, soit " +
      "environ 1,05 tonne, sous film de protection. Ces granulés conviennent aux poêles, aux " +
      "inserts et aux chaudières à granulés de bois.",
    descriptionEn: "Wood pellets, 100% softwood, certified DINplus (no. 7A268), class A1, compliant with the DIN EN ISO 17225-2 standard. Ash content stays at or below 0.7%, with moisture at or below 10% and a calorific value of at least 5 kWh per kilogram. Pellet diameter is 6 mm. The pallet holds 70 bags of 15 kg, about 1.05 tonnes, under protective film. These pellets suit pellet stoves, inserts and pellet boilers.",
    shortDescriptionEn: "Starforest softwood pellets, DINplus class A1, ash below 0.7%, moisture at or below 10%, pallet of 70 bags of 15 kg.",
  },
  {
    slug: "crepito-granules-crepito-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Crépito, certifiés DINplus, cendres environ 0,5 %, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois vierge sans additif, certifiés DINplus (n° 7A288), conformes à la norme " +
      "DIN EN ISO 17225-2. Le taux de cendres avoisine 0,5 %, pour une humidité inférieure ou " +
      "égale à 8 % et un pouvoir calorifique compris entre 4,7 et 5,3 kWh par kilogramme. La " +
      "palette regroupe 66 sacs de 15 kg, soit environ 0,99 tonne. Ces granulés conviennent aux " +
      "poêles, aux inserts et aux chaudières à granulés de bois, pour un chauffage au bois sans " +
      "électricité.",
    descriptionEn: "Virgin wood pellets with no additive, certified DINplus (no. 7A288), compliant with the DIN EN ISO 17225-2 standard for solid biofuels. Ash content is around 0.5%, with moisture at or below 8% and a calorific value between 4.7 and 5.3 kWh per kilogram. The pallet holds 66 bags of 15 kg, about 0.99 tonnes in total, shrink-wrapped for handling and storage. These pellets suit pellet stoves, pellet inserts and pellet boilers, for wood heating that requires no electricity.",
    shortDescriptionEn: "Crépito virgin wood pellets, DINplus certified, ash around 0.5%, moisture at or below 8%, pallet of 66 bags of 15 kg.",
    shippingWeightGrams: 990000, // 66 sacs de 15 kg, calcul déjà porté par le bullet en base
  },
  {
    // Certification DINplus evoquee par des revendeurs (n° 7A329) mais non confirmee au registre
    // DIN CERTCO officiel malgre plusieurs verifications : non retenue dans la description.
    slug: "butagaz-granules-butagaz-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Butagaz, 100 % résineux, cendres 0,4 %, humidité 6,5 %, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, issus de sciures locales comprimées sans additif chimique. " +
      "Le taux de cendres atteint 0,4 %, pour une humidité de 6,5 % et un pouvoir calorifique " +
      "supérieur ou égal à 4,9 kWh par kilogramme. Le diamètre des granulés est de 6,10 mm. La " +
      "palette regroupe 66 sacs de 15 kg, soit environ 0,99 tonne. Ces granulés conviennent aux " +
      "poêles, aux inserts et aux chaudières à granulés de bois, pour un chauffage au bois sans " +
      "électricité.",
    descriptionEn: "Wood pellets, 100% softwood, made from local sawdust compressed with no chemical additive. Ash content reaches 0.4%, with moisture of 6.5% and a calorific value of at least 4.9 kWh per kilogram. Pellet diameter is 6.10 mm. The pallet holds 66 bags of 15 kg, about 0.99 tonnes in total, shrink-wrapped for handling and storage. These pellets suit pellet stoves, pellet inserts and pellet boilers, for wood heating that requires no electricity.",
    shortDescriptionEn: "Butagaz wood pellets, 100% softwood, ash 0.4%, moisture 6.5%, calorific value at least 4.9 kWh/kg, pallet of 66 bags of 15 kg.",
    shippingWeightGrams: 990000, // 66 sacs de 15 kg, calcul déjà porté par le bullet en base
  },
  {
    slug: "helios-granules-helios-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Hélios, DINplus classe A1, cendres 0,30 %, diamètre 6 mm, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, certifiés DINplus (n° 7A219), classe A1, conformes à la " +
      "norme DIN EN ISO 17225-2. Le taux de cendres officiel s'établit à 0,30 %, pour une humidité " +
      "inférieure ou égale à 8 % et un pouvoir calorifique de 4,9 kWh par kilogramme. Le diamètre " +
      "des granulés est de 6 mm. La palette regroupe 66 sacs de 15 kg. Ces granulés conviennent " +
      "aux poêles, aux inserts et aux chaudières à granulés de bois, pour un chauffage au bois " +
      "sans électricité.",
    descriptionEn: "Wood pellets, 100% softwood, certified DINplus (no. 7A219), class A1, compliant with the DIN EN ISO 17225-2 standard. Official ash content is set at 0.30%, with moisture at or below 8% and a calorific value of 4.9 kWh per kilogram. Pellet diameter is 6 mm. The pallet holds 66 bags of 15 kg. These pellets suit pellet stoves, inserts and pellet boilers, for wood heating with no electricity required.",
    shortDescriptionEn: "Hélios wood pellets, DINplus class A1, ash 0.30%, calorific value 4.9 kWh/kg, pallet of 66 bags of 15 kg.",
  },
  {
    slug: "cogra-granules-cogra-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Cogra, certifiés DINplus classe A1, cendres 0,5 à 0,7 %, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, certifiés DINplus (n° 7A140), classe A1, conformes à la " +
      "norme DIN EN ISO 17225-2. Le taux de cendres se situe entre 0,50 % et 0,70 % selon les " +
      "lots, pour une humidité comprise entre 5 % et 6 % et un pouvoir calorifique compris entre " +
      "5,0 et 5,2 kWh par kilogramme. La palette regroupe 66 sacs de 15 kg, soit environ 0,99 " +
      "tonne. Ces granulés conviennent aux poêles, aux inserts et aux chaudières à granulés de " +
      "bois, pour un chauffage au bois sans électricité.",
    descriptionEn: "Wood pellets, 100% softwood, certified DINplus (no. 7A140), class A1, compliant with the DIN EN ISO 17225-2 standard. Ash content ranges between 0.50% and 0.70% depending on the batch, with moisture between 5% and 6% and a calorific value between 5.0 and 5.2 kWh per kilogram. The pallet holds 66 bags of 15 kg, about 0.99 tonnes. These pellets suit pellet stoves, inserts and pellet boilers, for wood heating with no electricity required.",
    shortDescriptionEn: "Cogra wood pellets, DINplus class A1 certified, ash 0.5 to 0.7%, moisture 5 to 6%, pallet of 66 bags of 15 kg.",
    shippingWeightGrams: 990000, // 66 sacs de 15 kg, calcul déjà porté par le bullet en base
  },
  {
    slug: "mkt-granules-total-energies-palette",
    shortDescription:
      "Granulés de bois TotalEnergies, sciure française, DINplus classe A1, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, issus de sciure de scierie française, certifiés DINplus " +
      "(n° 7A269), classe A1, conformes à la norme DIN EN ISO 17225-2. Le taux de cendres se " +
      "situe entre 0,6 % et 0,7 %, pour une humidité inférieure ou égale à 8 % et un pouvoir " +
      "calorifique compris entre 4,8 et 5,3 kWh par kilogramme. Le diamètre des granulés est de " +
      "6 mm. La palette regroupe 66 sacs de 15 kg, soit environ 0,99 tonne. Ces granulés " +
      "conviennent aux poêles, aux inserts et aux chaudières à granulés de bois.",
    descriptionEn: "Wood pellets, 100% softwood, made from sawdust from a French sawmill, certified DINplus (no. 7A269), class A1, compliant with the DIN EN ISO 17225-2 standard. Ash content ranges between 0.6% and 0.7%, with moisture at or below 8% and a calorific value between 4.8 and 5.3 kWh per kilogram. Pellet diameter is 6 mm. The pallet holds 66 bags of 15 kg, about 0.99 tonnes. These pellets suit pellet stoves, inserts and pellet boilers.",
    shortDescriptionEn: "TotalEnergies wood pellets, French sawmill sawdust, DINplus class A1, ash 0.6 to 0.7%, pallet of 66 bags of 15 kg.",
  },
  {
    // Correction : le bullet en base annoncait a tort "Certifie ENplus A1". La recherche
    // (registre DIN CERTCO, fabricant GDM Group, plusieurs distributeurs) etablit une
    // certification DINplus, sans aucune trace d'ENplus. C'est DINplus qui figure ci-dessous.
    slug: "limouzi-limouzi-granules-enplus-a1-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Limouzi, résineux du Limousin, certifiés DINplus et PEFC, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux, épicéa et douglas du Limousin, certifiés DINplus " +
      "(n° 7A243) et PEFC, classe A1, conformes à la norme DIN EN ISO 17225-2. Le taux de cendres " +
      "reste inférieur à 0,5 %, pour une humidité inférieure à 8 % et un pouvoir calorifique de " +
      "4,8 kWh par kilogramme. Le diamètre des granulés est de 6 mm. La palette regroupe 66 sacs " +
      "de 15 kg. Ces granulés conviennent aux poêles, aux inserts et aux chaudières à granulés de " +
      "bois, pour un chauffage au bois sans électricité.",
    descriptionEn: "Wood pellets, 100% softwood, spruce and Douglas fir from the Limousin region, certified DINplus (no. 7A243) and PEFC, class A1, compliant with the DIN EN ISO 17225-2 standard. Ash content stays below 0.5%, with moisture below 8% and a calorific value of 4.8 kWh per kilogram. Pellet diameter is 6 mm. The pallet holds 66 bags of 15 kg. These pellets suit pellet stoves, inserts and pellet boilers, for wood heating with no electricity required.",
    shortDescriptionEn: "Limouzi wood pellets, Limousin spruce and Douglas fir, DINplus and PEFC certified, ash below 0.5%, pallet of 66 bags of 15 kg.",
  },
  {
    slug: "woodstock-granules-woodstock-palette-de-66-sacs-de-15-kg",
    shortDescription:
      "Granulés de bois Woodstock, doublement certifiés DINplus et NF Biocombustibles, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois vierge, certifiés DINplus (n° 7A288) et NF Biocombustibles Solides " +
      "Granulés (n° D79360-016, FCBA), conformes à la norme DIN EN ISO 17225-2. Le taux de cendres " +
      "reste inférieur ou égal à 0,5 %, pour une humidité inférieure ou égale à 8 % et un pouvoir " +
      "calorifique compris entre 4,8 et 5,3 kWh par kilogramme. Le diamètre des granulés est de " +
      "6 mm. La palette regroupe 66 sacs de 15 kg, soit environ 1,17 tonne. Ces granulés " +
      "conviennent aux poêles, aux inserts et aux chaudières à granulés de bois.",
    descriptionEn: "Virgin wood pellets, certified DINplus (no. 7A288) and NF Biocombustibles Solides Granulés (no. D79360-016, FCBA), compliant with the DIN EN ISO 17225-2 standard. Ash content stays at or below 0.5%, with moisture at or below 8% and a calorific value between 4.8 and 5.3 kWh per kilogram. Pellet diameter is 6 mm. The pallet holds 66 bags of 15 kg, about 1.17 tonnes. These pellets suit pellet stoves, inserts and pellet boilers.",
    shortDescriptionEn: "Woodstock virgin wood pellets, dual-certified DINplus and NF Biocombustibles, ash at or below 0.5%, pallet of 66 bags of 15 kg.",
  },
  {
    slug: "mkt-granules-badger-palette",
    shortDescription:
      "Granulés de bois Badger, résineux écorcé, certifiés DINplus classe A1, palette de 66 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux écorcé, fabriqués à Virton et à Thimister, en Belgique, " +
      "certifiés DINplus (n° 7A072), classe A1, conformes à la norme DIN EN ISO 17225-2. Le taux " +
      "de cendres reste faible, pour une humidité inférieure à 10 % et un diamètre de granulés de " +
      "6 mm. La palette regroupe 66 sacs de 15 kg, soit environ 0,99 tonne. Ces granulés " +
      "conviennent aux poêles, aux inserts et aux chaudières à granulés de bois, pour un chauffage " +
      "au bois sans électricité.",
    descriptionEn: "Wood pellets, 100% debarked softwood, made in Virton and Thimister, Belgium, certified DINplus (no. 7A072), class A1, compliant with the DIN EN ISO 17225-2 standard. Ash content stays low, with moisture below 10% and a pellet diameter of 6 mm. The pallet holds 66 bags of 15 kg, about 0.99 tonnes. These pellets suit pellet stoves, inserts and pellet boilers, for wood heating with no electricity required.",
    shortDescriptionEn: "Badger wood pellets, debarked softwood made in Belgium, DINplus class A1 certified, pallet of 66 bags of 15 kg.",
  },
  {
    slug: "mkt-granules-piveteau-hp-plus-palette",
    shortDescription:
      "Granulés de bois Piveteau HP+, résineux français, DINplus, cendres sous 0,35 %, palette de 72 sacs de 15 kg.",
    description:
      "Granulés de bois 100 % résineux français — pin, douglas, épicéa —, certifiés DINplus " +
      "(n° 7A109), conformes à la norme DIN EN ISO 17225-2. Le taux de cendres reste inférieur ou " +
      "égal à 0,35 %, pour une humidité inférieure à 6,5 % et un pouvoir calorifique supérieur à " +
      "4,85 kWh par kilogramme. Le diamètre des granulés est de 6 mm et la densité en vrac atteint " +
      "au moins 650 kg par mètre cube. La palette regroupe 72 sacs de 15 kg, soit environ 1,08 " +
      "tonne. Ces granulés conviennent aux poêles, aux inserts et aux chaudières à granulés de " +
      "bois.",
    descriptionEn: "Wood pellets, 100% French softwood — pine, Douglas fir, spruce —, certified DINplus (no. 7A109), compliant with the DIN EN ISO 17225-2 standard. Ash content stays at or below 0.35%, with moisture below 6.5% and a calorific value above 4.85 kWh per kilogram. Pellet diameter is 6 mm and bulk density reaches at least 650 kg per cubic metre. The pallet holds 72 bags of 15 kg, about 1.08 tonnes. These pellets suit pellet stoves, inserts and pellet boilers.",
    shortDescriptionEn: "Piveteau HP+ wood pellets, French softwood, DINplus certified, ash below 0.35%, calorific value above 4.85 kWh/kg, pallet of 72 bags of 15 kg.",
  },

  // --- Bûches compressées, marques tierces (identifiants : docs/research/identifiants-granules.md) ---
  {
    slug: "crepito-buches-compressees-hetre-960-kg",
    shortDescription:
      "Bûches compressées rondes Crépito hêtre, cendres sous 1,5 %, PCI 4,9 kWh/kg, palette de 96 paquets de 10 kg.",
    description:
      "Bûches compressées rondes, composées de sciures et de copeaux de bois non traités, sans " +
      "liant chimique, de la gamme hêtre. Le taux de cendres reste inférieur ou égal à 1,5 %, pour " +
      "une humidité inférieure ou égale à 12 % et un pouvoir calorifique de 4,9 kWh par kilogramme. " +
      "Chaque bûche brûle environ une heure à une heure et demie. La qualité est contrôlée par le " +
      "laboratoire CERIC, avec la mention Bois de France. La palette regroupe 96 paquets de 10 kg, " +
      "soit 960 kg. Ces bûches conviennent aux poêles, aux inserts et aux chaudières à bois.",
    descriptionEn: "Round compressed logs, made from untreated wood sawdust and shavings with no chemical binder, from the beech range. Ash content stays at or below 1.5%, with moisture at or below 12% and a calorific value of 4.9 kWh per kilogram. Each log burns for around one to one and a half hours. Quality is checked by the CERIC laboratory, carrying the Bois de France mark. The pallet holds 96 packs of 10 kg, totalling 960 kg. These logs suit wood stoves, inserts and wood boilers.",
    shortDescriptionEn: "Crépito round compressed beech logs, ash below 1.5%, burns about 1 to 1.5 hours per log, pallet of 96 packs of 10 kg.",
  },
  {
    slug: "ma-buchhetre-manubois-ronde-900-kg",
    shortDescription:
      "Bûches compressées rondes à trou Ma Bûch'Hêtre, densité supérieure à 1 050 kg/m³, palette de 90 paquets de 10 kg.",
    description:
      "Bûches compressées rondes à trou, à base de hêtre, sans écorce ni additif, produites par " +
      "Manubois. Le taux de cendres reste inférieur à 0,5 %, pour une humidité inférieure à 8 % " +
      "et un pouvoir calorifique de 4,8 kWh par kilogramme. La densité dépasse 1 050 kg par mètre " +
      "cube, pour une durée de combustion d'environ une heure et demie à deux heures et demie par " +
      "bûche, avec un allumage plus rapide qu'une bûche traditionnelle. La palette regroupe 90 " +
      "paquets de 10 kg, soit 900 kg. Ces bûches conviennent aux poêles, aux inserts et aux " +
      "chaudières à bois.",
    descriptionEn: "Round hollow-core compressed logs made from beech, with no bark or additive, produced by Manubois. Ash content stays below 0.5%, with moisture below 8% and a calorific value of 4.8 kWh per kilogram. Density exceeds 1,050 kg per cubic metre, giving a burn time of around one and a half to two and a half hours per log, with faster lighting than a traditional log. The pallet holds 90 packs of 10 kg, totalling 900 kg. These logs suit wood stoves, inserts and wood boilers.",
    shortDescriptionEn: "Ma Bûch'Hêtre round hollow-core compressed beech logs, density above 1,050 kg/m³, moisture below 8%, pallet of 90 packs of 10 kg.",
  },
  {
    slug: "ruf-ruf-buches-compressees-palette-960-kg",
    shortDescription:
      "Briquettes de bois RUF, hêtre ou chêne, densité 1,0 à 1,1 kg/dm³, palette de 960 kg.",
    description:
      "Briquettes de bois compressées, en hêtre ou en chêne selon la variante, sans liant " +
      "chimique, obtenues par une compression comprise entre 200 et 400 bars. Le taux de cendres " +
      "avoisine 1,0 %, pour un pouvoir calorifique compris entre 4,7 et 5,3 kWh par kilogramme et " +
      "une densité comprise entre 1,0 et 1,1 kg par décimètre cube. La combustion se déroule en " +
      "deux temps : environ deux heures de flamme, suivies d'environ deux heures de braise. " +
      "Conditionnées en palette de 960 kg, ces briquettes conviennent aux poêles, aux inserts et " +
      "aux chaudières à bois.",
    descriptionEn: "Compressed wood briquettes, in beech or oak depending on the variant, with no chemical binder, produced under a compression of 200 to 400 bars. Ash content is around 1.0%, with a calorific value between 4.7 and 5.3 kWh per kilogram and a density between 1.0 and 1.1 kg per cubic decimetre. Burning happens in two stages: around two hours of flame, followed by around two hours of ember. Packed on a 960 kg pallet, these briquettes suit wood stoves, inserts and wood boilers.",
    shortDescriptionEn: "RUF compressed wood briquettes, beech or oak, pressed at 200 to 400 bars, density 1.0 to 1.1 kg/dm³, pallet of 960 kg.",
    shippingWeightGrams: 960000, // palette 960 kg, docs/research/identifiants-granules.md
  },
  {
    slug: "nestro-nestro-buches-compressees-palette-900-kg",
    shortDescription:
      "Briquettes de bois cylindriques NESTRO, hêtre et/ou chêne, certifiées FSC, palette de 900 kg.",
    description:
      "Briquettes de bois compressées de forme cylindrique, en hêtre et/ou en chêne, sans liant " +
      "chimique, obtenues par pressage hydraulique à excentrique. La marque revendique la " +
      "certification FSC. Le pouvoir calorifique atteint environ 5,2 kWh par kilogramme. " +
      "Conditionnées en palette de 900 kg, ces briquettes se destinent aux poêles, aux inserts et " +
      "aux chaudières à bois, en chauffage principal ou d'appoint selon l'installation et le " +
      "volume à chauffer du logement.",
    descriptionEn: "Cylindrical compressed wood briquettes, in beech and/or oak, with no chemical binder, produced by eccentric hydraulic pressing. The brand claims FSC certification. Calorific value reaches around 5.2 kWh per kilogram. Packed on a 900 kg pallet, these briquettes are intended for wood stoves, inserts and wood boilers, as primary or supplementary heating depending on the installation and the volume to be heated in the home.",
    shortDescriptionEn: "NESTRO cylindrical compressed wood briquettes, beech and/or oak, FSC certified, calorific value about 5.2 kWh/kg, pallet of 900 kg.",
    shippingWeightGrams: 900000, // palette 900 kg, docs/research/identifiants-granules.md
  },
  {
    // Piege de nommage signale par la recherche : le nom produit en base porte "NESTRO", mais
    // la marque enregistree est PINI KAY. La description ci-dessous decrit le produit reellement
    // identifie (Pini Kay, pressage octogonal), et non la marque NESTRO du titre.
    slug: "pini-kay-nestro-buches-compressees-palette-960-kg",
    shortDescription:
      "Briquettes de bois octogonales Pini Kay, densité 1,25 g/cm³, tenue de braise 4 à 5 h, palette de 960 kg.",
    description:
      "Briquettes de bois compressées de forme octogonale, en hêtre et en chêne, sans liant " +
      "chimique. Le taux de cendres atteint 0,5 %, pour une humidité d'environ 8 % et un pouvoir " +
      "calorifique de 5,3 kWh par kilogramme. La densité atteint 1,25 g par centimètre cube, pour " +
      "une tenue de braise de quatre à cinq heures. Conditionnées en paquets de 10 kg, soit " +
      "environ 96 paquets par palette de 960 kg, ces briquettes conviennent aux poêles, aux " +
      "inserts et aux chaudières à bois.",
    descriptionEn: "Octagonal compressed wood briquettes, made from beech and oak, with no chemical binder. Ash content reaches 0.5%, with moisture of around 8% and a calorific value of 5.3 kilowatt-hours per kilogram. Density reaches 1.25 grams per cubic centimetre, giving an ember life of four to five hours after the flame stage. Packed in 10 kg packs, about 96 packs per 960 kg pallet, these briquettes suit wood stoves, inserts and wood boilers for a steady, long-lasting heat.",
    shortDescriptionEn: "Pini Kay octagonal wood briquettes, beech and oak, density 1.25 g/cm³, ember life 4 to 5 hours, pallet of 960 kg.",
    shippingWeightGrams: 960000, // palette 960 kg, docs/research/identifiants-granules.md
  },
];
