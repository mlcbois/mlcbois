/**
 * Décline le logo MLC Bois en tous les fichiers dont le site a besoin.
 *
 * Le logo est un médaillon rond : un arbre, une flamme, des bûches et un sac
 * de granulés, cerclés d'un filet, au-dessus du nom et du descripteur
 * « BOIS DE CHAUFFAGE & PELLETS ». Composition verticale, presque carrée —
 * c'est ce qui commande les hauteurs d'affichage un peu plus généreuses que
 * pour un logo en bandeau.
 *
 * Le lettrage est brun très sombre : il disparaîtrait sur le pied de page et
 * le menu du back-office, tous deux noirs. On en dérive donc une variante
 * claire en repeignant les pixels les plus sombres — le lettrage, le filet du
 * médaillon et les contours — en crème. Le seuil est réglé pour épargner les
 * bruns moyens du tronc et des bûches, ainsi que les verts du feuillage et
 * l'orange de la flamme : la scène garde ses couleurs, seul le trait s'éclaire.
 *
 * Fichiers produits :
 *   public/images/logo-full.png        version d'origine — en-tête, e-mails, SEO
 *   public/images/logo-full-light.png  version claire    — pied de page, back-office
 *   public/images/logo-icon.png        médaillon cadré carré sur fond blanc
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
 * non à la scène. Mesuré sur le logo : le lettrage tombe vers 48, le tronc et
 * les bûches vers 72 à 168, le feuillage et la flamme bien au-dessus. À 90, on
 * prend le trait et on laisse la couleur.
 */
const SEUIL_TRAIT = 90;

/** Part du côté laissée en marge autour du médaillon dans le favicon. */
const MARGE_FAVICON = 0.05;

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

  // --- Favicon : le médaillon entier, cadré carré sur fond blanc opaque.
  // Opaque et non transparent : l'onglet du navigateur peut être clair ou
  // sombre selon le thème, et un lettrage brun sur transparent disparaîtrait
  // dans le second cas.
  const cote = Math.max(info.width, info.height);
  const cadre = Math.round(cote * (1 + MARGE_FAVICON * 2));

  // La composition va jusqu'à un fichier avant toute réduction : dans sharp,
  // `resize()` porte sur le fond et s'applique AVANT le composite, si bien
  // qu'enchaîner les deux collerait le logo en pleine taille sur un fond déjà
  // rétréci.
  const carre = await sharp({
    create: {
      width: cadre,
      height: cadre,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: await sharp(data, brut).png().toBuffer(), gravity: "center" }])
    .png()
    .toBuffer();

  await sharp(carre).toFile("public/images/logo-icon.png");
  await sharp(carre).resize(180, 180).png().toFile(path.join("src", "app", "icon.png"));

  console.log(`Favicon : cadré en ${cadre} carré, réduit à 180.`);
  console.log("Écrits : logo-full.png, logo-full-light.png, logo-icon.png, src/app/icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
