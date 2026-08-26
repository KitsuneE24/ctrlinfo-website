# L'agent de génération de contenu

Le dossier `agent/` contient une chaîne **hors ligne** qui transforme des
articles de presse réels en jeu de cartes pour le fil d'actualité. Elle ne
tourne jamais dans le navigateur : on la lance à la main, elle écrit un fichier
JavaScript, et l'application le consomme comme n'importe quelle donnée.

Voir aussi [architecture.md](architecture.md) pour le reste du code.

## 1. Le principe qui gouverne tout

> **L'IA rédige. Les règles décident.**

Le modèle ne choisit jamais l'action attendue d'une publication (partager /
ignorer / signaler) ni son barème de points. Il produit uniquement de la
rédaction : la légende, l'explication pédagogique, les conséquences de chaque
choix. L'action et le score se déduisent ensuite de règles déterministes
([taxonomy.js](../agent/config/taxonomy.js)), à partir du type d'information et
de la fiabilité **déclarée par un humain** de la source
([sources.js](../agent/config/sources.js)).

Conséquence directe : un joueur ne peut pas être sanctionné à cause d'une
hésitation du modèle.

## 2. Les cinq étapes

```
1-collect ──> 2-real ──┐
   RSS         IA      ├──> 4-triage ──> 5-build ──> src/data/posts.generated.js
              3-fake ──┘     règles       écriture
                 IA
```

| Étape | Fichier | IA ? | Produit |
| --- | --- | --- | --- |
| 1 — Collecte | [1-collect.js](../agent/steps/1-collect.js) | non | `agent/out/1-items.json` |
| 2 — Vrais posts | [2-real.js](../agent/steps/2-real.js) | oui | `agent/out/2-real.json` |
| 3 — Faux posts | [3-fake.js](../agent/steps/3-fake.js) | oui | `agent/out/3-fake.json` |
| 4 — Tri | [4-triage.js](../agent/steps/4-triage.js) | non | `agent/out/4-deck.json` |
| 5 — Écriture | [5-build.js](../agent/steps/5-build.js) | non | `src/data/posts.generated.js` |

Chaque étape écrit son résultat sur disque et sait le relire : on peut donc en
relancer une seule sans refaire les précédentes.

### Étape 1 — Collecte

Lit les flux RSS de la whitelist, dédoublonne, filtre les articles inutilisables,
puis échantillonne selon `SCOPE_QUOTA` — **60 % Nouvelle-Calédonie, 25 % France,
15 % monde**. Si une zone n'a pas assez d'articles, le reste complète.

Le parseur RSS ([rss.js](../agent/lib/rss.js)) est écrit à la main : pas de
dépendance XML, il extrait titre, description, lien, image et date.

### Étape 2 — Les vrais posts

Pour chaque article, le modèle produit une légende, un `kind`, et toute la
pédagogie. Le `kind` est le cœur de la phase 1 :

| `kind` | Ce que c'est | Action attendue |
| --- | --- | --- |
| `service` | alerte météo, sécurité civile, santé publique | `share` |
| `factuel` | décision publique, économie, science, résultat vérifiable | `share` |
| `neutre` | vrai, mais fait divers / sport / people : rien à relayer | `ignore` |
| `encours` | vrai mais non stabilisé : enquête en cours, bilan provisoire | `ignore` |

C'est ce qui rend la phase 1 intéressante sans un seul faux post : **une
information peut être parfaitement vraie et ne pas mériter d'être relayée.**

Les données factuelles (source, date, lien, titre) viennent du flux, jamais du
modèle. Un garde-fou vérifie en plus que le texte généré ne contient aucun
chiffre absent de l'article d'origine (`findHallucinatedNumbers`) — sinon la
publication est rejetée.

### Étape 3 — Les faux posts (phase 2 seulement)

Chaque faux post est la déformation d'un article **réel** selon un biais imposé,
pris dans la taxonomie :

| Niveau | Biais |
| --- | --- |
| 1 — signaux grossiers | Urgence artificielle, Autorité inventée, Appel à la peur |
| 2 — plausible | Fausse corrélation, Biais de confirmation, Cherry picking |
| 3 — expert | Décontextualisation, Faux expert, Manipulation statistique |

Les articles utilisés ici sont retirés du lot des vrais posts, pour qu'un même
sujet n'apparaisse pas deux fois dans le fil. Les sujets calédoniens sont
privilégiés : un faux ancré localement est plus convaincant.

**Garde-fous** (`checkFakeSafety`) — on fabrique de la désinformation, elle doit
rester inoffensive hors du jeu. Un faux post est rejeté s'il :

- signe du nom d'un vrai média (`bannedOutletNames`) ;
- contient un conseil sanitaire actionnable (« arrêtez de prendre… ») ;
- désigne un groupe identifiable (ethnique, religieux, national) ;
- réutilise un nom propre de personne réelle tiré de l'article source.

Un refus du modèle est distingué d'une panne (`RefusalError`) : la chaîne passe à
l'article suivant au lieu de tout arrêter.

### Étape 4 — Tri et équilibrage

C'est ici que les règles décident. Le niveau d'un **vrai** post se déduit de son
`kind` et de la fiabilité de sa source :

- `service` → niveau 1 (évident, on partage) ;
- `factuel` → niveau 1 si la source est institutionnelle, sinon 2 ;
- `neutre` → niveau 2 (il faut résister au réflexe de partage) ;
- `encours` → niveau 3 (le cas le plus subtil du jeu).

Le niveau d'un **faux** post est celui de son biais.

Le deck final vise `POSTS_PER_LEVEL` (5) publications par niveau. L'actualité
réelle étant très majoritairement « neutre », le niveau 2 déborde et les niveaux
1 et 3 se vident : l'étape transfère donc le surplus, en poussant les faux vers
le haut et les vrais vers le bas. Chaque niveau garantit aussi au moins une
publication par action possible, pour qu'il ne se réduise jamais à « tout
signaler ».

### Étape 5 — Écriture

Écrit `src/data/posts.generated.js`, en-tête d'avertissement compris, plus un
export `meta` (phase, date, décompte). **`src/data/posts.js`, écrit à la main,
n'est jamais modifié** : c'est le filet de sécurité si une génération tourne mal.

## 3. Le contrat de données

Rien ne part vers `src/data/` sans passer par `validatePost()`
([schema.js](../agent/lib/schema.js)), appliqué deux fois — à l'étape 4 puis à
l'étape 5, qui annule le build en cas d'invalide.

Il vérifie la présence des 22 champs consommés par l'interface, mais aussi des
règles de cohérence :

- `texte` ≥ 40 caractères, `titre` ≥ 15 ;
- `correctAction` dans `share | ignore | report`, `level` dans `1 | 2 | 3` ;
- chaque `consequences.<action>` présente et > 20 caractères ;
- **la bonne action doit être celle qui rapporte le plus de points** ;
- un faux post porte un biais connu et ne signe pas d'un vrai média ;
- un vrai post ne porte aucun biais (`biais` commence par « Aucun ») ;
- les trois URL commencent par `http`.

⚠ Les clés de `BIASES` doivent correspondre **exactement** à celles de
`remediationPosts` dans [posts.js](../src/data/posts.js), sinon la remédiation du
fil ne se déclenche jamais.

## 4. Le modèle

[claude.js](../agent/lib/claude.js) enveloppe le SDK Anthropic. Sortie en
`json_schema`, trois tentatives avec attente croissante, et messages d'erreur
lisibles pour chaque panne (clé refusée, modèle introuvable, quota, réseau).

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | **requise**. `.env` en local, secret du dépôt en CI |
| `CLAUDE_MODEL` | `claude-opus-5` | modèle utilisé |
| `CLAUDE_EFFORT` | `medium` | profondeur de réflexion |

La clé n'est jamais manipulée par le code : le SDK la lit dans l'environnement.
`.env` est ignoré par git.

L'accès au modèle est vérifié **avant** de solliciter les flux RSS — inutile de
charger le réseau si la génération va échouer faute de clé.

## 5. Commandes

```bash
npm run agent                 # phase 1 : vrais posts uniquement
npm run agent:phase2          # phase 2 : vrais + faux posts
npm run agent -- --dry-run    # toute la chaîne, sans un seul appel au modèle
```

| Option | Défaut | Effet |
| --- | --- | --- |
| `--phase=1\|2` | 1 | phase de génération |
| `--limit=40` | 40 | articles RSS collectés |
| `--fake=9` | 9 | faux posts fabriqués (phase 2) |
| `--skip-collect` | — | réutilise `agent/out/1-items.json` |
| `--dry-run` | — | aucun appel au modèle, textes de remplissage |

Chaque étape est aussi lançable seule : `npm run agent:collect`, `agent:real`,
`agent:fake`, `agent:triage`, `agent:build`.

⚠ **`--dry-run` produit des textes marqués `[Brouillon sans IA]`, à ne jamais
publier.** Il sert à valider la chaîne (collecte → tri → build) sans dépenser
d'appel. Après un essai, supprime `src/data/posts.generated.js` pour revenir au
jeu écrit à la main.

## 6. Pannes courantes

| Symptôme | Cause probable |
| --- | --- |
| « clé API refusée » | `ANTHROPIC_API_KEY` absente ou périmée dans `.env` |
| « Aucun article récupéré » | réseau, ou une URL morte dans `sources.js` |
| « niveau N : 3/5 posts seulement » | pas assez de matière — augmente `--limit` |
| beaucoup de « rejeté : chiffres inventés » | le modèle brode — remonte `CLAUDE_EFFORT` |
| beaucoup de « rejeté » en phase 2 | les garde-fous font leur travail ; augmente `--fake` |
