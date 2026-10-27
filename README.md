# CTRL INFO

Jeu web de sensibilisation à la désinformation pour la Nouvelle-Calédonie.
Site statique React 19 + Vite, sans compte ni donnée personnelle.

**Toute la documentation est dans [SPEC.md](SPEC.md)**, l'historique dans [JOURNAL.md](JOURNAL.md).

## Démarrer

Node.js 24 requis.

```bash
npm ci          # installe les dépendances
npm run dev     # http://localhost:5173
```

| Commande | Rôle |
| --- | --- |
| `npm run build` | site de production dans `dist/` |
| `npm run lint` | vérifie le code |
| `npm run verifier` | vérifie le contenu |
| `npm run audit:securite` | contrôles de sécurité |
| `npm run generer` | génère les posts et les sujets (`--essai` : n'écrit rien) |

## Contenu

Tous les textes sont dans `public/donnees/` et se modifient sans toucher au
code. Règles et procédures : [SPEC.md](SPEC.md), § 5.
