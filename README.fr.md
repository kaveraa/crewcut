# crewcut

<p align="center"><img src="https://raw.githubusercontent.com/kaveraa/crewcut/acdf351/assets/banner.svg" alt="crewcut" width="100%"></p>

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

<p align="center"><img src="assets/readme/numbers-fr.png" width="880" alt="Opus 5.5, avec et sans le plugin. Même agent, mêmes tickets, une fraction du code : 82 pour cent de code en moins, 55 pour cent de tokens en moins, 60 pour cent de coût en moins, 67 pour cent de temps en moins. 100 pour cent des tâches de sécurité passent toujours. Douze tickets d'une ligne sur Next-js-Boilerplate, sessions Claude Code sans interface, notées sur le git diff, face au même modèle sans plugin."></p>

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

Sans le plugin, Opus installe un calendrier et un popover, écrit un
composant d'enrobage, une feuille de style et une page d'exemple, et vous
demande de lancer `bun install`. Avec lui, la réponse dit ce que le
composant enrobe, qu'il fonctionne avec `react-hook-form` comme les autres
champs, que rien n'a été exécuté, et que le calendrier stylé coûterait deux
paquets si vous le voulez.

Les deux diffs et les deux réponses, tels quels, avec quatre autres
tickets : [examples/](examples/) (en anglais).

## Comment ça marche

<p align="center"><img src="assets/readme/ladder-fr.png" width="880" alt="Comment ça marche. Lire ce que le changement touche, puis prendre le barreau le plus bas qui tient. 1, pas nécessaire : on saute et on le dit en une ligne. 2, déjà dans ce code : on réutilise. 3, dans la bibliothèque standard : on l'utilise. 4, natif à la plateforme, HTML, CSS, SQL, l'OS : on l'utilise. 5, une dépendance installée : on l'utilise, jamais d'ajout. 6, une ligne : une ligne. 7, sinon le minimum qui marche. Jamais coupé : validation aux frontières de confiance, pertes de données, sécurité, accessibilité, tests."></p>

Au démarrage de la session, et dans chaque sous-agent, Claude reçoit un
ruleset : un senior qui lit tout et n'écrit presque rien.

- **Construire le ticket, pas ses voisins.** Aucune prop, aucun état, mode
  ou cas limite que le ticket n'a pas nommé. Un second cas d'usage est un
  second ticket.
- **Corriger un bug, c'est corriger sa cause.** Trouver tous les appelants,
  corriger la fonction partagée une fois, même quand les autres appelants
  semblent sûrs aujourd'hui.
- **Court ne veut jamais dire faux.** Une question reçoit une réponse
  complète, un test qui échoue est corrigé et relancé, un fichier modifié
  depuis la dernière lecture est relu.
- **Pratiques à jour.** Claude suit ce que la documentation officielle des
  versions installées recommande aujourd'hui, et la lit en cas de doute.
- **Sortie propre.** Les commentaires disent le pourquoi, en une ligne
  simple. Pas d'emoji, pas de symbole flèche, pas de tiret long. Aucune
  mention ni co-auteur IA dans les commits et les pull requests.

Avec le ruleset, le démarrage de session porte une carte de ce que le
projet définit déjà, une ligne par dossier avec ses noms exportés, et les
versions que `package.json` et `composer.json` déclarent. Réutiliser un
helper et écrire pour les versions utilisées ne coûtent alors aucune
recherche. `/crewcut map off` retire les deux.

Le ruleset complet : [Les règles](#les-regles).

## Mesuré

<p align="center"><img src="assets/readme/evals-fr.png" width="880" alt="Suite d'évals, sept cas, trois runs chacun. Plus court, et plus souvent juste. Fable 5.2 : 0,99 avec crewcut, 0,82 pour le même modèle sans plugin. Opus 5.5 : 1,00 avec, 0,81 sans. Sonnet 5.5 : 0,98 avec, 0,86 sans. Haiku 5.5 : 0,96 avec, 0,79 sans. Le score est la part de graders réussis. Chaque cas note la justesse autant que la taille : une réponse plus courte mais fausse vaut zéro."></p>

**Suite d'évals.** Les sept cas du plugin, trois runs chacun, avec et sans
le plugin, Sonnet comme juge. Chaque cas note la justesse autant que la
taille.

| Modèle | crewcut | Score avec | sans | Tours avec | sans | Coût par run avec | sans |
|---|---|--:|--:|--:|--:|--:|--:|
| Fable 5.2 | 0.14.0 | 0,99 | 0,82 | 4,4 | 6,1 | 0,211 USD | 0,214 USD |
| Opus 5.5 | 0.14.0 | 1,00 | 0,81 | 5,2 | 5,7 | 0,105 USD | 0,102 USD |
| Sonnet 5.5 | 0.14.0 | 0,98 | 0,86 | 4,4 | 6,2 | 0,059 USD | 0,059 USD |
| Haiku 5.5 | 0.14.0 | 0,96 | 0,79 | 5,4 | 7,0 | 0,012 USD | 0,021 USD |

Un bug dans une fonction partagée est corrigé à sa racine dans 3 runs sur 3
avec le plugin sur les quatre modèles, 0 sans : chaque run sans lui a
rustiné l'appelant. Tableaux par cas et chaque remesure :
[evals/RESULTS.md](evals/RESULTS.md) (en anglais).

**Benchmark agentique.** Douze tickets d'une ligne sur un vrai dépôt, une
session Claude Code sans interface par cellule, notée sur le `git diff`
qu'elle laisse, plus sept tâches de sécurité dont la sortie est exécutée
sur des entrées hostiles. Chaque case est un pourcentage du même modèle
sans plugin.

| crewcut vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| **Opus 5.5, Next-js-Boilerplate** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| **Opus 5.5, full-stack-fastapi-template** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| **Sonnet 5.5, Next-js-Boilerplate** | **-70 %** | **-11 %** | **-31 %** | **-34 %** | **100 %** |
| **Haiku 4.5, Next-js-Boilerplate** | **-63 %** | **-48 %** | **-46 %** | **-40 %** | **100 %** |
| **Haiku 4.5, full-stack-fastapi-template** | **-9 %** | **-30 %** | **-30 %** | **-20 %** | **100 %** |
| **Sonnet 5.5, full-stack-fastapi-template** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |

La coupe suit ce que la baseline sur-construit, qui dépend du dépôt autant
que du modèle : elle est la plus forte quand un élément natif remplace un
composant, proche de zéro sur les endpoints irréductibles. Les tokens ne
baissent que là où le plugin retire des tours : sur Opus, de 12,1 à 7,5 par
ticket.

<p align="center"><img src="assets/benchmark-opus-next.svg" width="860" alt="Chaque bras en pourcentage de la baseline sans plugin sur les lignes, les tokens, le coût et le temps (Opus 5.5, Next-js-Boilerplate). Crewcut : lignes 18, tokens 45, coût 40, temps 33. Crewcut tests off : 17, 43, 37, 31. Le prompt yagni : 12, 38, 34, 28. Sécurité : chaque bras 100 pour cent."></p>

<details>
<summary>Tests off, et le contrôle du prompt de sept mots</summary>

Le même bras avec `/crewcut tests off`, un test seulement si le ticket le
demande :

| crewcut, tests off, vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -83 % | -57 % | -63 % | -69 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -71 % | -50 % | -53 % | -61 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -69 % | -7 % | -27 % | -33 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -60 % | -55 % | -52 % | -48 % | 100 % |
| Haiku 4.5, full-stack-fastapi-template | -20 % | -38 % | -35 % | -26 % | 100 % |
| Sonnet 5.5, full-stack-fastapi-template | -17 % | -15 % | -26 % | -24 % | 100 % |

Le prompt de sept mots "Follow YAGNI principles, and prefer one-liner
solutions." dans les mêmes runs :

| prompt "YAGNI + one-liners" vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -88 % | -62 % | -66 % | -72 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -72 % | -44 % | -49 % | -56 % | 100 % |
| Sonnet 5.5, Next-js-Boilerplate | -74 % | -17 % | -38 % | -37 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -29 % | -23 % | -7 % | -23 % | 96 % |
| Haiku 4.5, full-stack-fastapi-template | +12 % | -15 % | +11 % | -5 % | 96 % |
| Sonnet 5.5, full-stack-fastapi-template | -31 % | -1 % | -12 % | -14 % | 100 % |

<p align="center"><img src="assets/benchmark-opus-tests.svg" width="860" alt="Tests on contre tests off, chaque bras en pourcentage de la baseline sans plugin (Opus 5.5, full-stack-fastapi-template). Crewcut tests on : lignes 30, tokens 60, coût 57, temps 51. Crewcut tests off : 29, 50, 47, 39. Le prompt yagni : 28, 56, 51, 44. Sécurité : chaque bras 100 pour cent."></p>

Caveman, le contrôle prose concise, ne coupe aucun code (+4 % de lignes sur
le template) : prose courte ne veut pas dire code court.

</details>

Le harnais est celui que ponytail a publié pour son propre benchmark, avec
un bras `crewcut` en plus ; les lignes Haiku sont la remesure de crewcut
0.11.3. Méthode, tableaux par tâche, limites et reproduction :
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md) (en anglais).

## Niveaux et commandes

| Niveau  | Ce que Claude reçoit                                                    |
| ------- | ----------------------------------------------------------------------- |
| `off`   | Rien, pour cette session                                                |
| `lite`  | Discipline de sortie et lecture légère                                  |
| `full`  | Par défaut. Discipline de sortie, de lecture, d'écriture et d'outils    |
| `ultra` | Full, plus des réponses d'une ligne et aucun nouveau fichier ni dépendance sans demande explicite |

Une nouvelle session démarre au niveau par défaut, `full` sauf si vous l'avez
changé ; une session reprise et une compaction du contexte gardent le niveau
choisi. Taper `stop crewcut` ou `normal mode` comme message entier coupe
aussi le plugin.

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

## Revue, audit et dette

`/crewcut-review` passe en revue les changements non commités, ou le
dernier commit s'il n'y en a pas ; une plage git, un lien de PR ou des
chemins de fichiers fixent la portée. Un agent en lecture seule sur Sonnet
lit le diff et le code qu'il touche, appelants compris, dans cet ordre :
juste, sûr, tient à la charge que le projet attend, testé, rapide, sobre.
Chaque constat vient avec un cas concret, le plus petit correctif et ce qui
arrive si on le saute, numéroté pour que vous puissiez dire « corrige 2 et
4 » :

```
What this does: adds a nightly job that closes the day and bills its orders.

Must fix
1. Orders land on the wrong day (billing/close_day.py:40-52)
   What: the job stamps each order with the server clock, which runs in UTC.
   Problem: an order placed at 00:30 in Berlin is billed on the day before.
   Fix: take the date once in the shop's time zone; one line, nothing else moves.
   If skipped: late orders carry the wrong date and accounting corrects them by hand.

Should fix
2. No test on the billing total (billing/close_day.py:60)
   ...

Verdict: fix 1 first.
cut: 14 lines
```

`/crewcut-audit` fait la même revue sur tout un arbre, points d'entrée et
flux principaux d'abord, vingt constats au plus. Les deux rapportent et ne
changent rien.

Avec `/crewcut markers on`, un coin coupé volontairement porte un
commentaire comme `// ~ no retry, add when the API flakes`. Le signe est
discret : crewcut n'écrit jamais son nom dans votre code. `/crewcut-debt`
rassemble les marqueurs et signale ceux qui ne nomment aucune condition
pour y revenir :

```
src/queue.js:18: no retry -> add when: the API flakes
src/report.js:40: full table scan -> no trigger
2 markers, 1 without a trigger
```

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
pas dire négligent.

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
