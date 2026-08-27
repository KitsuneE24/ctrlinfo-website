import {
  Banknote,
  Brain,
  Eye,
  Filter,
  Layers,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'

/**
 * Le contenu de l'onglet « Comprendre », écrit une seule fois ici.
 *
 * L'écran (LearnScreen.jsx) ne fait que composer ces listes : il n'y a aucun
 * texte de fond dans le JSX. Pour retoucher une explication, c'est ce fichier
 * et lui seul.
 *
 * `CHAPITRES` ne porte que les en-têtes — numéro, titre, chapô, icône. C'est
 * lui qui fixe l'ordre des sections et celui du sommaire, les deux lisant la
 * même liste. Les blocs de chaque chapitre sont exportés à part, sous leur
 * propre nom, parce qu'ils n'ont pas tous la même forme.
 */

export const CHAPITRES = [
  {
    id: 'familles',
    numero: '01',
    Icon: Layers,
    onglet: 'Les 4 familles',
    titre: 'Quatre familles de fausses infos',
    chapo:
      "« Fake news » veut dire « fausse nouvelle ». Mais sous ce mot unique se cachent quatre choses très différentes — et on ne se protège pas de la même façon contre chacune.",
  },
  {
    id: 'argent',
    numero: '02',
    Icon: Banknote,
    onglet: "L'argent derrière",
    titre: "L'argent derrière la désinformation",
    chapo:
      "On imagine des militants ou des illuminés. La réalité est plus terre à terre : fabriquer de la fausse info est un commerce, rentable, et parfaitement légal.",
  },
  {
    id: 'propagation',
    numero: '03',
    Icon: Zap,
    onglet: 'Pourquoi ça circule',
    titre: 'Pourquoi ça circule aussi vite',
    chapo:
      "Une fausse info ne voyage pas toute seule. Deux choses la portent : des images qui semblent parler d'elles-mêmes, et des gens qui partagent avant d'avoir fini de lire.",
  },
  {
    id: 'reflexe',
    numero: '04',
    Icon: Search,
    onglet: 'Le réflexe',
    titre: 'Le réflexe qui protège',
    chapo:
      "Il n'existe pas de recette magique. Il existe un réflexe, aussi simple que regarder des deux côtés avant de traverser. Dix secondes, quatre questions.",
  },
  {
    id: 'complot',
    numero: '05',
    Icon: Eye,
    onglet: 'Le complotisme',
    titre: 'Reconnaître un discours complotiste',
    chapo:
      "L'idée qu'un petit groupe puissant cache la vérité au reste du monde est très ancienne, bien antérieure à internet. Les réseaux lui ont seulement donné des ailes.",
  },
  {
    id: 'bulle',
    numero: '06',
    Icon: Filter,
    onglet: 'Ta bulle',
    titre: 'La bulle qui te suit partout',
    chapo:
      "Deux personnes qui tapent la même recherche n'obtiennent pas les mêmes résultats. Ce que tu vois en premier a été choisi — pour toi, et pas au hasard.",
  },
  {
    id: 'biais',
    numero: '07',
    Icon: Brain,
    onglet: 'Les biais',
    titre: 'Les raccourcis de ton cerveau',
    chapo:
      "La désinformation n'invente presque rien : elle appuie sur des raccourcis que notre cerveau prend tout seul, tous les jours. Les connaître, c'est déjà les désamorcer.",
  },
  {
    id: 'cas',
    numero: '08',
    Icon: Sparkles,
    onglet: 'Histoires vraies',
    titre: 'Quatre rumeurs devenues célèbres',
    chapo:
      "La théorie s'oublie, les histoires restent. Quatre rumeurs qui ont réellement circulé, et ce que chacune apprend.",
  },
]

/* --- 01. Les quatre familles -------------------------------------------- */

/** `exemple` est un cas réel ; `piege`, la formule type à reconnaître. */
export const FAMILLES = [
  {
    id: 'inventee',
    titre: 'Inventée de toutes pièces',
    texte:
      "Un fait, un chiffre, une photo retouchée : tout est fabriqué au départ. C'est la famille la plus facile à démonter… quand on prend la peine de chercher.",
    exemple:
      "Septembre 2017, l'ouragan Irma vient de ravager Saint-Martin. Des sites annoncent que la sous-préfète de l'île s'est enfuie en pleine catastrophe. Elle n'a jamais quitté l'île — l'information a fait le tour du web quand même.",
  },
  {
    id: 'contexte',
    titre: 'Sortie de son contexte',
    texte:
      "L'image est authentique, la vidéo aussi. C'est la date, le lieu ou la légende qu'on a changés. La plus redoutable des quatre, parce que rien n'y est techniquement faux.",
    exemple:
      "2017, jour du référendum en Catalogne. Une vidéo montrant un policier frapper des passants circule sous le titre « la police espagnole attaque les Catalans ». Les images dataient de 2012 et n'avaient aucun rapport.",
  },
  {
    id: 'clics',
    titre: 'Fabriquée pour le clic',
    texte:
      "Des titres énormes, écrits pour une seule raison : te faire cliquer. Chaque visite rapporte de la publicité à celui qui a publié.",
    piege:
      "« Ce remède miracle que les médecins vous cachent », « vous ne devinerez jamais la suite »… Plus un titre promet un choc, moins il tient sa promesse.",
  },
  {
    id: 'satire',
    titre: 'Drôle au départ',
    texte:
      "Le Gorafi et les autres sites satiriques inventent pour faire rire, et le disent clairement. Le problème n'est jamais le site : c'est le partage où le second degré s'est perdu en route.",
  },
]

/* --- 02. L'argent -------------------------------------------------------- */

export const CHIFFRES = [
  {
    valeur: '2,6 Md$',
    texte:
      'de recettes publicitaires par an, dans le monde, pour les sites de fausses informations.',
  },
  {
    valeur: '200 000 €',
    texte:
      "par mois pour un seul site américain d'infox, grâce à 50 millions de pages vues.",
  },
  {
    valeur: '300 000 €',
    texte:
      'récoltés par un documentaire trompeur sur le Covid, versés par 10 000 donateurs.',
  },
]

export const ROUAGES = [
  "Plus de visiteurs, c'est plus de publicités affichées, donc plus d'argent. Un titre choc n'est pas une maladresse : c'est un investissement.",
  "Des « fermes à clics » — de vraies entreprises, avec de vrais salariés — fabriquent et recopient de la fausse info à la chaîne, à longueur de journée.",
  'Les régies publicitaires placent automatiquement des annonces de grandes marques sur ces pages. Beaucoup de marques les financent sans le savoir.',
  'Le financement participatif fait le reste : quelques milliers de donateurs convaincus suffisent à lancer une production entière.',
]

/* --- 03. La propagation -------------------------------------------------- */

export const MOTEURS = [
  {
    id: 'images',
    titre: 'Le pouvoir des images',
    texte:
      "Une photo semble toujours plus vraie qu'une phrase. C'est exactement pour ça qu'elle est l'outil numéro un de la désinformation : elle frappe, elle marque, et elle se partage avant d'être lue.",
    conseil:
      "Une image peut être authentique à 100 % et raconter un mensonge complet. Il suffit d'une mauvaise date, d'un mauvais lieu, d'une légende bien tournée. Cherche d'où elle vient avant de la croire.",
  },
  {
    id: 'emotion',
    titre: "L'émotion fait le reste",
    texte:
      "Ce n'est pas la fausse info qui circule, ce sont les gens qui la relaient. Et ce qui se relaie le plus vite n'est pas ce qui est vrai : c'est ce qui fait réagir fort — indignation, peur, dégoût, fierté.",
    conseil:
      "L'envie de partager tout de suite est le meilleur signal d'alarme qui existe. Quand elle arrive, c'est précisément le moment de s'accorder dix secondes.",
  },
]

/* --- 04. Le réflexe ------------------------------------------------------ */

export const QUESTIONS = [
  {
    question: 'Qui parle ?',
    texte:
      "Un média que tu connais, avec une rédaction, une adresse, des journalistes qui signent ? Ou un compte anonyme et un site que tu n'avais jamais vu avant aujourd'hui ?",
  },
  {
    question: 'Qui d’autre le dit ?',
    texte:
      'Une information vraie et importante est reprise par plusieurs rédactions sérieuses. Si un seul site en parle, tu tiens déjà une bonne partie de la réponse.',
  },
  {
    question: 'Fait, opinion, rumeur ou blague ?',
    texte:
      "Un fait se vérifie (« il a plu hier »). Une opinion s'assume (« ce film est nul »). Une rumeur ne s'appuie sur rien de contrôlable. Les confondre, c'est là que tout commence.",
  },
  {
    question: 'Et moi, comment je réagis ?',
    texte:
      "Si tu sens la colère monter avant d'avoir fini de lire, ralentis. C'est exactement à cet endroit que le piège se referme.",
  },
]

export const OUTILS_DE_VERIF = [
  {
    id: 'image-inversee',
    titre: "La recherche d'image inversée",
    texte:
      "Elle consiste à demander à un moteur de recherche où une image est déjà apparue avant. Tu récupères sa vraie date, son vrai lieu, son vrai sujet. C'est le premier geste des journalistes qui vérifient.",
    encadre:
      "Une classe a un jour enquêté sur une rumeur de crocodiles échappés du zoo de Vincennes. En remontant la piste, les élèves ont trouvé l'origine de l'histoire. Même la rumeur la plus improbable se vérifie, avec un peu de méthode.",
  },
  {
    id: 'fact-checking',
    titre: 'Le fact-checking',
    texte:
      "« Vérification des faits ». Des journalistes en ont fait leur métier : ils passent au crible les déclarations publiques et les contenus qui circulent. En France, plusieurs rédactions y consacrent une rubrique entière — Désintox, CheckNews, Vrai ou Faux.",
    encadre:
      "Devant une déclaration choc, tape simplement « [le sujet] + fact check ». Il y a de bonnes chances que le travail soit déjà fait, sources à l'appui.",
  },
]

/* --- 05. Le complotisme -------------------------------------------------- */

export const SIGNAUX = [
  {
    titre: '« On nous cache la vérité »',
    texte:
      "L'affirmation revient sans cesse, la preuve vérifiable ne vient jamais. Le secret sert d'explication à l'absence de preuve.",
  },
  {
    titre: 'Le hasard est interdit',
    texte:
      "Aucune coïncidence n'est admise : tout aurait forcément été voulu, prévu, organisé par quelqu'un.",
  },
  {
    titre: 'Toute objection devient une preuve',
    texte:
      "« C'est justement ce qu'ils veulent te faire croire. » Un démenti ne réfute plus rien : il confirme.",
  },
  {
    titre: 'Un « eux » qu’on ne nomme jamais',
    texte:
      "Le gouvernement, les médias, les scientifiques, les élites… un ennemi flou et tout-puissant, face à un « nous » qui aurait compris.",
  },
]

/* --- 06. La bulle de filtre ---------------------------------------------- */

export const BULLE = {
  paragraphes: [
    "Quand tu cherches sur Google ou que tu fais défiler un réseau social, un algorithme classe ce qu'il te montre selon ce que tu as déjà aimé, cliqué, regardé jusqu'au bout. Ton voisin, avec les mêmes mots-clés, ne verra pas la même chose que toi.",
    "Cet algorithme ne cherche pas à t'informer : il cherche à te garder. Et rien ne retient mieux qu'un contenu qui te donne raison. À force, ton fil finit par ressembler à un miroir — c'est ce qu'on appelle une bulle de filtre.",
  ],
  conseil:
    "Ce qui arrive en haut de ton fil n'est pas « l'actualité » : c'est une sélection faite pour toi. Va chercher volontairement ailleurs, chez un autre média, chez quelqu'un qui ne pense pas comme toi.",
}

/* --- 07. Les biais ------------------------------------------------------- */

export const BIAIS = [
  {
    nom: "Biais d'intentionnalité",
    pensee: '« Quelqu’un a forcément voulu que ça arrive. »',
    exploitation:
      'Faire passer un événement pour orchestré, planifié, décidé quelque part.',
    reflexe: "Chercher d'abord les explications ordinaires.",
  },
  {
    nom: 'Biais de proportionnalité',
    pensee: '« Un événement énorme doit avoir une cause énorme. »',
    exploitation:
      'Proposer une cause spectaculaire ou secrète là où une explication banale suffirait.',
    reflexe: "Une grande conséquence n'exige pas une grande cause.",
  },
  {
    nom: 'Effet de halo',
    pensee: '« Cette personne a l’air compétente, donc elle a raison. »',
    exploitation:
      "S'appuyer sur une célébrité, un charisme ou un titre pour faire accepter une affirmation douteuse.",
    reflexe: "Juger l'affirmation, pas la personne qui la porte.",
  },
  {
    nom: 'Corrélation illusoire',
    pensee: '« Ces deux choses arrivent ensemble, donc l’une cause l’autre. »',
    exploitation:
      'Rapprocher deux événements simultanés et laisser le lecteur conclure tout seul.',
    reflexe: 'Se demander : lien réel, ou simple coïncidence ?',
  },
  {
    nom: 'Effet de vérité illusoire',
    pensee: '« Je l’ai déjà entendu, donc c’est sûrement vrai. »',
    exploitation:
      "Répéter une affirmation fausse jusqu'à ce qu'elle devienne familière.",
    reflexe: "La répétition n'est pas une preuve. Remonter à la source.",
  },
  {
    nom: 'Effet Dunning-Kruger',
    pensee: '« J’en sais assez pour voir que les experts se trompent. »',
    exploitation:
      'Donner une illusion de maîtrise, et discréditer au passage ceux qui savent.',
    reflexe: "Mesurer ce qu'on ignore avant de trancher.",
  },
]

/* --- 08. Les cas réels --------------------------------------------------- */

export const CAS = [
  {
    id: 'tigre',
    annee: '2014',
    titre: 'Le tigre de Seine-et-Marne',
    texte:
      "Un témoin affirme avoir vu un tigre sur le parking d'un supermarché. Des photos floues circulent, la battue s'organise, la région retient son souffle. Aucun tigre n'a jamais été retrouvé : selon les experts, il s'agissait très probablement d'un gros chat.",
    lecon:
      "Devant une image de mauvaise qualité, ton cerveau termine le travail — et il choisit rarement l'hypothèse la plus banale.",
  },
  {
    id: 'pesquet',
    annee: 'Rumeur en ligne',
    titre: 'Le selfie de Thomas Pesquet',
    texte:
      "Une rumeur affirme que le selfie pris dans l'espace par l'astronaute français est truqué. Un grand classique des théories sur la conquête spatiale : dès qu'une image vient de l'espace, elle aurait été fabriquée en studio.",
    lecon:
      "Douter de tout par principe n'est pas de l'esprit critique. Douter, c'est aller vérifier — pas refuser d'avance.",
  },
  {
    id: 'crocodiles',
    annee: 'Rumeur locale',
    titre: 'Les crocodiles du zoo de Vincennes',
    texte:
      "Des crocodiles se seraient échappés du zoo. L'histoire circule, s'amplifie, change de version au passage. Une classe l'a prise comme sujet d'enquête et a remonté la rumeur jusqu'à son point de départ.",
    lecon:
      'Retrouver la toute première publication suffit très souvent à faire tomber une rumeur entière.',
  },
  {
    id: 'riz',
    annee: 'Rumeur mondiale',
    titre: 'Le riz en plastique',
    texte:
      "Du riz serait fabriqué en plastique, puis vendu en supermarché. Des vidéos « preuves » tournent dans le monde entier. Une classe de Guyane a mené la vérification de bout en bout.",
    lecon:
      "Une vidéo ne prouve rien tant qu'on ne sait pas qui l'a filmée, où, et quand.",
  },
]
