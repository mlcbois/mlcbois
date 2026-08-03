import type { ProductContent } from "../../src/lib/productContent";

/**
 * Contenu rédigé produit par produit, indexé par SKU.
 *
 * Chaque GTIN est accompagné en commentaire de la source où il a été relevé :
 * sans source vérifiable, le champ reste absent et le flux bascule
 * automatiquement sur identifier_exists « no ».
 *
 * NOTE — bug de données identifié lors de la tâche 6 (non corrigé ici, hors
 * périmètre) : `scripts/seed-bois-variations.ts` génère le SKU par troncature
 * du slug à 12 caractères alphanumériques (`skuFromSlug`). Les slugs
 * "bois-palette-30cm" et "bois-palette-33cm" partagent les mêmes 12 premiers
 * caractères ("boispalette3") et produisent donc le même SKU "BOISPALETTE3"
 * pour deux produits distincts en base (palette 30 cm et palette 33 cm).
 * Ajouter deux entrées avec ce SKU ferait échouer `validateProductContent`
 * ("SKU en double") pour tout le fichier, y compris les entrées déjà propres
 * des tâches 7/8/9. En attendant la correction du SKU en base (migration
 * hors périmètre de cette tâche), seule la palette 33 cm est couverte
 * ci-dessous ; la palette 30 cm reste sans contenu rédigé.
 */
export const PRODUCT_CONTENT: ProductContent[] = [
  // --- Bûches prêtes à brûler, marque MLC Bois ---
  {
    sku: "MLCBOISHET",
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
    sku: "MLCBOISCHE",
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
    sku: "MLCBOISBOU",
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
    sku: "MLCBOISFRE",
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
    sku: "BOISVRAC50CM",
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
    sku: "BOISVRAC33CM",
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
    sku: "BOISVRAC25CM",
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
    sku: "BOISPALETTE4",
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
    // SKU partagé en base avec le produit « palette 30 cm » (bug de troncature dans
    // skuFromSlug, voir note en tête de fichier) : seule la palette 33 cm est couverte.
    sku: "BOISPALETTE3",
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
    sku: "BOISPALETTE2",
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
    sku: "BOISPALETTE5",
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
];
