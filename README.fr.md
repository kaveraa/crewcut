# crewcut

<p align="center"><img src="https://raw.githubusercontent.com/kaveraa/crewcut/acdf351/assets/banner.svg" alt="crewcut" width="100%"></p>

<p align="center">
<a href="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml"><img src="https://github.com/kaveraa/crewcut/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
<a href="https://github.com/kaveraa/crewcut/releases"><img src="https://img.shields.io/github/v/release/kaveraa/crewcut?label=release" alt="release"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/kaveraa/crewcut" alt="MIT"></a>
</p>

<p align="center"><a href="https://github.com/kaveraa/crewcut/blob/main/README.md">English</a> - <b>Français</b></p>

Cheveux courts, code court. Un plugin Claude Code pour le code le plus simple
qui marche : moins de code, moins de tokens, des réponses courtes, et aucune
coupe sur la sécurité.

> **Sur Opus 5.5, jusqu'à 82 % de code en moins et 60 % de coût en moins**
> que le même modèle sans le plugin, chaque garde-fou conservé. Mesuré avec
> le benchmark que ponytail a publié pour lui-même.

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

## Comment ça marche

Au démarrage de la session, et dans chaque sous-agent, Claude reçoit un seul
ruleset : un senior qui lit tout et n'écrit presque rien. Pour chaque bout
de code, il prend le barreau le plus bas qui tient :

1. Doit-il exister ? Sinon, on le saute et on le dit en une ligne.
2. Déjà dans ce code ? On le réutilise.
3. La bibliothèque standard le fait ? On l'utilise.
4. La plateforme le fait nativement (HTML, CSS, SQL, OS) ? On l'utilise.
5. Une dépendance installée le fait ? On l'utilise. Jamais en ajouter une pour ce que quelques lignes font.
6. Une ligne ? Une ligne.
7. Seulement ensuite : le minimum qui marche.

**Construire le ticket, pas ses voisins.** Aucune prop, état, mode, réglage
ou cas limite optionnel que le ticket n'a pas nommé. Un second cas d'usage
est un second ticket. Pas d'alias de type ni de helper pour un usage unique.

**Corriger un bug, c'est corriger la cause.** Trouver chaque appelant,
corriger la fonction partagée une fois, même quand les autres appelants
semblent sûrs aujourd'hui.

**Jamais coupé.** La validation aux frontières de confiance, la gestion qui
évite la perte de données, la sécurité, les bases de l'accessibilité, les
tests existants, et tout ce que vous avez explicitement demandé. Simple ne
veut pas dire négligent.

**Court ne veut jamais dire faux.** Une question reçoit une réponse
complète, un test qui échoue est corrigé et relancé, un fichier qui a changé
depuis la dernière lecture est relu. Moins de tokens n'est le but que si la
réponse reste juste.

Le ruleset complet est dans [Les règles](#les-règles) plus bas.

## Benchmark

Crewcut passé au benchmark que ponytail a publié pour lui-même : douze
tickets d'une ligne sur un vrai dépôt, une session Claude Code headless par
cellule, notée sur le `git diff` qu'elle laisse, avec les mêmes contrôles
(caveman pour la prose concise, le prompt YAGNI de sept mots) et sept tâches
de sécurité dont la sortie est exécutée sur des entrées hostiles. Deux
dépôts, full-stack-fastapi-template (celui de ponytail, FastAPI + React) et
Next-js-Boilerplate, trois paliers de modèle, trois ou quatre runs par
cellule. Chaque case est la moyenne du bras sur toutes les cellules, en
pourcentage du même modèle sans plugin.

| crewcut vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| **Opus 5.5, Next-js-Boilerplate** | **-82 %** | **-55 %** | **-60 %** | **-67 %** | **100 %** |
| **Opus 5.5, full-stack-fastapi-template** | **-70 %** | **-40 %** | **-43 %** | **-49 %** | **100 %** |
| **Haiku 4.5, Next-js-Boilerplate** | **-40 %** | **-10 %** | **-13 %** | **-20 %** | **100 %** |
| **Haiku 4.5, full-stack-fastapi-template** | **-14 %** | **-3 %** | **-4 %** | **-7 %** | **100 %** |
| **Sonnet 5.5, full-stack-fastapi-template** | **-8 %** | **+9 %** | **+2 %** | **-2 %** | **100 %** |

Le prompt de sept mots "Follow YAGNI principles, and prefer one-liner
solutions." dans les mêmes runs :

| prompt "YAGNI + one-liners" vs baseline sans plugin | lignes | tokens | coût | temps | sûr |
|---|--:|--:|--:|--:|--:|
| Opus 5.5, Next-js-Boilerplate | -88 % | -62 % | -66 % | -72 % | 100 % |
| Opus 5.5, full-stack-fastapi-template | -72 % | -44 % | -49 % | -56 % | 100 % |
| Haiku 4.5, Next-js-Boilerplate | -29 % | -23 % | -7 % | -23 % | 96 % |
| Haiku 4.5, full-stack-fastapi-template | +12 % | -15 % | +11 % | -5 % | 96 % |
| Sonnet 5.5, full-stack-fastapi-template | -31 % | -1 % | -12 % | -14 % | 100 % |

**Pourquoi un plugin quand sept mots coupent plus sur Opus ?** Parce que le
prompt coupe à l'aveugle.

- Ses lignes en moins, il les gagne en sautant les tests : sur Opus il écrit
  des tests dans 31 % des cellules contre 50 % pour crewcut sur le template,
  et dans aucune contre 19 % sur le boilerplate ; sur Sonnet, 22 % contre
  50 %. Chaque test de crewcut prolonge un fichier de test que le dépôt avait
  déjà.
- Sur Haiku, il écrit plus de code que pas de prompt du tout, et retire un
  garde-fou une fois, le contrôle par client d'un limiteur de débit. Crewcut
  a gardé chaque garde-fou sur chaque cellule de sécurité de chaque palier.
- Le ruleset nomme ce qui n'est jamais coupé, corrige un bug à sa racine
  plutôt que chez l'appelant, et vient avec des niveaux, une review, un audit
  et un registre de dette.

Caveman, le contrôle prose concise, ne coupe aucun code (+4 % de lignes sur
le template) : prose courte ne veut pas dire code court.

La coupe est la plus forte quand un élément natif remplace un composant :
sur le sélecteur de date, Opus écrit 369 lignes avec deux nouvelles
dépendances, crewcut un input natif de 10 lignes. Elle est proche de zéro
sur les endpoints irréductibles, et elle suit ce que la baseline
sur-construit : Opus le plus, Sonnet le moins. Sur Sonnet, le ruleset relu
à chaque tour est tout le coût ; crewcut 0.6.3, avec un ruleset allégé et
six runs par ticket, y coupe 13 % des lignes et 11 % du coût à tokens
égaux. Les tokens ne baissent que là où le plugin retire des tours : sur
Opus, de 12,1 à 7,5 par ticket.

Méthode, tableaux par tâche, remesure de chaque version, limites et
reproduction :
[benchmarks/agentic/RESULTS.md](benchmarks/agentic/RESULTS.md) (en anglais).
Cinq cellules avec le diff et la réponse de chaque bras, tels quels :
[examples/](examples/) (en anglais).

## Suite d'évals

Les sept cas du plugin, trois runs chacun, avec et sans le plugin, Sonnet
comme juge
(`claude plugin eval . --ablation with-without --runs 3 --judge-model sonnet`,
avec `--allow-tools Edit Write`). Le score est la part des graders passés ;
chaque cas note la justesse autant que la taille, donc une réponse plus
courte mais fausse vaut zéro. Dernière mesure sur chaque modèle de travail
(Claude Code 2.1.289) :

| Modèle | crewcut | Score avec | sans | Tours avec | sans | Coût par run avec | sans |
|---|---|--:|--:|--:|--:|--:|--:|
| Fable 5.1 | 0.7.0 | 0,98 | 0,81 | 5,7 | 8,4 | 0,296 USD | 0,414 USD |
| Sonnet 5.5 | 0.9.0 | 0,97 | 0,85 | 4,4 | 5,8 | 0,057 USD | 0,059 USD |
| Opus 5.5 | 0.9.0 | 0,99 | 0,81 | 5,0 | 6,0 | 0,104 USD | 0,104 USD |

- Le gain grandit avec le projet. `csv-export`, c'est vingt fichiers de
  source et de test avec un bug d'une ligne : avec le plugin, Fable lit 3,3
  fichiers contre 9,0, et `vat-country`, sept modules, 3,0 contre 11,0. Les
  cas à un fichier n'ont rien à couper, et le ruleset y est un coût fixe.
- `shared-bug` est corrigé dans la fonction partagée dans 3 runs sur 3 avec
  le plugin sur les trois modèles, 0 sans : chaque run sans lui a rustiné
  l'appelant.
- `keep-validation` demande de simplifier un handler à une frontière de
  confiance et échoue si un contrôle disparaît : sans le plugin, Fable et
  Opus ont retiré un contrôle ou surestimé ce qu'ils gardaient.
  `explain-bug` échoue si l'explication est tronquée ; `vat-country` et
  `csv-export` échouent si un test existant ou un module non concerné
  change.

Tableaux par cas et remesure de chaque version :
[evals/RESULTS.md](evals/RESULTS.md) (en anglais).

## Niveaux

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

## Commandes

| Commande                    | Effet                                                 |
| --------------------------- | ----------------------------------------------------- |
| `/crewcut`                  | Affiche le niveau courant et le niveau par défaut     |
| `/crewcut <niveau>`         | Passe à `off`, `lite`, `full` ou `ultra`              |
| `/crewcut default <niveau>` | Fixe le niveau de départ des nouvelles sessions       |
| `/crewcut subagents on\|off` | Injecte aussi les règles dans les sous-agents (actif par défaut) |
| `/crewcut lang <code>`      | Répond en `en`, `es`, `fr`, `de`, `ko` ou `zh` ; demandé une fois à la première session |
| `/crewcut markers on\|off`   | Commentaire `crewcut:` sur chaque coin coupé (inactif par défaut) |
| `/crewcut-review [portée]`  | Revue en lecture seule d'un diff                      |
| `/crewcut-audit [chemin]`   | Même revue sur tout un arbre, classée par lignes à couper |
| `/crewcut-debt [chemin]`    | Registre des marqueurs `crewcut:`                     |
| `/crewcut-gain`             | Ce que le plugin économise, tel que mesuré plus haut  |
| `/crewcut-help`             | Carte de référence                                    |
| `/crewcut uninstall`        | Retire les fichiers du plugin à côté de vos réglages  |

### Revue, audit et dette

`/crewcut-review` passe en revue les changements non commités ;
`/crewcut-review main..HEAD` ou `/crewcut-review src/a.js src/b.js` réduit
la portée. Un agent en lecture seule rapporte une ligne par constat, avec le
barreau où le code aurait dû s'arrêter (`skip`, `reuse`, `stdlib`, `native`,
`installed`, `one-line`, ou `prose` pour les commentaires et la doc non
demandés) :

```
src/signup.js:42: stdlib hand-written email check (18 lines) -> one call to the platform email validator
cut: 17 lines
```

`/crewcut-audit` fait la même revue sur tout un arbre. Les deux mettent la
session dans un état `review` en lecture seule jusqu'à ce que vous repassiez
à un niveau : `/crewcut` l'affiche, une compaction le garde, et les
sous-agents démarrés entre-temps reçoivent la règle de lecture seule à la
place du ruleset. Aucun des deux ne change quoi que ce soit.

Avec `/crewcut markers on`, chaque coin que crewcut coupe volontairement
porte un commentaire comme `// crewcut: no retry, add when the API flakes`,
jamais en préfixe d'un commentaire qui explique le code. Les marqueurs sont
inactifs par défaut : sur un vrai projet les modèles mettent aussi le préfixe
sur des commentaires ordinaires, et le nom d'un plugin n'a rien à faire dans
votre code si vous n'avez pas demandé le registre. `/crewcut-debt` rassemble
les marqueurs en une liste et signale ceux qui ne nomment aucune condition
pour y revenir :

```
src/queue.js:18: no retry -> add when: the API flakes
src/report.js:40: full table scan -> no trigger
2 markers, 1 without a trigger
```

`/crewcut-gain` affiche les chiffres ci-dessus sous forme de carte. Il ne
revendique jamais une économie sur votre dépôt, puisque la version que vous
n'avez pas construite n'a jamais été écrite.

### Agent de code

Le plugin fournit `crewcut-coder`, un agent de code fixé sur Opus, avec
Read, Grep, Glob, Edit, Write et Bash. Claude lui délègue une tâche de code
(implémenter, corriger, refactorer, écrire un test) quand la session tourne
sur un modèle plus léger ou que le contexte principal doit rester petit ;
on peut aussi le demander par son nom. Il reçoit les règles crewcut comme
tout sous-agent et finit par un rapport court : fichiers modifiés, résultat
des tests. La recherche reste à l'agent Explore intégré à Claude Code, la
revue à `crewcut-reviewer` sur Sonnet. Une tâche qu'il traite est facturée
au tarif Opus, même dans une session Sonnet.

## Ligne de statut

Le plugin fournit une ligne de statut qui affiche le niveau, le modèle et le
dossier de travail, par exemple `crewcut: ultra | Opus | shop`. Le niveau
est en vert, ambre pour `ultra`, bleu pour `review`, gris pour `off` ; posez
`NO_COLOR=1` pour l'afficher sans couleur. Au premier démarrage sans ligne
de statut configurée, Claude propose une fois de l'ajouter à vos réglages ;
dites oui, ou ajoutez-la vous-même :

```json
"statusLine": { "type": "command", "command": "node \"C:/Users/vous/.claude/crewcut-statusline.js\"" }
```

Au démarrage de la session, le hook copie le script dans
`crewcut-statusline.js` à côté de vos réglages Claude, sous un chemin qui
survit aux mises à jour du plugin, et rafraîchit la copie quand le plugin
change.

## Réglages

Les réglages vivent dans `crewcut.json` à côté de vos réglages Claude
(`~/.claude`, ou `CLAUDE_CONFIG_DIR`) :

```json
{ "defaultLevel": "ultra", "subagents": true, "markers": false }
```

| Clé               | Variable d'environnement   | Effet                                               |
| ----------------- | -------------------------- | --------------------------------------------------- |
| `defaultLevel`    | `CREWCUT_DEFAULT_MODE`     | Niveau de départ des nouvelles sessions             |
| `subagents`       |                            | Injecte le ruleset dans les sous-agents (environ 500 tokens chacun) |
| `subagentMatcher` | `CREWCUT_SUBAGENT_MATCHER` | Expression régulière, insensible à la casse, sur le type d'agent, par exemple `explore\|general` |
| `markers`         |                            | Commentaire `crewcut:` sur chaque coin coupé        |

La variable d'environnement l'emporte sur le fichier. Un sous-agent dont le
type est inconnu, ou un motif qui ne compile pas, reçoit quand même les
règles. Sans motif, les deux agents intégrés qui ne touchent jamais au code,
`claude-code-guide` et `statusline-setup`, ne reçoivent rien ; un motif qui
les nomme les réintègre.

## Les règles

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

**Moderne par défaut.** Claude vérifie les versions que le projet utilise,
langage, runtime, framework et bibliothèques, et emploie les idiomes que ces
versions permettent, y compris les formes compactes quand elles restent
claires : ternaire, chaînage optionnel, déstructuration, retour anticipé.
Jamais un vieux pattern que la version a remplacé, jamais une fonctionnalité
que la version n'a pas.

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

## Mise à jour et désinstallation

Mettez à jour avec `/plugin marketplace update crewcut` puis
`/reload-plugins`, ou activez la mise à jour automatique du marketplace dans
`/plugin`.

Tapez `/crewcut uninstall` dans une session, puis `/plugin remove crewcut`.
Le premier retire les fichiers que le plugin garde à côté de vos réglages
Claude (le niveau de la session, `crewcut.json`, la copie de la ligne de
statut et son drapeau, plus l'entrée `statusLine` quand elle pointe vers le
script de crewcut) ; le second retire le plugin lui-même. Depuis un shell, le
même nettoyage est `node <dossier du plugin>/hooks/crewcut.js uninstall`.

## Limites

- Les hooks ont besoin de `node` dans le PATH.
- Le niveau est stocké par utilisateur, donc les sessions simultanées le
  partagent.
- Les hooks, les niveaux, la revue, l'audit et le registre sont réservés à
  Claude Code ; les autres agents reçoivent le ruleset par `AGENTS.md`.
- Une session cloud (claude.ai/code) ne charge ni un plugin installé avec
  `/plugin`, ni un plugin qu'un dépôt active dans `.claude/settings.json`,
  et n'a pas de commande `/plugin`. L'installation de crewcut y est en
  cours de test.

## Crédits et licence

Inspiré de ponytail, de Dietrich Gebert. Licence MIT.
