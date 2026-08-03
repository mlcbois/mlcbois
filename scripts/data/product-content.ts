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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
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
    descriptionEn: "", // rempli en tâche 8
    shortDescriptionEn: "", // rempli en tâche 8
    shippingWeightGrams: 960000, // palette 960 kg, docs/research/identifiants-granules.md
  },
];
