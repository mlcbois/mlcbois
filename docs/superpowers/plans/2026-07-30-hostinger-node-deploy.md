# Déploiement Hostinger Node.js géré Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Préparer le dépôt MLC Bois pour un déploiement direct sur le Node.js géré de Hostinger et fournir une liste fiable des variables de production.

**Architecture:** Le projet garde l'architecture actuelle Next.js 16 + `server.js` comme point d'entrée Hostinger. Le travail porte sur la documentation, le modèle de variables et les métadonnées de projet pour aligner le dépôt sur `mlc-bois.fr`, `Node 22`, le build `npm run build`, et un `.env.local` serveur utilisé à la fois par le build, Prisma et le runtime.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Prisma 7, PostgreSQL Neon, Nodemailer, Cloudinary, hébergement Node.js géré Hostinger via hPanel.

**Spec de référence :** `docs/superpowers/specs/2026-07-30-hostinger-node-deploy-design.md`

## Global Constraints

- **Cible unique :** hébergement Node.js géré Hostinger dans `hPanel`, jamais VPS, PM2 ou Nginx pour ce chantier.
- **Version Node :** `22` partout où la version doit être documentée ou vérifiée.
- **Entrée Hostinger :** `server.js` reste le fichier de démarrage ; ne pas introduire un second serveur custom.
- **Variables :** ne jamais committer de secret réel. Fournir uniquement un modèle `.env` et une liste de variables.
- **Priorité à la solution la plus simple :** documentation et configuration légère avant toute modification de code applicatif.
- **Commentaires et docs en français**, ton direct, sans emoji.
- **Aucun `node_modules/` ni artefact machine locale** dans la procédure de déploiement.
- **Prisma en production :** documenter `npx prisma migrate deploy`, jamais `migrate dev`.

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `.env.example` | modèle des variables à importer dans Hostinger |
| `docs/DEPLOY.md` | procédure détaillée de déploiement hPanel, build, migration, cron, maintenance |
| `README.md` | présentation rapide du projet et renvoi vers la doc de déploiement |
| `package.json` | identité du package et contraintes Node/scripts de build |
| `server.js` | point d'entrée Node spécifique à Hostinger |
| `.nvmrc` | version Node locale alignée sur Hostinger |

---

### Task 1: Aligner l'identité de projet et les valeurs de production par défaut

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `server.js`
- Test: validation shell ad hoc

**Interfaces:**
- Consumes: le domaine de production `mlc-bois.fr`, l'adresse d'envoi `contact@mlc-bois.fr`, la cible Hostinger `Node 22`.
- Produces: un dépôt dont les valeurs publiques par défaut pointent toutes vers `MLC Bois`, `mlc-bois.fr` et `contact@mlc-bois.fr`.

- [ ] **Step 1: Écrire la vérification qui échoue**

Lancer cette vérification avant modification :

```bash
node -e "const fs=require('fs'); const pkg=require('./package.json'); const env=fs.readFileSync('.env.example','utf8'); const readme=fs.readFileSync('README.md','utf8'); const server=fs.readFileSync('server.js','utf8'); if(pkg.name!=='mlc-bois') throw new Error('package name incorrect'); if(!env.includes('NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr')) throw new Error('site url manquante'); if(!env.includes('ADMIN_EMAIL=contact@mlc-bois.fr')) throw new Error('admin email incorrect'); if(!readme.includes('Domaine : **mlc-bois.fr**')) throw new Error('README domaine incorrect'); if(!server.includes('MLC Bois écoute sur le port')) throw new Error('log server incorrect'); console.log('ok');"
```

Attendu avant correction : échec sur au moins une des assertions.

- [ ] **Step 2: Appliquer les changements minimaux**

Mettre à jour les valeurs publiques sans toucher à la logique applicative :

```diff
--- a/package.json
+++ b/package.json
@@
-  "name": "hausgeratepfeffer",
+  "name": "mlc-bois",
```

```diff
--- a/.env.example
+++ b/.env.example
@@
-NEXT_PUBLIC_SITE_URL=https://hausgeratepfeffer.de
+NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr
@@
-ADMIN_EMAIL=kontakt@hausgeratepfeffer.de
+ADMIN_EMAIL=contact@mlc-bois.fr
@@
-SMTP_USER=kontakt@hausgeratepfeffer.de
+SMTP_USER=contact@mlc-bois.fr
@@
-MAIL_FROM=kontakt@hausgeratepfeffer.de
-MAIL_FROM_NAME=Hausgeräte Pfeffer
+MAIL_FROM=contact@mlc-bois.fr
+MAIL_FROM_NAME=MLC Bois
```

```diff
--- a/README.md
+++ b/README.md
@@
-# Hausgeräte Pfeffer
+# MLC Bois
@@
-Domaine : **hausgeratepfeffer.de**
+Domaine : **mlc-bois.fr**
```

```diff
--- a/server.js
+++ b/server.js
@@
-    console.log(`Hausgeräte Pfeffer écoute sur le port ${port} (${dev ? "développement" : "production"})`);
+    console.log(`MLC Bois écoute sur le port ${port} (${dev ? "développement" : "production"})`);
```

- [ ] **Step 3: Relancer la vérification**

```bash
node -e "const fs=require('fs'); const pkg=require('./package.json'); const env=fs.readFileSync('.env.example','utf8'); const readme=fs.readFileSync('README.md','utf8'); const server=fs.readFileSync('server.js','utf8'); if(pkg.name!=='mlc-bois') throw new Error('package name incorrect'); if(!env.includes('NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr')) throw new Error('site url manquante'); if(!env.includes('ADMIN_EMAIL=contact@mlc-bois.fr')) throw new Error('admin email incorrect'); if(!env.includes('SMTP_USER=contact@mlc-bois.fr')) throw new Error('smtp user incorrect'); if(!readme.includes('Domaine : **mlc-bois.fr**')) throw new Error('README domaine incorrect'); if(!server.includes('MLC Bois écoute sur le port')) throw new Error('log server incorrect'); console.log('ok');"
```

Attendu : `ok`.

- [ ] **Step 4: Vérifier la qualité du diff**

```bash
git diff --check -- .env.example README.md package.json server.js
```

Attendu : aucune sortie.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md package.json server.js
git commit -m "docs: aligner l'identité de deploiement MLC Bois"
```

---

### Task 2: Réécrire la documentation de déploiement Hostinger pour hPanel

**Files:**
- Modify: `docs/DEPLOY.md`
- Modify: `README.md`
- Test: validation shell ad hoc

**Interfaces:**
- Consumes: `Node 22`, `server.js`, `npm ci`, `npx prisma migrate deploy`, `npm run build`, `restart hPanel`, domaine `mlc-bois.fr`.
- Produces: une procédure de déploiement hPanel ordonnée, avec variables, réveil Neon, fallback build local, cron et vérifications post-mise en ligne.

- [ ] **Step 1: Écrire la vérification qui échoue**

Contrôler que l'ancienne identité ou l'ancienne procédure apparaissent encore :

```bash
rg -n "hausgeratepfeffer|kontakt@hausgeratepfeffer|Node 22|server.js|\\.env\\.local|prisma migrate deploy|mlc-bois\\.fr/api/cron/campaigns" docs/DEPLOY.md README.md
```

Attendu avant correction : présence d'au moins une ancienne référence ou absence d'au moins une mention requise.

- [ ] **Step 2: Réécrire `docs/DEPLOY.md` autour du flux hPanel**

Mettre la documentation en conformité avec ce squelette minimal :

```md
## 4. Déploiement sur hébergement web Node.js (hPanel)

1. hPanel → Avancé → Node.js
   - Version de Node : 22
   - Fichier de démarrage : `server.js`
2. Déposer le code depuis GitHub
3. Créer `.env.local` à la racine
4. Lancer :

```bash
npm ci
npx prisma migrate deploy
npm run build
```

5. Redémarrer l'application depuis hPanel
```

Ajouter ou conserver explicitement :

- `NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr`
- la nécessité d'avoir `DATABASE_URL` disponible **pendant** le build
- le réveil préalable de Neon si besoin
- le fallback build local si Hostinger manque de mémoire
- le cron :

```bash
* * * * * curl -fsS -X POST -H "Authorization: Bearer LE_CRON_SECRET" https://mlc-bois.fr/api/cron/campaigns > /dev/null
```

- les vérifications finales sur `https://mlc-bois.fr/`, `/sitemap.xml`, `/robots.txt` et `/feed/google`

- [ ] **Step 3: Ajouter une section “Variables à renseigner” copiable**

Insérer dans `docs/DEPLOY.md` un bloc unique, directement exploitable par l'utilisateur :

```dotenv
NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr
NODE_ENV=production
DATABASE_URL=postgresql://utilisateur:motdepasse@hote/base?sslmode=require
ADMIN_EMAIL=contact@mlc-bois.fr
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
CUSTOMER_SESSION_SECRET=
INTEGRATION_ENCRYPTION_KEY=
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@mlc-bois.fr
SMTP_PASSWORD=
MAIL_FROM=contact@mlc-bois.fr
MAIL_FROM_NAME=MLC Bois
ORDER_NOTIFICATION_EMAILS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CRON_SECRET=
MAINTENANCE_MODE=1
```

Préciser juste au-dessus :

- obligatoires au build : `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`, `DATABASE_URL`
- obligatoires au runtime : toutes sauf `ORDER_NOTIFICATION_EMAILS`
- `ADMIN_PASSWORD` ne sert qu'au bootstrap si aucun admin n'existe encore

- [ ] **Step 4: Vérifier la documentation**

```bash
node -e "const fs=require('fs'); const doc=fs.readFileSync('docs/DEPLOY.md','utf8'); const required=['Version de Node : **22**','Fichier de démarrage : **`server.js`**','Créer `.env.local` à la racine','npx prisma migrate deploy','https://mlc-bois.fr/api/cron/campaigns','NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr','MAINTENANCE_MODE=1']; for (const token of required) { if (!doc.includes(token)) throw new Error(`manque: ${token}`); } if (doc.includes('hausgeratepfeffer.de')) throw new Error('ancien domaine encore present'); console.log('deploy doc ok');"
```

Attendu : `deploy doc ok`.

- [ ] **Step 5: Commit**

```bash
git add docs/DEPLOY.md README.md
git commit -m "docs: clarifier le deploiement Hostinger"
```

---

### Task 3: Vérifier le paquet de livraison et préparer le handoff utilisateur

**Files:**
- Modify: `.env.example`
- Modify: `docs/DEPLOY.md`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `server.js`
- Test: commandes de vérification finales

**Interfaces:**
- Consumes: les changements des tâches 1 et 2.
- Produces: un paquet prêt à pousser, accompagné d'une liste finale de variables et des réglages exacts à entrer dans Hostinger.

- [ ] **Step 1: Vérifier la version Node locale**

```bash
test "$(cat .nvmrc)" = "22" && echo "nvm ok"
```

Attendu : `nvm ok`.

- [ ] **Step 2: Vérifier la cohérence statique du paquet**

```bash
node -e "const pkg=require('./package.json'); if(pkg.engines.node !== '^20.19 || ^22.12 || >=24.0') throw new Error('engines inattendu'); if(pkg.scripts.build !== 'next build') throw new Error('build inattendu'); if(pkg.scripts.start !== 'next start') throw new Error('start inattendu'); console.log('package ok');"
git diff --check
```

Attendu : `package ok`, puis aucune sortie de `git diff --check`.

- [ ] **Step 3: Lancer la suite de tests existante**

```bash
npm test
```

Attendu : les tests Node existants passent.

- [ ] **Step 4: Préparer le handoff**

Dans la réponse finale à l'utilisateur, livrer exactement :

```text
Réglages Hostinger :
- Node.js version : 22
- Root/Application directory : racine du dépôt
- Start file / Start command : server.js

Variables à renseigner :
- NEXT_PUBLIC_SITE_URL=https://mlc-bois.fr
- NODE_ENV=production
- DATABASE_URL=postgresql://utilisateur:motdepasse@hote/base?sslmode=require
- ADMIN_EMAIL=contact@mlc-bois.fr
- ADMIN_PASSWORD=
- ADMIN_SESSION_SECRET=
- CUSTOMER_SESSION_SECRET=
- INTEGRATION_ENCRYPTION_KEY=
- SMTP_HOST=smtp.hostinger.com
- SMTP_PORT=465
- SMTP_USER=contact@mlc-bois.fr
- SMTP_PASSWORD=
- MAIL_FROM=contact@mlc-bois.fr
- MAIL_FROM_NAME=MLC Bois
- ORDER_NOTIFICATION_EMAILS=
- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=
- CRON_SECRET=
- MAINTENANCE_MODE=1
```

Préciser aussi :

- `ORDER_NOTIFICATION_EMAILS` est facultative
- `MAINTENANCE_MODE=1` garde le site fermé au public tant que la recette n'est pas terminée
- `ADMIN_SESSION_SECRET`, `CUSTOMER_SESSION_SECRET`, `INTEGRATION_ENCRYPTION_KEY` et `CRON_SECRET` doivent être générés en production avec :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 5: Commit**

```bash
git add .env.example docs/DEPLOY.md README.md package.json server.js
git commit -m "docs: preparer le projet pour Hostinger"
```
