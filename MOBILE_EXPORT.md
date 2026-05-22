# Rendre Alert NC disponible en ligne

Ce guide explique comment héberger l'application sur le web (accessible par un lien) et comment l'optimiser pour mobile.

---

## Déploiement en ligne (partage par lien)

La méthode la plus simple : compiler le projet et déposer le résultat sur un hébergeur gratuit.

```bash
npm run build   # génère le dossier dist/
```

**Hébergeurs gratuits recommandés :**

| Service | Commande de déploiement | Lien obtenu |
|---------|------------------------|-------------|
| **Vercel** | `npx vercel` | `https://alert-nc.vercel.app` |
| **Netlify** | `npx netlify deploy --prod --dir=dist` | `https://alert-nc.netlify.app` |
| **GitHub Pages** | Push + activer Pages dans les settings | `https://username.github.io/alert-nc` |

Une fois déployée, l'application est accessible depuis n'importe quel navigateur sur téléphone ou ordinateur — sans installation.

---

## Option A — PWA (recommandé : installable depuis le lien)

**Principe :** Ajouter un `manifest.json` et un service worker pour que les utilisateurs puissent installer l'application depuis leur navigateur, comme une app native — tout en restant accessible par lien.

**Étapes :**

```bash
npm install vite-plugin-pwa
```

Dans `vite.config.js` :

```js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Alert NC',
        short_name: 'Alert NC',
        start_url: '/',
        display: 'standalone',
        background_color: '#1800ad',
        theme_color: '#1800ad',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
}
```

Ajoute ensuite les icônes `public/icons/icon-192.png` et `public/icons/icon-512.png`.

**Ce que ça apporte :**
- L'utilisateur ouvre le lien dans Chrome (Android) ou Safari (iOS)
- Une bannière propose "Ajouter à l'écran d'accueil"
- L'app s'ouvre alors en plein écran, sans barre d'adresse, comme une vraie app
- Fonctionne aussi hors connexion si le service worker est configuré

**Contraintes :**
- Pas sur l'App Store ou Play Store
- Pas d'accès aux APIs natives avancées (notifications push limitées sur iOS)

**Idéal pour :** un projet scolaire, une démo partagée par lien, une présentation.

---

## Option B — Capacitor (pour publier sur les stores)

**Principe :** Capacitor encapsule l'application web dans une WebView native Android/iOS pour créer un vrai `.apk` ou `.ipa` publiable sur les stores.

**Étapes :**

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android   # pour Android
npx cap add ios       # pour iOS (Mac uniquement)

npm run build
npx cap sync
```

Ouvre ensuite dans **Android Studio** (`npx cap open android`) ou **Xcode** (`npx cap open ios`).

**Contraintes :**
- Android : nécessite Android Studio (Windows, Mac ou Linux)
- iOS : nécessite Xcode **et un Mac**
- Compte développeur Apple ($99/an) pour publier sur l'App Store

**Note :** Le composant `PhoneFrame` doit être désactivé dans l'app native (l'app est déjà sur un vrai téléphone) :

```jsx
import { Capacitor } from '@capacitor/core'

if (Capacitor.isNativePlatform()) return <>{children}</>
```

---

## Option C — React Native (refonte, non recommandé ici)

**Principe :** Réécrire toute l'interface en composants React Native (`View`, `Text`, `Image`) au lieu de HTML/CSS.

**Pourquoi non recommandé :**
- Tous les composants doivent être réécrits (`PostCard`, `Feed`, `Navbar`, `StartScreen`…)
- Le HTML, Tailwind CSS et Framer Motion ne fonctionnent pas dans React Native
- Réservé à des projets natifs de long terme

---

## Recommandation

- **Pour partager par lien (projet scolaire, démo) →** déploie sur Vercel ou Netlify, et ajoute une configuration **PWA** (Option A) pour que les utilisateurs puissent installer l'app depuis leur navigateur.
- **Pour publier sur les stores →** utilise **Capacitor** (Option B), sans réécriture du code.
