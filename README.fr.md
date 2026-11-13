# crewcut

<p align="center"><img src="assets/banner.png" alt="crewcut : cheveux courts, code court. Un plugin Claude Code." width="100%"></p>

<p align="center">
<a href="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml"><img src="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
<a href="https://github.com/kaveraa/crewcut/releases"><img src="https://img.shields.io/github/v/release/kaveraa/crewcut?label=release" alt="release"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/kaveraa/crewcut" alt="MIT"></a>
</p>

<p align="center"><a href="https://github.com/kaveraa/crewcut/blob/main/README.md">English</a> - <b>Français</b></p>

<p align="center">
<b>Cheveux courts, code court.</b><br>
Un plugin Claude Code pour le code le plus simple qui marche : moins de code, moins de tokens, des réponses courtes, et aucune coupe sur la sécurité.
</p>

<p align="center"><img src="assets/readme/numbers-fr.png" width="880" alt="Opus 5.5, avec et sans le plugin. Même agent, mêmes tâches, moins de la moitié du code : 58 pour cent de code en moins, 56 pour cent de tokens de sortie en moins, 34 pour cent de coût en moins, 53 pour cent de temps en moins. 30 runs de sécurité sur 30 réussis, avec le plugin comme sans. Le benchmark de ponytail 5, son harnais inchangé : 39 tâches, 5 runs chacune, 390 sessions Claude Code sans interface. Médiane par tâche, moyenne géométrique sur les tâches."></p>

## Installation

```
/plugin marketplace add kaveraa/crewcut
/plugin install crewcut@crewcut
```

Depuis un checkout local, pour une session : `claude --plugin-dir /chemin/vers/crewcut`.

Les hooks lancent `node`, donc Node 22 ou plus récent doit être dans le PATH
du shell qui démarre Claude Code. Sans lui, seuls les skills fonctionnent.

Tout autre agent qui lit un fichier de règles (Codex, Cursor, Copilot,
Gemini CLI, OpenCode et les autres) : copiez [AGENTS.md](AGENTS.md) dans
votre projet. C'est le ruleset `full` ; les niveaux, la revue, l'audit et le
registre restent au plugin Claude Code.

## Avant et après

<p align="center"><img src="assets/readme/beforeafter-fr.png" width="880" alt="Ticket : ajouter un sélecteur de date au frontend. Sans crewcut : 318 lignes, 2 nouveaux paquets, 14 tours, 0,37 USD. Avec crewcut : 10 lignes, aucun paquet, 5 tours, 0,11 USD. Tout le composant est une fonction qui renvoie l'Input du dépôt avec le type date. Même dépôt, même modèle, Opus 5.5, une session sans interface de chaque côté."></p>

Les deux diffs et les deux réponses, tels quels, avec quatre autres
tickets : [examples/](examples/) (en anglais).

## Comment ça marche

<p align="center"><img src="assets/readme/ladder-fr.png" width="880" alt="Comment ça marche. Lire ce que le changement touche, puis prendre le barreau le plus bas qui tient. 1, pas nécessaire : on saute et on le dit en une ligne. 2, déjà dans ce code : on réutilise. 3, dans la bibliothèque standard : on l'utilise. 4, natif à la plateforme, HTML, CSS, SQL, l'OS : on l'utilise. 5, une dépendance installée : on l'utilise, jamais d'ajout. 6, une ligne : une ligne. 7, sinon le minimum qui marche. Jamais coupé : validation aux frontières de confiance, pertes de données, sécurité, accessibilité, tests."></p>

<p align="center"><img src="assets/readme/rules-fr.png" width="880" alt="Le ruleset, à chaque démarrage de session : un senior qui lit tout et n'écrit presque rien. Le ticket, rien de plus : aucune prop, aucun état, mode ou cas limite qu'il n'a pas nommé. Corriger la cause : trouver tous les appelants, corriger la fonction partagée une fois. Court ne veut pas dire faux : une question reçoit une réponse complète, un test qui échoue est corrigé et relancé. Pratiques à jour : suivre ce que la documentation officielle des versions installées recommande aujourd'hui. Sortie propre : les commentaires disent le pourquoi en une ligne, ni emoji, ni flèche, ni tiret long, aucune trace d'IA dans les commits. Avec lui, une carte des noms que le projet définit déjà et les versions qu'il déclare."></p>

Le ruleset complet est dans [Les règles](#les-regles), sous Référence.

## Mesuré

<p align="center"><img src="assets/readme/evals-fr.png" width="880" alt="Suite d'évals, sept cas, trois runs chacun. Plus court, et plus souvent juste. Fable 5.2 : 0,99 avec crewcut, 0,82 pour le même modèle sans plugin. Opus 5.5 : 0,98 avec, 0,79 sans. Sonnet 5.5 : 0,99 avec, 0,85 sans. Haiku 5.5 : 0,96 avec, 0,79 sans. Le score est la part de graders réussis. Chaque cas note la justesse autant que la taille : une réponse plus courte mais fausse vaut zéro."></p>

<p align="center"><img src="assets/readme/pt5-fr.png" width="880" alt="Le benchmark de ponytail 5, crewcut 0.14.0 face à sans plugin, Opus 5.5, 39 tâches, 5 runs. Lignes de code moins 58 pour cent, intervalle à 95 pour cent de moins 68 à moins 47, mieux sur 32 tâches et pire sur 1. Information de code moins 52 pour cent. Tokens de sortie moins 56 pour cent. Coût moins 34 pour cent, intervalle de moins 44 à moins 24. Temps moins 53 pour cent. Tours moins 19 pour cent. Vérifications cachées : 85 sur 90 réussies, 86 sans le plugin. Six tâches de sécurité : 30 sur 30 dans les deux bras. Tâche de confidentialité : 0 sur 5, puis 8 sur 10 après la règle qui nomme ce qu'un changement peut exposer. Ponytail 5 a publié pour lui-même : code moins 53 pour cent, tokens de sortie moins 45, coût moins 26, temps moins 41. Deux runs à un mois d'écart, les intervalles se recouvrent."></p>

<p align="center"><img src="assets/readme/chart-fr.png" width="880" alt="Le benchmark de ponytail 5, Opus 5.5, 39 tâches, 5 runs : ce qui reste du modèle sans plugin une fois crewcut actif. Code 42 pour cent, information de code 48, tokens de sortie 44, coût 66, temps 47, tours 81. Un repère sur chaque barre donne ce que ponytail 5 a publié pour lui-même : 47, 59, 55, 74, 59 et 78. Les deux plugins ont été mesurés à un mois d'écart et leurs intervalles se recouvrent."></p>

<p align="center"><img src="assets/readme/benchmark-fr.png" width="880" alt="Le harnais d'octobre, trois modèles, deux dépôts, face au même modèle sans plugin. Code, tokens, coût, temps, sûr. Opus 5.5 sur Next-js-Boilerplate : moins 82, moins 55, moins 60, moins 67 pour cent, 100 pour cent sûr. Opus 5.5 sur full-stack-fastapi-template : moins 70, moins 40, moins 43, moins 49, 100 sûr. Sonnet 5.5 sur Next-js-Boilerplate : moins 70, moins 11, moins 31, moins 34, 100 sûr. Haiku 4.5 sur Next-js-Boilerplate : moins 63, moins 48, moins 46, moins 40, 100 sûr. Haiku 4.5 sur le template : moins 9, moins 30, moins 30, moins 20, 100 sûr. Sonnet 5.5 sur le template : moins 8, plus 9, plus 2, moins 2, 100 sûr."></p>

<p align="center"><img src="assets/readme/controls-fr.png" width="880" alt="Mêmes runs, deux contrôles : code et coût face à sans plugin, pour crewcut, crewcut tests off, et le prompt YAGNI de sept mots. Le prompt coupe autant sur Opus et Sonnet, écrit plus de code que pas de prompt sur le template Haiku, et n'est sûr que sur 96 pour cent des cellules de sécurité Haiku, là où crewcut l'est sur toutes."></p>

Le premier tableau est le benchmark de ponytail 5, joué avec son harnais
inchangé ; les deux suivants viennent du harnais d'octobre, sur trois modèles
et deux dépôts. Chaque chiffre vaut pour le modèle nommé dans sa ligne. Méthode, tableaux
par tâche, limites et reproduction :
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md) et
[evals/RESULTS.md](evals/RESULTS.md) (en anglais).

<details>
<summary>Les chiffres en texte</summary>

Suite d'évals, sept cas, trois runs chacun, Sonnet comme juge :

| Modèle | crewcut | Score avec | sans | Tours avec | sans | Coût par run avec | sans |
|---|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.14.0 | 0,99 | 0,82 | 4,4 | 6,1 | 0,211 USD | 0,214 USD |
| Opus 5.5 | 0.15.0 | 0,98 | 0,79 | 5,3 | 5,8 | 0,109 USD | 0,106 USD |
| Sonnet 5.5 | 0.15.0 | 0,99 | 0,85 | 4,5 | 6,2 | 0,060 USD | 0,063 USD |
| Haiku 5.5 | 0.14.0 | 0,96 | 0,79 | 5,4 | 7,0 | 0,012 USD | 0,021 USD |

Le benchmark de ponytail 5, Opus 5.5, 39 tâches, 5 runs, crewcut 0.14.0
face à sans plugin :

| | écart | intervalle à 95 % | tâches mieux / pire |
|---|--:|--:|--:|
| Lignes de code | -58 % | -68 à -47 | 32 / 1 |
| Information de code (gzip) | -52 % | -61 à -41 | 34 / 1 |
| Tokens de sortie | -56 % | -64 à -47 | 38 / 1 |
| Coût | -34 % | -44 à -24 | 32 / 7 |
| Temps | -53 % | -59 à -46 | 39 / 0 |
| Tours | -19 % | -26 à -11 | 21 / 4 |

Le harnais d'octobre, crewcut face au même modèle sans plugin :

| crewcut vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| **Opus 5.5, Next-js-Boilerplate** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| **Opus 5.5, full-stack-fastapi-template** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| **Sonnet 5.5, Next-js-Boilerplate** | **-70 %** | **-11 %** | **-31 %** | **-34 %** | **100 %** |
| **Haiku 4.5, Next-js-Boilerplate** | **-63 %** | **-48 %** | **-46 %** | **-40 %** | **100 %** |
| **Haiku 4.5, full-stack-fastapi-template** | **-9 %** | **-30 %** | **-30 %** | **-20 %** | **100 %** |
| **Sonnet 5.5, full-stack-fastapi-template** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |

Le même bras avec `/crewcut tests off` :

| crewcut, tests off, vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -83 % | -57 % | -63 % | -69 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -71 % | -50 % | -53 % | -61 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -69 % | -7 % | -27 % | -33 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -60 % | -55 % | -52 % | -48 % | 100 % |
| Haiku 4.5, full-stack-fastapi-template | -20 % | -38 % | -35 % | -26 % | 100 % |
| Sonnet 5.5, full-stack-fastapi-template | -17 % | -15 % | -26 % | -24 % | 100 % |

Le prompt "Follow YAGNI principles, and prefer one-liner solutions." :

| prompt "YAGNI + one-liners" vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -88 % | -62 % | -66 % | -72 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -72 % | -44 % | -49 % | -56 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -74 % | -17 % | -38 % | -37 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -29 % | -23 % | -7 % | -23 % | 96 % |
| Haiku 4.5, full-stack-fastapi-template | +12 % | -15 % | +11 % | -5 % | 96 % |
| Sonnet 5.5, full-stack-fastapi-template | -31 % | -1 % | -12 % | -14 % | 100 % |

</details>

## Niveaux et commandes

<p align="center"><img src="assets/readme/commands-fr.png" width="880" alt="Niveaux et commandes. Quatre niveaux : off, rien pour cette session ; lite, discipline de sortie et lecture légère ; full, par défaut, sortie, lecture, écriture et outils ; ultra, full plus des réponses d'une ligne et aucun fichier non demandé. Commandes : /crewcut niveau, /crewcut default niveau, /crewcut tests on ou off, /crewcut map on ou off, /crewcut subagents on ou off, /crewcut lang code, /crewcut markers on ou off, /crewcut-review, /crewcut-audit, /crewcut-debt, /crewcut-gain, /crewcut-help, /crewcut uninstall."></p>

Une nouvelle session démarre au niveau par défaut, `full` sauf si vous
l'avez changé ; une session reprise garde le niveau choisi. Taper
`stop crewcut` comme message entier coupe aussi le plugin.

<details>
<summary>Niveaux et commandes en texte</summary>

| Niveau  | Ce que Claude reçoit                                                    |
| ------- | ----------------------------------------------------------------------- |
| `off`   | Rien, pour cette session                                                |
| `lite`  | Discipline de sortie et lecture légère                                  |
| `full`  | Par défaut. Discipline de sortie, de lecture, d'écriture et d'outils    |
| `ultra` | Full, plus des réponses d'une ligne et aucun nouveau fichier ni dépendance sans demande explicite |

| Commande                    | Effet                                                 |
| --------------------------- | ----------------------------------------------------- |
| `/crewcut`                  | Affiche le niveau courant et le niveau par défaut     |
| `/crewcut <niveau>`         | Passe à `off`, `lite`, `full` ou `ultra`              |
| `/crewcut default <niveau>` | Fixe le niveau de départ des nouvelles sessions       |
| `/crewcut subagents on\|off` | Injecte aussi les règles dans les sous-agents (actif par défaut) |
| `/crewcut lang <code>`      | Répond en `en`, `es`, `fr`, `de`, `ko` ou `zh` ; demandé une fois à la première session |
| `/crewcut tests on\|off`     | Off : n'écrit un test que si le ticket le demande, n'en prolonge jamais (actif par défaut ; demandé une fois à la première session) |
| `/crewcut map on\|off`       | Carte des noms du projet et de ses versions déclarées au démarrage de session (actif par défaut) |
| `/crewcut markers on\|off`   | Commentaire `// ~` sur chaque coin coupé (inactif par défaut)     |
| `/crewcut-review [portée]`  | Revue en lecture seule d'un changement : bugs, risque, charge, tests, vitesse, ce qu'il faut couper |
| `/crewcut-audit [chemin]`   | La même sur tout un arbre, classée                    |
| `/crewcut-debt [chemin]`    | Registre des marqueurs `// ~`                         |
| `/crewcut-gain`             | Ce que le plugin économise, tel que mesuré plus haut  |
| `/crewcut-help`             | Carte de référence                                    |
| `/crewcut uninstall`        | Retire les fichiers du plugin à côté de vos réglages  |

</details>

## Revue, audit et dette

<p align="center"><img src="assets/readme/review-fr.png" width="880" alt="Un exemple du format de /crewcut-review. Ce que fait le changement, puis des constats groupés en à corriger et à corriger ensuite, chacun avec le quoi, le problème, le correctif et la conséquence si on le saute, un verdict et les lignes à couper. Dans l'ordre : juste, sûr, tient à la charge, testé, rapide, sobre. Lecture seule. /crewcut-audit fait la même revue sur tout un arbre, vingt constats au plus."></p>

`/crewcut-review` prend les changements non commités, une plage git, un
lien de PR ou des chemins de fichiers. Avec `/crewcut markers on`, un coin
coupé volontairement porte un discret
`// ~ no retry, add when the API flakes`, et `/crewcut-debt` les liste.
crewcut n'écrit jamais son nom dans votre code.

## Référence

<details>
<summary>Réglages</summary>

Les réglages vivent dans `crewcut.json` à côté de vos réglages Claude
(`~/.claude`, ou `CLAUDE_CONFIG_DIR`) :

```json
{ "defaultLevel": "ultra", "subagents": true, "markers": false, "map": true }
```

| Clé               | Variable d'environnement   | Effet                                               |
| ----------------- | -------------------------- | --------------------------------------------------- |
| `defaultLevel`    | `CREWCUT_DEFAULT_MODE`     | Niveau de départ des nouvelles sessions             |
| `subagents`       |                            | Injecte le ruleset dans les sous-agents (environ 500 tokens chacun) |
| `subagentMatcher` | `CREWCUT_SUBAGENT_MATCHER` | Expression régulière, insensible à la casse, sur le type d'agent, par exemple `explore\|general` |
| `markers`         |                            | Commentaire `// ~` sur chaque coin coupé            |
| `tests`           | `CREWCUT_TESTS`            | `false` ou `off` : n'écrit un test que si le ticket le demande |
| `map`             | `CREWCUT_MAP`              | `false` ou `off` : ni carte ni versions au démarrage ; `CREWCUT_MAP_CHARS` fixe la taille de la carte, 1500 par défaut |

La variable d'environnement l'emporte sur le fichier. Un sous-agent dont le
type est inconnu, ou un motif qui ne compile pas, reçoit quand même les
règles. Sans motif, les deux agents intégrés qui ne touchent jamais au code,
`claude-code-guide` et `statusline-setup`, ne reçoivent rien ; un motif qui
les nomme les réintègre.

</details>

<details>
<summary>Ligne de statut</summary>

Le plugin fournit une ligne de statut qui affiche le niveau, le modèle et le
dossier de travail, par exemple `crewcut: ultra | Opus | shop`. Le niveau
est en vert, ambre pour `ultra`, gris pour `off` ; posez `NO_COLOR=1` pour
l'afficher sans couleur. Au premier démarrage sans ligne de statut
configurée, Claude propose une fois de l'ajouter à vos réglages ; dites
oui, ou ajoutez-la vous-même :

```json
"statusLine": { "type": "command", "command": "node \"C:/Users/vous/.claude/crewcut-statusline.js\"" }
```

Au démarrage de la session, le hook copie le script dans
`crewcut-statusline.js` à côté de vos réglages Claude, sous un chemin qui
survit aux mises à jour du plugin. Le niveau est gardé par projet
(`crewcut-levels/` à côté de vos réglages, un fichier par projet hors du
niveau par défaut), donc deux sessions dans deux dépôts gardent chacune le
sien ; la ligne de statut lit le `crewcut-mode` partagé, qui porte le
dernier niveau posé.

</details>

<details>
<summary>Agent de code</summary>

Le plugin fournit `crewcut-coder`, un agent de code sur Opus, avec Read,
Grep, Glob, Edit, Write et Bash. Claude lui délègue une tâche de code
(implémenter, corriger, refactorer, écrire un test) quand la session tourne
sur un modèle plus léger ou que le contexte principal doit rester petit ;
on peut aussi le demander par son nom. Il reçoit les règles crewcut comme
tout sous-agent et finit par un rapport court : fichiers modifiés, résultat
des tests. La recherche reste à l'agent Explore intégré à Claude Code, la
revue à `crewcut-reviewer` sur Sonnet. Une tâche qu'il traite est facturée
au tarif Opus, même dans une session Sonnet.

Les deux agents nomment leur modèle par alias : ils suivent chaque nouvelle
version d'Opus et de Sonnet sans mise à jour du plugin.

</details>

<details>
<summary id="les-regles">Les règles</summary>

Ce que dit le ruleset, au-delà de l'échelle plus haut.

**Discipline de tokens**

- Sortie : pas de préambule, pas de récapitulatif, pas d'explication non
  demandée. Ne jamais recoller le code qui vient d'être écrit. Trois phrases
  au plus : ce qui a changé, où, et une mise en garde seulement si elle change
  ce que vous ferez ensuite ; aucune proposition ni ligne "skipped" pour ce
  que le ticket n'a pas demandé ; pas de liste à puces.
- Lecture : grep sur les symboles que le changement touche, puis lire
  seulement ces fichiers, par plage de lignes ; un grep vaut mieux que trois
  lectures ; ne jamais relire un fichier ; ne jamais ouvrir un fichier pour
  confirmer ce que grep a déjà montré.
- Écriture : des modifications ciblées, jamais la réécriture d'un fichier
  entier ; pas de doc ni de refactor non demandés ; une seule exécution des
  tests à la fin.
- Tests : aucun sauf si la tâche le demande ou si un fichier de tests
  existant couvre le code touché, et alors on étend ce fichier ; ne jamais
  créer un fichier de tests de sa propre initiative, même invité à ajouter
  des tests "si vous le faites d'habitude".
- Outils : grouper les appels indépendants ; ne jamais afficher de grandes
  sorties ; pas de sous-agent pour ce qu'une lecture répond.

**Jamais coupé.** La validation aux frontières de confiance, ce qui évite
une perte de données, la sécurité, les bases de l'accessibilité, les tests
existants, et tout ce que vous avez explicitement demandé. Simple ne veut
pas dire négligent. Avant d'écrire, Claude nomme ce que le changement
pourrait exposer ou détruire pour les utilisateurs.

**Moderne par défaut.** Claude vérifie les versions que le projet utilise,
langage, runtime, framework et bibliothèques, et suit ce que leur
documentation officielle recommande aujourd'hui, y compris les formes
compactes quand elles restent claires : ternaire, chaînage optionnel,
déstructuration, retour anticipé. Un doute sur une API, ou une version plus
récente que ce qu'il connaît : il lit la documentation ou le code installé
au lieu de deviner. Jamais un pattern déprécié, jamais une fonctionnalité
que la version n'a pas.

**Commentaires.** Le pourquoi seulement, en une ligne simple.

**Texte brut seulement.** Dans le code, les commentaires, les commits, les
pull requests et les réponses : pas d'emoji, pas d'émoticône, pas de symbole
flèche (`->` à la place), pas de tiret long (`-` à la place), pas de
guillemets courbes (`"` à la place). Tout ce qui s'en trouve dans un texte
que Claude touche est remplacé.

**Commits et pull requests.** Un sujet court, un corps bref seulement quand
il apporte quelque chose. Aucune mention d'IA, aucun co-auteur IA, aucune
ligne "generated with", aucun trailer ; tout filigrane de ce genre trouvé
dans un message, une description de PR ou un fichier est retiré avant que le
commit ou la PR ne parte. Une description de pull request dit ce qui a
changé, pourquoi, et comment ça a été vérifié, en quelques lignes.

</details>

## FAQ

**Pourquoi un plugin quand le prompt de sept mots coupe plus sur Opus ?**
Parce que le prompt coupe à l'aveugle. Il livre des composants plus nus et
saute les tests : sur Opus il écrit des tests dans 31 % des cellules contre
50 % pour crewcut sur le template. Sur Haiku, il écrit plus de code que pas
de prompt du tout, et retire un garde-fou une fois, le contrôle par client
d'un limiteur de débit. Crewcut a gardé chaque garde-fou sur chaque cellule
de sécurité de chaque palier, nomme ce qui n'est jamais coupé, et corrige
un bug à sa racine plutôt que chez l'appelant. Si vous préférez l'économie
du prompt, `/crewcut tests off` garde tout le reste.

**Suit-il les nouveaux modèles ?** Oui. Le ruleset est injecté quel que
soit le modèle de la session, et les deux agents nomment le leur par alias.
Les chiffres plus haut sont une autre affaire : chacun vaut pour le modèle
sur lequel il a été mesuré, nommé dans sa ligne.

**Revendique-t-il une économie sur mon dépôt ?** Non. `/crewcut-gain`
affiche les chiffres mesurés ; la version que vous n'avez pas construite
n'a jamais été écrite.

## Mise à jour et désinstallation

Mettez à jour avec `/plugin marketplace update crewcut` puis
`/reload-plugins`, ou activez la mise à jour automatique du marketplace dans
`/plugin`.

Tapez `/crewcut uninstall` dans une session, puis `/plugin remove crewcut`.
Le premier retire les fichiers que le plugin garde à côté de vos réglages
Claude (le niveau de la session et les niveaux par projet, `crewcut.json`,
la copie de la ligne de statut et son drapeau, plus l'entrée `statusLine`
quand elle pointe vers le script de crewcut) ; le second retire le plugin
lui-même. Depuis un shell, le même nettoyage est
`node <dossier du plugin>/hooks/crewcut.js uninstall`.

## Limites

- Les hooks ont besoin de `node` dans le PATH.
- Deux sessions dans le même projet partagent un niveau ; la ligne de statut
  affiche le dernier niveau posé, quel que soit le projet.
- La carte liste les définitions de premier niveau trouvées par une
  expression régulière par langage (JavaScript et TypeScript, Python, Go,
  Rust, Ruby, PHP, Java, Kotlin, C#, Swift) ; les définitions imbriquées ou
  dynamiques n'y sont pas. Les versions viennent de `package.json` et
  `composer.json` seulement.
- Les hooks, les niveaux, la revue, l'audit et le registre sont réservés à
  Claude Code ; les autres agents reçoivent le ruleset par `AGENTS.md`.
- Une session cloud (claude.ai/code) ne charge ni un plugin installé avec
  `/plugin`, ni un plugin qu'un dépôt active dans `.claude/settings.json`,
  et n'a pas de commande `/plugin`. L'installation de crewcut y est en
  cours de test.

## Crédits et licence

Inspiré de ponytail, de Dietrich Gebert. Licence MIT.
