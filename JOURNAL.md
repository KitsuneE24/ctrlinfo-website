# CTRL INFO — Journal

Ce qui a changé dans le projet, et pourquoi. Le plus récent en haut.
Le fonctionnement actuel est décrit dans [SPEC.md](SPEC.md).

## Comment le tenir

À chaque changement notable, avant le commit :

1. ajouter **une ligne en haut** du mois en cours : date, ce qui change, et la
   raison si elle n'est pas évidente ;
2. mettre à jour la section concernée de `SPEC.md` ;
3. commiter le tout ensemble, avec un message `[Partie] Ce qui change`.

« Notable » : ce qu'un joueur, un éditeur ou une personne qui reprend le projet
remarquerait (une règle de jeu, un écran, une commande, un réglage, la
sécurité). Pas les retouches de style ni les corrections de faute.

Le détail de chaque modification reste dans git : `git log --oneline`, ou
`git log -p -- <fichier>` pour un fichier. **Ne jamais y écrire de secret**
(mot de passe, adresse réelle de l'admin, accès FTP).

## Octobre 2026

| Date | Changement |
| --- | --- |
| 28/10 | 17 faits ajoutés (57 en tout), chacun vérifié à la source : récifs et dugongs (UNESCO), mer de Corail, tortue verte, chant du cagou (Endemia), notou, superficie, indicatif, franc CFP, langues kanak, aires coutumières (ALK), Port-de-France, lavabo et hémisphère, lumière du Soleil, Grande Muraille, Apollo 11, mot de passe (CNIL) ; contenu refait, aucun fait plus de deux fois ; stockage local décrit dans la SPEC |
| 28/10 | Contenu fixe pour économiser les crédits Netlify : génération lancée à la main seulement, 160 posts (16 vrais et 16 faux par niveau) et 48 sujets de Messages ; dates des posts inventés recalculées le jour où l'on joue (`ilYa`) ; pas de déploiement si seuls doc, tests ou workflows changent |
| 28/10 | Netlify comme hébergeur : génération le lundi au lieu de chaque matin (plan gratuit à 300 crédits, 15 par déploiement), fichiers à nom unique en cache un an, `.htaccess` retiré du build Netlify, mentions : Netlify, Inc. et transfert vers les États-Unis (Data Privacy Framework) |
| 28/10 | Doc : SPEC à jour (pièges, arnaques, tests, ajout d'un fait pas à pas, § 11 « Reprendre le projet ») |
| 28/10 | Mentions légales : éditeur non professionnel (LCEN) au lieu de « sans éditeur », déclaration d'accessibilité (chrono = limite essentielle, RGAA 13.1), génération quotidienne sans IA (modèles et code écrits avec l'aide d'un assistant d'IA, dit en toutes lettres), noms inventés vérifiés, crédits photos remis ; Planké = visuels du projet |
| 28/10 | Ressources : catégorie « Se protéger des arnaques » (Cybermalveillance, Pharos), Météo-France NC et Endemia ; sources françaises pour l'image de l'Australie (Futura-Sciences) et le requin (Slate) ; 6 faits sur des sources premières (Endemia, gouv.nc) |
| 28/10 | Accessibilité : lien « Aller au contenu », zones défilantes du post et des Messages au clavier, fond WebGL et cagou immobiles si « réduire les animations », chrono annoncé au dernier tiers, focus visible de la recherche ; « Ton code » et « Recopie-le » vouvoyés |
| 28/10 | Tests : 75 tests unitaires (code de sauvegarde, tirage, stockage, générateur, contenu) et 34 de bout en bout sur mobile et ordinateur, avec contrôle axe WCAG 2.2 AA de chaque écran ; lancés par le workflow « Contrôles » (ex-« Sécurité ») et avant chaque envoi du matin |
| 28/10 | Générateur : 9 nouveaux procédés tirés des Ressources (décontextualisation, clic, satire, voix truquée, halo, répétition, complotisme, témoignages triés) et 7 arnaques 2026, au moins 2 par niveau, une par contact dans les Messages avec leur propre déroulé ; un fait déformé par niveau (2 dès le niveau 3) ; procédés réservés aux faits qui s'y prêtent (fini « le Grand Nouméa… : ce n'est qu'un début ») ; posts d'entraînement créés seuls pour chaque procédé ; articles des rubriques Sciences, Environnement et Éducation de The Conversation |
| 28/10 | Données : domaines réels retirés des posts d'entraînement (`santeplusmag.fr`, `chiffresclairs.fr`), « Dr Robert Lévy » renommé, pseudo `sam_974` (La Réunion) devenu `sam_988` |
| 28/10 | Sécurité : posts du jour jamais mis en cache, chemin d'exemple du `.htpasswd` refusé au build ; images : poids divisé par deux (14 → 7 Mo), métadonnées retirées, `npm run images` ; fins de ligne LF (`.gitattributes`), Node 24 exigé, version 1.0.0 |
| 28/10 | Confidentialité : IP du journal hachées avec un sel secret, journal borné à 1 Mo et valeurs du client tronquées, erreurs PHP et versions du serveur masquées, plus aucun chemin secret ni hôte d'envoi dans les sorties du build et du workflow ; 5 règles d'audit |
| 28/10 | Posts plus longs et plus naturels : chaque voix raconte d'où vient l'info, interpelle ses abonnés et cite sa source dans une phrase (plus de « Source : ») ; commentaires selon le sujet, le lieu (`scenarios[].lieu`), la façon d'écrire du compte et le fait corrigé ; correction en une seule couleur par post (rouge faux, bleu vrai) ; sources des 40 faits relues : roussette, baleines, distance de l'Australie, sens des cyclones corrigés, population au recensement 2025 |
| 28/10 | Sécurité : l'ancienne adresse d'exemple de l'admin (dans l'historique git) est refusée comme les autres ; l'audit signale un `.htpasswd` resté au chemin de l'exemple |
| 28/10 | Accessibilité : Lighthouse 100/100 sur les 8 écrans (zone `<main>`, libellés qui reprennent le texte visible, titres h1 › h2 › h3) ; contrastes AA vérifiés sur tous les couples texte/fond ; étiquettes à 12 px minimum ; avatar de la démonstration en gris pour ne pas se confondre avec les repères |
| 28/10 | Règles des jeux en démonstration : maquette du fil ou des Messages avec repères numérotés, comme la correction, et la liste des actions (textes dans `jeux[].demonstration`) |
| 28/10 | Ressources revues chapitre par chapitre : chaque chiffre et cas vérifié à la source (5 erreurs corrigées), cas calédoniens sans personne nommée, aucun sujet sensible, actions en gras (`**…**`), source sous chaque cas, liens non vérifiés retirés ; astuces et stories alignées |
| 27/10 | Admin retirée du build si son adresse n'est pas choisie (`admin`, `A-CHOISIR` ou moins de 12 caractères) : l'adresse de l'exemple était publique et devinable ; alerte ajoutée à l'audit |
| 27/10 | Journal sorti de `SPEC.md` dans ce fichier ; architecture réexpliquée en 3 étapes |
| 27/10 | Doc réduite à `SPEC.md` ; README limité à l'essentiel |
| 27/10 | Images servies par le site seulement (CSP `img-src 'self'`), image externe refusée par `npm run verifier` : l'IP des joueurs n'est plus transmise aux médias |
| 27/10 | Tirets cadratins retirés ; le cagou tutoie, répliques variées par page et par jeu, réagit aussi dans les Messages |
| 27/10 | Fil mélangé : médias inventés pour les vrais comme pour les faux, commentaires liés au sujet, commentaires trompeurs dès le niveau 3 |
| 27/10 | Photos libres (Wikimedia Commons) pour les 40 faits et les 40 événements, sur environ deux posts sur trois ; crédit dans la correction et les mentions légales |
| 27/10 | Voix par type de compte (ado, parent, ancien, page de quiz, alarmiste…), les mêmes pour vrais et faux ; source surtout dans la correction |
| 27/10 | Fil plus varié : au plus 2 articles par lot, pages ordinaires qui publient vrais et faux ; anciennes fabrications du navigateur effacées |
| 27/10 | Fil mixte : environ un tiers d'articles, vrais (The Conversation, CNIL, licence CC BY-ND, titre intact) et faux (médias inventés) à parts égales |
| 27/10 | **Nouvelle mécanique, sans contenu de média** : la récolte RSS est remplacée par un générateur (`npm run generer`) à partir de 40 faits vérifiables et 40 événements inventés ; autant de vrais que de faux par niveau ; conversations écrites à la main retirées |
| 27/10 | Messagerie par contact (8 contacts) avec « Nouveau sujet » par lots de 10 ; « Recommencer » retiré |
| 27/10 | Audit de sécurité, workflow « Sécurité », Dependabot ; fabrications du navigateur relues au chargement |
| 27/10 | Récolte quotidienne sans surveillance : garde-fous, vérification, envoi SFTP/FTPS |
| 27/10 | « Continuer à jouer » : contenu fabriqué dans le navigateur quand tout est vu |
| 27/10 | Fil sans fin : difficulté qui ne redescend pas, chrono au temps de lecture |
| 27/10 | Mentions légales, polices locales ; Docker et export retirés |
| 27/10 | Vouvoiement du joueur, vocabulaire commun (post, fake news, noms des onglets) |
| 19-20/10 | Styles réunis en jetons et motifs communs (sans Tailwind ni framer-motion) ; accueil en tableau d'enquête, brève du jour et stories ; fiches « Comprendre » en dossiers d'enquête |

## Avant octobre 2026

Résumé des étapes, tiré de l'historique git.

| Période | Changement |
| --- | --- |
| Septembre 2026 | Compte joueur remplacé par un code de sauvegarde ; administration avec enregistrement en ligne ; compagnon cagou et ses bulles ; une publication à la fois avec chrono par niveau ; profil (avatar, série de jours) |
| Début septembre 2026 | Une adresse par écran (react-router) ; lisibilité : échelle typographique, contrastes AA ; écran de départ des jeux |
| Fin août 2026 | Onglet « Comprendre » et ses 8 chapitres ; une seule barre d'onglets, galerie de jeux retirée |
| Août 2026 | Interface mobile d'abord avec jetons CSS ; fil d'actualité refait ; feuille de style découpée |
| Juin 2026 | Couleurs de la marque centralisées ; fenêtre de jeu en coque de téléphone |
| Mai 2026 | Création du projet, premiers posts, écran de départ |
