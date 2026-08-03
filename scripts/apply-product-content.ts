import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/server/prisma";
import { validateProductContent } from "../src/lib/productContent";
import { PRODUCT_CONTENT } from "./data/product-content";

// Applique le contenu rédigé au catalogue, par SKU.
// Lancement : npx tsx --env-file=.env scripts/apply-product-content.ts

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
