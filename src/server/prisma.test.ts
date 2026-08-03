// src/server/prisma.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getClient } from "./prisma";

/**
 * Remet une variable d'environnement à sa valeur d'avant test — `delete`
 * plutôt qu'une affectation à `undefined`, qui la transformerait en la
 * chaîne littérale "undefined" (process.env ne stocke que des chaînes).
 */
function restaurer(cle: "NODE_ENV" | "DATABASE_URL", valeurOrigine: string | undefined): void {
  if (valeurOrigine === undefined) delete process.env[cle];
  else process.env[cle] = valeurOrigine;
}

test("getClient mémorise le client Prisma y compris en production", () => {
  // C'est précisément le cas qui a cassé : avant ce correctif, la
  // mémorisation dans globalThis n'avait lieu que hors production. En
  // production, chaque accès reconstruisait donc un nouveau client — un
  // nouveau pool `pg` de dix connexions jamais fermé — sur la base Neon de
  // production. Ce test verrouille l'unicité de la référence rendue par
  // deux appels successifs à getClient(), sous NODE_ENV=production.
  const nodeEnvOrigine = process.env.NODE_ENV;
  const databaseUrlOrigine = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = "production";
    // Syntaxiquement valide mais jamais joignable : Prisma/pg n'ouvrent de
    // connexion réelle qu'à la première requête émise, et ce test n'en émet
    // aucune — il reste entièrement hors ligne.
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/db?sslmode=disable";

    assert.equal(getClient(), getClient());
  } finally {
    restaurer("NODE_ENV", nodeEnvOrigine);
    restaurer("DATABASE_URL", databaseUrlOrigine);
  }
});
