# Certifications et caractéristiques techniques — poêles à bois

Relevé du 23 août 2026, complémentaire à `docs/research/identifiants-poeles.md` (GTIN/MPN,
3 août 2026) : ce document-là a établi l'identité produit (référence, GTIN) des 8 poêles ;
celui-ci vérifie les **allégations réglementaires et commerciales** portées par les fiches —
kW, rendement, classe énergétique UE, conformité Eco Design 2022, norme EN 13240/EN 16510,
label Flamme Verte — contre les sources qui font autorité pour chacune : fiche réglementaire
du fabricant, site officiel, registre officiel flammeverte.org. La base EPREL
(eprel.ec.europa.eu, registre européen officiel des étiquettes énergie) a été identifiée comme
la source la plus autorité pour la classe énergétique, mais son interface est une application
JavaScript qui n'a pas pu être interrogée avec les outils de récupération disponibles pour
cette recherche (aucun rendu de résultat de recherche obtenu) : **elle n'a donc pas pu servir
de source pour ce document**, ce qui limite la confiance atteignable sur la classe énergétique
à « moyenne » au mieux, même quand toutes les autres sources concordent. C'est signalé
explicitement pour chaque produit plutôt que masqué.

Méthode de citation identique à celle du document granulés : chaque allégation retenue comme
confirmée s'appuie sur au moins une source primaire (fabricant) ou, à défaut, sur un
recoupement d'au moins deux revendeurs indépendants ; une allégation vue chez un seul
revendeur, ou reprise uniquement par du texte marketing sans support technique, est signalée
comme non confirmée plutôt que présumée correcte — exactement le traitement qui avait été
réservé à l'« ENplus A1 » de Limouzi granulés.

## Tableau de synthèse

| SKU | Produit / référence | kW | Rendement | Classe énergie (base MLC Bois) | Eco Design 2022 | Norme | Flamme Verte | Statut GTIN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mkt-poele-interstoves-matteo-10-kw | Interstoves Matteo, réf. MATTEO500NR | 10 kW annoncé (10,2–10,8 kW selon la fiche technique du revendeur) | 78,4–78,9 % selon la source | A+ — **non confirmé** sur une source faisant autorité | Repris par plusieurs revendeurs, non vu sur une fiche réglementaire officielle | EN 13240 (déduit, non confirmé nommément pour ce modèle précis) | 7 étoiles repris par un revendeur (mypoele.com) mais **absent du registre officiel flammeverte.org** pour « Matteo » — **non confirmé** | Pas de GTIN en base (volontaire, cf. doc GTIN — préfixe 742 jugé peu fiable) |
| mkt-poele-interstoves-juan-14-kw | Interstoves Juan, réf. JUANC50NOIR | 14 kW annoncé (14,3 kW en fiche détaillée) | 82 % — cohérent sur plusieurs revendeurs | A+ — vu chez un revendeur (E.Leclerc), non recoupé sur un registre officiel | Repris par le revendeur, non vu sur une fiche réglementaire officielle | EN 13240 (déduit, non confirmé nommément) | Non revendiqué en base — cohérent, aucune source ne l'évoque pour ce modèle | 3760366603273 — retenu (déjà vérifié dans le doc GTIN, structured data + recoupement BUT.fr) |
| mkt-poele-interstoves-alessia-14-kw | Interstoves Alessia, réf. ALESSIAC50NOIR | 14 kW annoncé (14,3 kW en fiche détaillée) | 82 % — cohérent sur plusieurs revendeurs | A+ — vu chez un revendeur (E.Leclerc), non recoupé sur un registre officiel | Repris par le revendeur, non vu sur une fiche réglementaire officielle | EN 13240 (déduit, non confirmé nommément) | Non revendiqué en base — cohérent | 3760366603266 — retenu (déjà vérifié dans le doc GTIN, structured data + recoupement BUT.fr/ManoMano) |
| mkt-poele-deville-sandy-8-kw-lab | Deville Sandy, réf. C077BD.06-DD | 8 kW — confirmé, fiche réglementaire officielle Deville | 77,0 % — confirmé, fiche officielle | A — confirmé, fiche officielle | **Non trouvé tel quel dans le texte de la fiche réglementaire** (celle-ci cite le règlement 2015/1186, pas la formule « Eco Design 2022 ») | EN 13240 — confirmé, fiche officielle | Ligne « Classement Flamme verte » présente sur la fiche officielle mais **valeur non lisible/non trouvée** ; non revendiqué en base — cohérent | 3244330110009 — retenu (doc GTIN : structured data primo-ideo.com + poids identique) |
| mkt-poele-deville-toron-50-8-kw | Deville Toron 50, réf. C07768.06 | 8 kW — confirmé, fiche officielle | 77,0 % — confirmé, fiche officielle | A — confirmé, fiche officielle | **Non trouvé tel quel dans le texte de la fiche réglementaire** | EN 13240 — confirmé, fiche officielle | Ligne présente, valeur non lisible ; non revendiqué en base | 3244330110542 — retenu (doc GTIN : deux sources indépendantes) |
| mkt-poele-deville-orense-8-kw | Deville Orense, réf. C077CD-06 | 8 kW — confirmé, fiche officielle | 77,0 % — confirmé, fiche officielle | A — confirmé, fiche officielle | **Non trouvé tel quel dans le texte de la fiche réglementaire** (mention « Ecodesign 2022 » vue chez le revendeur poeleplus.fr uniquement) | EN 13240 — confirmé, fiche officielle | Non revendiqué en base — cohérent | 3244330110696 — retenu (doc GTIN : structured data complète poeleplus.fr, cohérence totale avec la fiche officielle) |
| mkt-poele-deville-eguzki-etanche-6-kw | Deville Eguzki étanche, réf. C077BXN-06 | 6 kW — confirmé, page produit officielle Deville | Utile 75 % / saisonnier 65 % — confirmés, page officielle | A — image affichée sur la page officielle (pas de tableau texte détaillé) | Logo présent sur la page officielle, texte explicite non trouvé | **EN 16510 — confirmé, page officielle** (norme adaptée aux appareils étanches, cohérent avec la doctrine EN13240 vs EN16510) | « Label qualité : Flamme verte » sans étoiles précisées, page officielle — **cohérent avec la base qui ne revendique pas de nombre d'étoiles** | 3244330110801 — retenu avec confiance moyenne (doc GTIN : recoupement indirect, page bloquée en fetch direct) |
| mkt-poele-la-nordica-extraflame-isetta-evo-4-0 | La Nordica Extraflame Isetta Evo 4.0, réf. 7119002 | 7,3 kW — confirmé, cohérent sur de nombreux revendeurs FR/DE/IT indépendants | 83,6 % — confirmé (maison-energy.com, chemineeo.fr) | A+ — confirmé par recoupement large (titre Amazon.de, revendeurs allemands DIN EN 13240) | Mentionné par plusieurs revendeurs indépendants ; site officiel lanordica-extraflame.com non consulté avec succès | NF EN 13240 — terminologie correcte (déclinaison française homologuée de l'EN 13240), confirmée par recoupement DE/FR | Non applicable (label français, fabricant italien) — non revendiqué en base, cohérent | 8022724371008 — retenu (doc GTIN : deux domaines indépendants, données structurées identiques) |

## Décompte

- **kW / rendement / poids cohérents avec au moins une source technique sérieuse : 8/8.**
  Deville (4 produits) est le lot le mieux sourcé : fiches réglementaires officielles
  (PDF Eco-conception téléchargés sur deville.fr, ou page produit officielle pour l'Eguzki)
  donnant des valeurs qui concordent presque exactement avec la base.
- **Classe énergétique confirmée sur une source faisant autorité (fiche officielle fabricant
  ou registre) : 4/8** — les quatre Deville (A, cohérent avec leur fiche réglementaire
  officielle). **Non confirmée sur une source faisant autorité : 4/8** — les trois Interstoves
  (A+, vu uniquement chez des revendeurs) et l'Isetta Evo 4.0 (A+, confirmé par recoupement
  de revendeurs mais pas par une fiche officielle La Nordica ni par EPREL). Aucune classe n'a
  pu être vérifiée sur EPREL (interface non interrogeable avec les outils disponibles).
- **Eco Design 2022 trouvé texto sur une fiche réglementaire officielle : 0/8.** Les quatre
  fiches Deville consultées citent le règlement européen sous sa référence numérique
  (Règlement délégué (UE) 2015/1186, relatif à l'étiquetage — le règlement d'écoconception
  proprement dit est le 2015/1185) plutôt que la formule commerciale « Eco Design 2022 ».
  Cette formule est en revanche largement reprise par les revendeurs pour les huit produits,
  de façon cohérente avec le fait que les quatre Deville, au moins, sont bien commercialisés
  sous le régime d'écoconception applicable aux appareils à combustible solide depuis le
  1er janvier 2022 (Directive 2009/125/CE, Règlement 2015/1185) — la substance réglementaire
  n'est donc pas remise en cause, seule l'expression littérale « Eco Design 2022 » n'a pas été
  retrouvée verbatim dans les documents sources consultés.
- **EN 13240 confirmée nommément sur une source officielle : 3/8** (Sandy, Toron 50, Orense —
  fiches réglementaires Deville). **EN 16510 confirmée nommément sur une source officielle :
  1/1** (Eguzki — page produit officielle Deville, cohérent avec la doctrine : appareil
  étanche à arrivée d'air extérieur relevant de l'EN 16510 plutôt que l'EN 13240). **NF EN
  13240 confirmée par recoupement de revendeurs (pas de source officielle fabricant
  consultée avec succès) : 1/1** (Isetta Evo 4.0). **Norme non confirmée nommément pour ce
  modèle précis, seulement déduite par cohérence avec la gamme : 3/8** (Juan, Alessia — la
  fiche technique officielle Interstoves n'a pas pu être récupérée, bloquée par une protection
  anti-robot ; Matteo, idem).
- **Flamme Verte : un seul cas sur les huit où la base revendique un nombre d'étoiles précis
  (Matteo, 7 étoiles) — et ce nombre n'a pas pu être confirmé sur le registre officiel
  flammeverte.org.** C'est le point le plus proche, dans ce lot, du problème identifié pour
  Limouzi granulés (« Certifié ENplus A1 » non confirmé au registre). Le second cas
  (Eguzki, label Flamme Verte sans étoiles) est en revanche bien confirmé — et la base ne
  revendique d'ailleurs pas de nombre d'étoiles pour ce produit, ce qui est le comportement
  prudent adapté à ce qui a pu être vérifié.
- **GTIN retenus : 7/7** des produits qui en portent un en base (Matteo n'en porte
  volontairement pas). Ce travail avait déjà été fait en détail dans
  `docs/research/identifiants-poeles.md` (3 août 2026) ; il n'a pas été refait ici dans le
  détail, seulement recoupé ponctuellement — voir les notes par produit pour ce qui a été
  revérifié.

## Notes par produit

### mkt-poele-interstoves-matteo-10-kw — Interstoves Matteo 10 kW, réf. MATTEO500NR
**Identité du produit** : confirmée. La page officielle existe sur interstoves.fr
(`/gamme-web/145-matteo-10.html`), mais son contenu n'a pas pu être récupéré directement
(protection anti-robot Cloudflare, erreur 403 constatée sur deux tentatives, y compris via un
proxy de lecture). Le produit est vendu sous ce GTIN (7421097382238) chez au moins quatre
enseignes indépendantes (BUT.fr, Bricorama, Bricomarché, mypoele.com), ce qui confirme
l'identité de l'article — cohérent avec le constat déjà fait dans le doc GTIN du 3 août.

**kW et rendement — divergence non résolue entre revendeurs** : mypoele.com annonce
« puissance globale 10,2 kW, rendement 78,4 % » ; une fiche détaillée vue via E.Leclerc (doc
GTIN du 3 août) donnait 10,8 kW ; la base MLC Bois affiche « 10 kW, rendement 78,9 % ». Les
trois chiffres de rendement (78,4/78,9 %) et de puissance (10,2/10,8/10 kW) ne sont jamais
strictement identiques d'une source à l'autre. Cet écart est probablement dû à des versions
différentes du rapport d'essai reprises par des revendeurs différents, mais n'a pas pu être
tranché par une fiche technique officielle unique. **Point de vigilance découvert pendant la
recherche, à signaler** : un autre modèle Interstoves, le **ANDREA 10** (GTIN
7421097382306 — un seul chiffre d'écart avec celui du Matteo), affiche des caractéristiques
strictement identiques trouvées chez plusieurs sources indépendantes : 10,8 kW, rendement
78,9 %, rendement saisonnier 69 %, poids 98 kg, EN 13240, Eco Design 2022, Flamme Verte
7 étoiles — les mêmes valeurs, au chiffre près, que celles revendiquées pour le Matteo. Il
est plausible qu'il s'agisse du même corps de chauffe commercialisé sous deux noms/finitions
différents (pratique courante chez les importateurs de poêles italiens), mais rien ne le
confirme explicitement ; à vérifier auprès du fournisseur avant de considérer les deux fiches
comme indépendantes l'une de l'autre.

**Classe énergétique A+ — non confirmée sur une source faisant autorité.** Aucune fiche
officielle Interstoves n'a pu être consultée pour le Matteo. Le registre officiel
flammeverte.org, interrogé pour la marque Interstoves, référence Milano, PHS 20, Moretti et
Andrea, mais pas de fiche « Matteo » trouvée. Sur la fiche Andrea (id 12780 du registre
officiel, gamme la plus proche techniquement), la classe énergétique CE **n'est même pas
renseignée** (« Non précisé ») malgré tout le reste des caractéristiques présentes — ce qui
n'inspire pas confiance dans une classe A+ affirmée sans réserve pour un appareil très
proche. **Confiance : faible** sur la classe énergétique précise (A vs A+).

**Flamme Verte 7 étoiles — non confirmé sur le registre officiel.** La mention « Flamme verte
7 stars » est reprise explicitmenet par un revendeur indépendant (mypoele.com) pour le
Matteo nommément, ce qui est un signal positif, mais la recherche directe sur
flammeverte.org (recherche par marque et par nom de modèle) n'a fait remonter aucune fiche
« Matteo » dans le registre officiel — seulement des modèles voisins de la même marque. C'est
structurellement la même situation que celle documentée pour l'ENplus A1 de Limouzi
granulés : une allégation reprise par la chaîne commerciale sans qu'on puisse la retrouver
au registre qui fait autorité. **La description produit affirme spécifiquement que c'est
« le seul appareil de la sélection à afficher explicitement le label Flamme Verte 7
étoiles » — cette affirmation mérite d'être vérifiée en priorité avant republication, car
c'est la formulation la plus commercialement engageante du lot.** **Confiance : moyenne**
(un revendeur indépendant confirme le chiffre, mais pas le registre officiel).

**EN 13240 et Eco Design 2022** : non trouvés nommément sur une fiche officielle pour ce
modèle précis (site interstoves.fr inaccessible) ; repris par plusieurs revendeurs de façon
cohérente. **Confiance : moyenne.**

**GTIN** : absent de la base — décision déjà prise et documentée le 3 août (préfixe GS1 742
jugé peu fiable malgré le recoupement chez plusieurs enseignes). Rien dans cette recherche
ne change cette évaluation.

### mkt-poele-interstoves-juan-14-kw — Interstoves Juan 14 kW, réf. JUANC50NOIR
**kW/rendement/poids** : 14,3 kW en fiche détaillée (14 kW arrondi en base), rendement 82 %,
rendement saisonnier 72 % — valeurs cohérentes sur plusieurs sites de revendeurs indépendants
(boisenergie-nord.com, distribois-energie.com, hexagodis.com, mypoele.com — six fiches
quasi identiques trouvées, signe d'une fiche technique fabricant largement diffusée). Poids
non revérifié spécifiquement dans cette recherche (70 kg en base, cohérent avec le format
Juan/Alessia).

**Classe énergétique A+, EN 13240, Eco Design 2022** : repris par le revendeur E.Leclerc
(doc GTIN du 3 août) et par d'autres revendeurs de façon cohérente, mais **aucune fiche
officielle Interstoves n'a pu être consultée** (site bloqué par protection anti-robot) et
aucune fiche flammeverte.org trouvée pour ce modèle précis. **Confiance : moyenne** — pas de
signal contradictoire, mais pas de source faisant autorité consultée directement.

**GTIN** : 3760366603273, déjà vérifié en détail le 3 août (donnée structurée `gtin13` +
tableau caractéristiques sur la fiche E.Leclerc, recoupé sur l'URL produit BUT.fr). Non
retravaillé ici ; **confiance : haute** (reprise du doc GTIN).

### mkt-poele-interstoves-alessia-14-kw — Interstoves Alessia 14 kW, réf. ALESSIAC50NOIR
**kW/rendement/poids** : 14,3 kW, rendement 82 %, poids **70 kg confirmé** par un test
indépendant détaillé (monpoeletendance.com — dimensions, garantie 10 ans sur le corps de
chauffe cohérentes avec la base). Valeurs cohérentes sur cinq à six revendeurs indépendants.

**Classe énergétique A+, EN 13240, Eco Design 2022** : même situation que Juan — repris par
E.Leclerc et d'autres revendeurs, aucune fiche officielle Interstoves consultée avec succès,
aucune fiche flammeverte.org retrouvée pour ce modèle précis. **Confiance : moyenne.**

**GTIN** : 3760366603266, déjà vérifié le 3 août (donnée structurée + recoupement BUT.fr et
ManoMano). **Confiance : haute** (reprise du doc GTIN).

### mkt-poele-deville-sandy-8-kw-lab — Deville Sandy 8 kW, réf. C077BD.06-DD
**Source consultée avec succès cette fois** : la fiche réglementaire officielle PDF
(deville.fr/wp-content/uploads/sites/2/2019/11/C077BD-06-DD_2021-12.pdf), qui n'avait pu être
lue que partiellement le 3 août (contenu binaire), a pu être extraite intégralement cette
fois via un service de lecture tiers. Elle confirme : référence **C077BD.06-DD**, puissance
nominale **8 kW**, rendement utile **77,0 %**, classe d'efficacité énergétique **A**, masse de
l'appareil **112 kg**, norme **EN 13240**, conformité au Règlement délégué (UE) 2015/1186 —
toutes ces valeurs correspondent à la fiche produit en base.

**Écart trouvé sur l'indice d'efficacité énergétique (IEE)** : la fiche officielle relevée
cette fois indique **IEE 103**, alors que la base MLC Bois (et le doc GTIN du 3 août, sur la
foi de la même fiche) indique **102**. Un seul chiffre d'écart, possiblement une erreur de
lecture OCR sur la police du PDF (102/103 se distinguent mal dans certaines polices
compressées) plutôt qu'une vraie divergence — mais comme les deux lectures proviennent du
même document source à deux dates différentes sans confirmation univoque, **ce point doit
être revérifié manuellement sur le PDF avant publication** plutôt que tranché ici par
présomption.

**Eco Design 2022** : une recherche texte intégral sur le PDF pour les termes « 2022 »,
« éco-conception », « Ecodesign » et « eco-design » n'a donné aucune occurrence. Le document
ne cite que le règlement 2015/1186 (étiquetage énergétique) sans la formule commerciale
« Eco Design 2022 ». Cela ne remet pas en cause la conformité réglementaire réelle de
l'appareil (mis sur le marché sous le régime applicable depuis 2022), seulement l'absence de
cette formule verbatim dans la source consultée. **Confiance : moyenne** sur cette formule
précise, **haute** sur la substance réglementaire (le tableau réglementaire lui-même est bien
celui exigé depuis 2022).

**Flamme Verte** : une ligne « Classement Flamme verte » figure dans le tableau de
performance du PDF, mais sa valeur n'a pas pu être extraite/lue. La base ne revendique pas de
label Flamme Verte pour ce produit — posture cohérente avec ce qui a pu être vérifié.

**GTIN** : 3244330110009, déjà vérifié le 3 août (donnée structurée `gtin13` sur
primo-ideo.com + poids identique à la fiche officielle ; un GTIN concurrent à préfixe
200-299 vu chez bernay-habitat.com a été écarté à raison). **Confiance : haute** (reprise du
doc GTIN).

**Point non résolu, signalé mais non réexpliqué ici** : la signification du suffixe « LAB »
dans le nom produit MLC Bois reste non établie (déjà noté le 3 août).

### mkt-poele-deville-toron-50-8-kw — Deville Toron 50 8 kW, réf. C07768.06
Fiche réglementaire officielle (deville.fr/.../C07768.06_2021-12.pdf) extraite intégralement
cette fois : référence **C07768.06**, puissance **8 kW**, rendement utile **77,0 %**, classe
**A**, masse **150 kg**, norme **EN 13240** — tout concorde avec la base.

**Même écart sur l'IEE que pour le Sandy** : la fiche indique **103**, la base indique
**102**. Même remarque : à revérifier manuellement, possiblement une confusion de lecture
sur les deux documents (Sandy et Toron partagent visiblement une mise en page identique, donc
une éventuelle erreur d'extraction affecterait les deux de la même façon).

**Eco Design 2022** : comme pour le Sandy, la formule n'apparaît pas texto dans le document ;
seul le règlement 2015/1186 est cité. **Confiance : moyenne** sur la formule, **haute** sur
la substance.

**Flamme Verte** : ligne présente dans le tableau, valeur non lisible ; non revendiqué en
base — cohérent.

**GTIN** : 3244330110542, déjà vérifié le 3 août sur deux sources indépendantes
(poeleplus.fr + codep.fr). **Confiance : haute** (reprise du doc GTIN).

### mkt-poele-deville-orense-8-kw — Deville Orense 8 kW, réf. C077CD-06
Fiche réglementaire officielle (deville.fr/.../C077CD-06_2022-03.pdf) extraite intégralement :
référence **C077CD-06**, puissance **8 kW**, rendement utile **77,0 %**, classe **A**, masse
**192 kg**, norme **EN 13240**, IEE **102** — **cette fois l'IEE correspond exactement à la
base**, contrairement au Sandy et au Toron 50. C'est le seul des trois Deville « standard » du
lot où les trois sources (PDF officiel relu aujourd'hui, revendeur poeleplus.fr avec données
structurées, base MLC Bois) s'accordent sur 102 sans aucune divergence.

**Eco Design 2022** : le texte intégral du PDF ne contient pas la formule (même constat que
Sandy/Toron), mais le revendeur poeleplus.fr (doc GTIN du 3 août) affichait explicitement
« Ecodesign 2022 » dans son propre tableau de caractéristiques, en cohérence avec toutes les
autres valeurs de la fiche officielle. **Confiance : moyenne-haute** — pas trouvé dans le
document source primaire, mais confirmé par un revendeur dont toutes les autres valeurs
recoupent exactement l'officiel.

**Flamme Verte** : non mentionné dans le document consulté ; non revendiqué en base —
cohérent.

**GTIN** : 3244330110696, déjà vérifié le 3 août — c'est le GTIN le mieux sourcé du lot
Deville (données structurées complètes `sku`/`mpn`/`gtin13` chez poeleplus.fr, cohérence
totale avec la fiche officielle). **Confiance : haute** (reprise du doc GTIN).

### mkt-poele-deville-eguzki-etanche-6-kw — Deville Eguzki étanche 6 kW, réf. C077BXN-06
**C'est le produit le plus important à vérifier de ce lot**, car c'est le seul dont la norme
déclarée diffère du reste (EN 16510 au lieu d'EN 13240) et le seul dont le label Flamme Verte
est revendiqué sans étoiles. La page produit officielle
(deville.fr/produit/poele-a-bois-etanche-en-acier-eguzki/) a pu être consultée directement
avec succès et confirme, mot pour mot : référence **C077BXN-06**, puissance **6 kW**,
rendement utile **75 %**, rendement saisonnier (ETAS) **65 %**, IEE **99**, masse **124 kg**,
norme **EN16510**, et « Label qualité : Flamme verte » — **sans mention d'un nombre
d'étoiles**. **Toutes ces valeurs correspondent exactement à la base**, y compris l'absence
délibérée d'un chiffre d'étoiles Flamme Verte, qui est donc la posture correcte plutôt qu'une
lacune.

**La norme EN 16510 (et non EN 13240) est confirmée pour ce modèle précisément parce qu'il
s'agit d'un appareil étanche à arrivée d'air extérieure** (ø 80 mm, compatible RT2012/RE2020)
— cohérent avec la doctrine indiquée dans la demande : EN 16510 est la norme qui couvre ce
type de conception, quand EN 13240 ne couvre que les appareils sans raccordement pour l'air
de combustion supplémentaire. C'est le seul point de norme du lot entièrement confirmé par
une source officielle en accès direct, sans ambiguïté.

**Point de vigilance non résolu, à faire trancher manuellement** : le registre officiel
flammeverte.org, interrogé pour « EGUZKI », fait remonter une fiche indiquant une référence
proche mais différente, « **C077BZN-06** » (lettre Z, pas X), avec des caractéristiques
(6 kW, 75 %) par ailleurs identiques et une conformité affichée à l'**EN13240** — ce qui
contredirait l'EN16510 de la fiche officielle Deville si c'était bien le même appareil. Deux
explications possibles, non tranchées par cette recherche : (a) une confusion de lecture
X/Z sur le registre flammeverte (les deux lettres se ressemblent dans certaines polices, et
l'extraction s'est faite via un instantané de recherche plutôt qu'une lecture directe de la
page), ou (b) il s'agit réellement d'un modèle voisin distinct — la gamme Eguzki compte
plusieurs variantes chez Deville (Eguzki simple, Eguzki Accumulateur réf. C077BZ-06/C077BZN-06,
Eguzki Suspendu, Eguzki Serpentine), et un préfixe « BZ » est déjà attesté ailleurs pour la
variante Accumulateur — ce qui rendrait plausible que la fiche flammeverte.org concerne en
fait la variante Accumulateur (EN13240) et non l'étanche C077BXN-06 (EN16510) du catalogue
MLC Bois. **Cette ambiguïté empêche de confirmer une fiche Flamme Verte officielle
spécifiquement rattachée à la référence C077BXN-06** — à vérifier manuellement en consultant
directement flammeverte.org (accès direct bloqué pour cette recherche) avant de considérer le
sujet clos. **Confiance : haute** sur kW/rendement/poids/norme EN16510/absence d'étoiles
(page officielle directe) ; **faible** sur l'existence d'une fiche Flamme Verte officielle
précisément rattachée à cette référence.

**GTIN** : 3244330110801, déjà signalé le 3 août comme confiance moyenne (recoupement
indirect sur deux revendeurs dont les pages étaient bloquées en fetch direct, distinction
faite avec l'ancienne référence C077BX-06 qui porte un GTIN différent, 3244330110641). Rien
dans cette recherche ne permet de relever ce niveau de confiance à « haute » ; **la mise en
production reste conditionnée à une vérification manuelle**, comme déjà recommandé.

### mkt-poele-la-nordica-extraflame-isetta-evo-4-0 — La Nordica Extraflame Isetta Evo 4.0, réf. 7119002
**Identité et caractéristiques** : très largement corroborées par recoupement de nombreux
revendeurs indépendants sur trois marchés (France : maison-energy.com, chemineeo.fr ;
Allemagne : kamdi24.de, ofenseite.com, schornstein-fachhandel.de, Amazon.de ; Italie :
vieffetrade.com, ecoteksrl.it) — 7,3 kW, 209 m³ chauffables, poids 160 kg, référence 7119002,
tous cohérents sans exception trouvée. Le titre du listing Amazon.de (« La Nordica Isetta EVO
4.0 stove/**A+**... ») confirme indépendamment la classe A+ pour cette référence précise.

**Rendement 83,6 %** : confirmé par deux sources françaises indépendantes utilisant des
données structurées identiques (maison-energy.com, chemineeo.fr — déjà établi le 3 août).
Non revérifié auprès d'une source italienne officielle dans cette recherche.

**NF EN 13240 et Eco Design 2022** : les revendeurs allemands emploient systématiquement
« DIN EN 13240 » (déclinaison allemande de la même norme européenne EN 13240) et mentionnent
la conformité EcoDesign de façon générale pour la gamme ; « NF EN 13240 » (déclinaison
française) est la formule vue chez le revendeur français maison-energy.com. Les trois
déclinaisons nationales (NF/DIN/aucune) désignent la même norme européenne sous-jacente — ce
n'est donc pas une incohérence, seulement l'usage propre à chaque marché nationale. **Le
site officiel du fabricant (lanordica-extraflame.com) n'a pas pu être consulté avec succès**
dans cette recherche (page catalogue trouvée mais sans le modèle Isetta Evo 4.0 clairement
identifié — risque de confusion avec les gammes voisines Isotta/Isotta Forno déjà signalé le
3 août). **Confiance : moyenne-haute** — recoupement multi-marché solide, mais aucune fiche
officielle fabricant consultée directement dans ce document ni dans le précédent.

**Certification italienne notée en complément** : plusieurs sources italiennes mentionnent
une classification « Aria Pulita 4 stelle » — un label qualité de l'air italien distinct de
Flamme Verte (qui est propre au marché français). Il ne contredit ni ne confirme les
allégations françaises de la fiche MLC Bois ; mentionné ici pour mémoire, sans impact sur la
grille de vérification demandée.

**GTIN** : 8022724371008, déjà vérifié le 3 août sur deux domaines indépendants avec données
structurées identiques (`gtin13` + champ EAN visible) ; un GTIN concurrent à préfixe 200-299
a été écarté à raison. **Confiance : haute** (reprise du doc GTIN).

## Synthèse transversale

- **Le lot Deville (Sandy, Toron 50, Orense, Eguzki) est de loin le mieux sourcé** : les
  quatre fiches réglementaires/produit officielles ont pu être consultées, directement ou via
  un service de lecture tiers, et concordent avec la base sur kW, rendement, classe
  énergétique, poids et norme applicable — y compris la confirmation, page officielle à
  l'appui, que l'Eguzki relève bien de l'EN 16510 et non de l'EN 13240, exactement comme
  attendu pour un appareil étanche à air extérieur. Deux réserves mineures et localisées :
  l'indice d'efficacité énergétique lu à 103 (au lieu de 102 en base) pour Sandy et Toron 50
  lors de cette relecture du PDF — à confirmer manuellement, l'écart pouvant être une erreur
  de lecture plutôt qu'une vraie divergence — et l'absence, dans le texte des quatre fiches
  officielles, de la formule littérale « Eco Design 2022 » (qui n'apparaît que chez des
  revendeurs), sans que cela remette en cause la conformité réglementaire réelle des
  appareils.
- **Le lot Interstoves (Matteo, Juan, Alessia) est le moins bien sourcé** : le site officiel
  interstoves.fr existe et référence bien ces trois modèles, mais n'a pas pu être consulté
  (protection anti-robot systématique), ce qui oblige à s'appuyer sur des revendeurs pour
  toutes les allégations — kW, rendement, classe énergétique et normes y sont acceptables par
  recoupement mais **aucune n'atteint le niveau de confiance « haute » atteint pour les
  Deville**.
- **Le point le plus proche du problème Limouzi/ENplus A1 identifié dans le document
  granulés est le Flamme Verte 7 étoiles du Matteo** : revendiqué explicitement en base comme
  la caractéristique différenciante de ce produit dans le lot (« le seul appareil ... à
  afficher explicitement le label Flamme Verte 7 étoiles »), repris par au moins un revendeur
  indépendant, mais **introuvable au registre officiel flammeverte.org** malgré une recherche
  ciblée par marque et par modèle — le registre ne référence, pour Interstoves, que Milano,
  PHS 20, Moretti, Andrea et Vinicio. C'est une allégation reprise par la chaîne commerciale
  sans confirmation à la source qui fait autorité, structurellement identique au cas Limouzi.
  **Recommandation : vérifier ce point en priorité (contact direct Interstoves ou fournisseur
  MLC Bois, ou nouvelle tentative d'accès au registre flammeverte.org) avant de laisser cette
  allégation au flux Google Merchant Center**, étant donné le contexte de disapprobation
  récente pour déclarations trompeuses.
- **Un doublon possible Matteo/Andrea a été repéré** (mêmes 98 kg, 10,8 kW, 78,9 %,
  rendement saisonnier 69 %, EN 13240, Eco Design 2022, Flamme Verte 7 étoiles, GTIN à un
  chiffre d'écart) sans lien confirmé explicitement entre les deux fiches commerciales — à
  signaler au fournisseur, sans conséquence certaine sur l'exactitude des données.
- **La classe énergétique UE (A/A+) est le champ le moins bien vérifiable de tout ce lot** :
  EPREL, qui est la source qui ferait le plus autorité, n'a pas pu être interrogée avec les
  outils disponibles (interface JavaScript pure, aucun résultat de recherche récupérable).
  Pour les quatre Deville, la classe A est corroborée par une fiche officielle du fabricant
  (déjà suffisant pour une confiance raisonnable) ; pour les trois Interstoves et le La
  Nordica, la classe A+ n'est confirmée que par du texte de revendeur, jamais par une fiche
  officielle fabricant ni par EPREL. **Aucune classe énergétique de ce lot n'est
  « confirmée haute » au sens strict retenu dans le document granulés (registre officiel
  consultable).**
- **La cohérence du champ interne `energyEfficiencyClass` avec le texte des descriptions
  produit a été vérifiée directement dans le code source** (`scripts/data/product-content.ts`)
  pour les huit produits : aucune incohérence trouvée entre le champ structuré et le texte
  affiché.
- **GTIN** : aucune nouvelle vérification complète n'était nécessaire, le document du 3 août
  ayant déjà traité les sept GTIN du lot avec la même rigueur que le document granulés
  (données structurées, recoupement multi-revendeur, rejet des préfixes GS1 à circulation
  restreinte). Cette recherche confirme, sans les contredire, les niveaux de confiance déjà
  établis, et n'a rien trouvé qui justifierait de relever la confiance « moyenne » du GTIN
  Eguzki à « haute ».
