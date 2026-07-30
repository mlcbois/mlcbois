# Déploiement sur Hostinger Node.js géré

Date : 2026-07-30
Statut : validé, prêt pour plan d'implémentation

## Problème

Le projet doit être poussé sur l'hébergement Node.js géré de Hostinger, via
`hPanel`, sans passer par un VPS. Le dépôt contient déjà `server.js`,
`.env.example` et `docs/DEPLOY.md`, mais l'ensemble doit être verrouillé pour un
déploiement simple, sans ambiguïté sur :

- la version de Node à choisir ;
- la commande de build et le point d'entrée ;
- les variables obligatoires au build et au runtime ;
- le comportement en cas de build limité par la mémoire ou ralenti par Neon.

Le risque principal est de pousser un dépôt qui compile localement mais casse
sur Hostinger à cause d'un mauvais runtime, d'une variable manquante au moment
du build ou d'une procédure de mise en ligne incomplète.

## Objectif

Préparer le projet pour un déploiement direct sur Hostinger Node.js géré,
documenter la procédure minimale qui fonctionne, et fournir la liste finale des
variables de production à renseigner dans `hPanel` et dans le `.env.local`
serveur.

## Décisions

### Cible retenue : hPanel Node.js géré, pas VPS

Le déploiement visé est l'offre Node.js gérée de Hostinger, avec build depuis
GitHub ou via dépôt du code, redémarrage depuis `hPanel`, et reverse proxy géré
par Hostinger.

Le dépôt n'est donc pas préparé autour de PM2, Nginx ou d'une orchestration
serveur. Toute la documentation et les fichiers ajoutés doivent rester centrés
sur :

- `Node 22` ;
- build `npm run build` ;
- démarrage via `server.js` ;
- variables injectées avant build.

### Runtime : `server.js` reste le point d'entrée Hostinger

Le projet garde `server.js` comme point d'entrée côté Hostinger. Ce fichier lit
`PORT` imposé par l'hébergeur et démarre Next en mode production.

On évite d'introduire un second mode de lancement spécifique à Hostinger si
`server.js` suffit déjà. L'objectif est de conserver un seul chemin simple :

- local ou VPS : `npm start`
- Hostinger Node.js géré : `server.js`

### Version Node : verrouiller `22`

La cible recommandée est `Node 22`, cohérente avec `package.json`, Prisma 7 et
la documentation d'exploitation.

La doc de déploiement doit insister sur ce point, car un runtime Node trop
ancien fait échouer l'installation avant même le build. La préparation du dépôt
ne doit laisser aucune ambiguïté sur cette version.

### Variables : distinguer build critique et runtime critique

Toutes les variables utiles doivent figurer dans `.env.example`, mais la doc
doit surtout séparer :

- les variables indispensables **avant** `npm run build` ;
- les variables indispensables **au démarrage** ;
- les variables optionnelles.

Les variables critiques au build sont :

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `NODE_ENV=production`

Les variables critiques au runtime sont :

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` uniquement si la table admin est vide
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `INTEGRATION_ENCRYPTION_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `MAIL_FROM`
- `MAIL_FROM_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CRON_SECRET`
- `MAINTENANCE_MODE`

La doc doit aussi expliquer que `ORDER_NOTIFICATION_EMAILS` reste facultative.

### Source de vérité : fichier `.env.local` sur le serveur

Le chemin recommandé reste un `.env.local` créé à la racine du projet sur le
serveur. Les variables peuvent aussi être saisies dans `hPanel`, mais la
procédure recommandée doit privilégier un fichier complet côté serveur pour
couvrir à la fois le build, les commandes Prisma et le runtime.

La documentation doit éviter toute formulation laissant croire qu'un écran
runtime `hPanel` suffit forcément au build SSH si celui-ci est lancé à part.

### Procédure de build : base réveillée, migrations appliquées, restart propre

Le déploiement retenu suit cet ordre :

1. code présent sur Hostinger ;
2. `.env.local` créé ;
3. `npm ci` ;
4. `npx prisma migrate deploy` ;
5. réveil éventuel de Neon ;
6. `npm run build` ;
7. redémarrage depuis `hPanel`.

La doc doit être claire sur deux points :

- le build lit la base ;
- `migrate deploy` est autorisé en production, pas `migrate dev`.

### Dégradation prévue : build local si Hostinger manque de mémoire

Le design garde un plan B simple : si le build Hostinger est tué faute de
mémoire, on peut construire localement puis transférer le dossier `.next/`,
mais jamais `node_modules/`.

Cette procédure doit rester documentée comme repli, pas comme chemin principal.

### Livrables attendus

La préparation du projet doit produire :

- une documentation de déploiement hPanel claire et à jour ;
- un modèle de variables complet et exploitable ;
- des ajustements mineurs de scripts ou de docs uniquement si cela supprime une
  ambiguïté réelle de démarrage sur Hostinger.

## Impact sur l'existant

Les changements attendus sont surtout documentaires et de configuration légère.
Le code applicatif ne doit pas être refactoré pour ce chantier.

Les fichiers les plus susceptibles d'évoluer sont :

- `docs/DEPLOY.md`
- `.env.example`
- `README.md` si la procédure publique d'installation doit pointer vers
  Hostinger
- `package.json` seulement si une clarification explicite des scripts est
  nécessaire au déploiement

`server.js` ne doit être modifié que si un vrai problème de compatibilité
Hostinger est identifié.

## Vérifications

La préparation sera considérée correcte si :

- la procédure de mise en ligne hPanel tient en un enchaînement court et
  reproductible ;
- la version `Node 22` est indiquée partout où elle compte ;
- la liste finale des variables de production est exhaustive ;
- la distinction entre build, migration et redémarrage est claire ;
- aucune consigne n'incite à pousser `node_modules/` ou à lancer une commande
  Prisma de développement en production.
