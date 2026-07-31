/**
 * Décline le logo MLC Bois en tous les fichiers dont le site a besoin.
 *
 * Le logo est un cartouche rectangulaire encadré d'un filet : à gauche un
 * panneau portant un arbre, à droite le nom « MLC BOIS » au-dessus d'une scène
 * — tas de granulés, bûches, sac, flamme — et du descripteur
 * « BOIS DE CHAUFFAGE & PELLETS ». Composition horizontale, de rapport voisin
 * de deux pour un.
 *
 * Deux dérivations, deux problèmes distincts :
 *
 * 1. Le trait est brun très sombre et disparaîtrait sur le pied de page et le
 *    menu du back-office, tous deux noirs. On le repeint en crème, avec un
 *    seuil réglé pour épargner les bruns moyens du tronc et des bûches, les
 *    verts du feuillage et l'orange de la flamme : la scène garde ses
 *    couleurs, seul le trait s'éclaire.
 *
 * 2. Le logo entier, réduit à la taille d'un favicon, n'est plus qu'une tache.
 *    On n'en garde donc que le panneau de gauche, dont l'arbre reste
 *    identifiable à seize pixels. Le panneau est repéré sur le filet vertical
 *    qui le sépare du reste, et non sur une largeur écrite en dur : un logo
 *    redessiné n'aurait pas les mêmes proportions.
 *
 * Fichiers produits :
 *   public/images/logo-full.png        version d'origine — en-tête, e-mails, SEO
 *   public/images/logo-full-light.png  version claire    — pied de page, back-office
 *   public/images/logo-icon.png        panneau de l'arbre, cadré carré
 *   src/app/icon.png                   favicon (Next.js lit ce nom de fichier)
 *
 * Usage : node scripts/generer-logos.mjs [logo-source.png]
 */

import sharp from "sharp";
import path from "node:path";

// L'original vit hors de « public » : ce dossier est servi tel quel, et rien
// n'oblige à exposer les fichiers de travail de la marque.
const SOURCE = process.argv[2] ?? "assets/marque/logo-source.png";

/** Crème du pied de page (--footer-foreground dans globals.css). */
const CLAIR = [247, 242, 234];

/**
 * En deçà de ce niveau sur les trois canaux, le pixel appartient au trait et
 * non à la scène. Mesuré sur le logo : le lettrage et le filet tombent vers
 * 48, le tronc et les bûches vers 72 à 168, le feuillage et la flamme bien
 * au-dessus. À 90, on prend le trait et on laisse la couleur.
 */
const SEUIL_TRAIT = 90;

/** Part du côté laissée en marge autour du panneau dans le favicon. */
const MARGE_FAVICON = 0.1;

/** Repeint le trait sombre en crème, sans toucher aux couleurs de la scène. */
function eclaircir(data) {
  const sortie = Buffer.from(data);
  for (let i = 0; i < sortie.length; i += 4) {
    if (sortie[i + 3] === 0) continue;
    if (sortie[i] < SEUIL_TRAIT && sortie[i + 1] < SEUIL_TRAIT && sortie[i + 2] < SEUIL_TRAIT) {
      [sortie[i], sortie[i + 1], sortie[i + 2]] = CLAIR;
    }
  }
  return sortie;
}

/**
 * Largeur du panneau de gauche, lue sur les filets verticaux du cadre.
 *
 * Un filet vertical se reconnaît à une colonne opaque sur presque toute la
 * hauteur. Le premier groupe est le bord gauche du cadre, le deuxième est la
 * séparation cherchée.
 */
function largeurDuPanneau(data, info) {
  const filets = [];
  let debut = null;

  for (let x = 0; x < info.width; x += 1) {
    let opaques = 0;
    for (let y = 0; y < info.height; y += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 150) opaques += 1;
    }
    const plein = opaques / info.height > 0.85;

    if (plein && debut === null) debut = x;
    if (!plein && debut !== null) {
      filets.push([debut, x - 1]);
      debut = null;
    }
  }
  if (debut !== null) filets.push([debut, info.width - 1]);

  if (filets.length < 2) {
    throw new Error(
      `Cadre non reconnu : ${filets.length} filet(s) vertical(aux) trouvé(s), au moins 2 attendus. ` +
        "Le logo a changé de structure, revoir le découpage du favicon.",
    );
  }

  // Fin du deuxième filet : le panneau garde sa propre séparation comme bord.
  return filets[1][1] + 1;
}

async function main() {
  const { data, info } = await sharp(SOURCE)
    .trim()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(
    `Source rognée : ${info.width} × ${info.height} (rapport ${(info.width / info.height).toFixed(2)})`,
  );

  const brut = { raw: { width: info.width, height: info.height, channels: 4 } };

  await sharp(data, brut).png().toFile("public/images/logo-full.png");
  await sharp(eclaircir(data), brut).png().toFile("public/images/logo-full-light.png");

  // --- Favicon : le panneau de gauche, cadré carré sur fond blanc opaque.
  // Opaque et non transparent : l'onglet du navigateur peut être clair ou
  // sombre selon le thème, et un trait brun sur transparent disparaîtrait
  // dans le second cas.
  const largeur = largeurDuPanneau(data, info);
  const panneau = await sharp(data, brut)
    .extract({ left: 0, top: 0, width: largeur, height: info.height })
    .png()
    .toBuffer();

  const cote = Math.round(Math.max(largeur, info.height) * (1 + MARGE_FAVICON * 2));

  // La composition va jusqu'à un tampon avant toute réduction : dans sharp,
  // `resize()` porte sur le fond et s'applique AVANT le composite, si bien
  // qu'enchaîner les deux collerait le panneau en pleine taille sur un fond
  // déjà rétréci.
  const carre = await sharp({
    create: {
      width: cote,
      height: cote,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: panneau, gravity: "center" }])
    .png()
    .toBuffer();

  await sharp(carre).toFile("public/images/logo-icon.png");
  await sharp(carre).resize(180, 180).png().toFile(path.join("src", "app", "icon.png"));

  console.log(`Favicon : panneau de ${largeur} px de large, cadré en ${cote} carré.`);
  console.log("Écrits : logo-full.png, logo-full-light.png, logo-icon.png, src/app/icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
