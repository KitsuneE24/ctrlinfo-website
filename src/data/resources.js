import { brand } from '../styles/colors'

// Ressources de l'onglet « Ressources ». Liste volontairement courte et
// éditable : ajouter une entrée suffit à la faire apparaître dans l'écran.
export const CATEGORIES = ['Tout', 'Vérifier une info', 'Vérifier une image', 'Comprendre']

const resources = [
  {
    id: 'decodeurs',
    titre: 'Les Décodeurs',
    editeur: 'Le Monde',
    categorie: 'Vérifier une info',
    description:
      "Cellule de vérification qui décortique les affirmations qui circulent, avec le détail de la méthode employée.",
    url: 'https://www.lemonde.fr/les-decodeurs/',
    color: brand.blue,
  },
  {
    id: 'afp-factuel',
    titre: 'AFP Factuel',
    editeur: 'Agence France-Presse',
    categorie: 'Vérifier une info',
    description:
      "Les vérifications de l'AFP, souvent les premières à traiter les rumeurs qui tournent sur les réseaux.",
    url: 'https://factuel.afp.com/',
    color: brand.magenta,
  },
  {
    id: 'checknews',
    titre: 'CheckNews',
    editeur: 'Libération',
    categorie: 'Vérifier une info',
    description:
      'Tu poses une question, des journalistes y répondent publiquement en montrant leurs sources.',
    url: 'https://www.liberation.fr/checknews/',
    color: brand.magentaLight,
  },
  {
    id: 'vrai-ou-faux',
    titre: 'Vrai ou Faux',
    editeur: 'franceinfo',
    categorie: 'Vérifier une info',
    description:
      "Format court qui reprend les affirmations les plus partagées du moment et les confronte aux faits.",
    url: 'https://www.francetvinfo.fr/vrai-ou-fake/',
    color: brand.blue,
  },
  {
    id: 'image-inversee',
    titre: "Recherche d'image inversée",
    editeur: 'Google Images',
    categorie: 'Vérifier une image',
    description:
      "Retrouve où une photo est déjà apparue. Le réflexe le plus efficace contre les images anciennes republiées comme récentes.",
    url: 'https://images.google.com/',
    color: brand.magenta,
  },
  {
    id: 'tineye',
    titre: 'TinEye',
    editeur: 'TinEye',
    categorie: 'Vérifier une image',
    description:
      "Moteur de recherche d'images qui affiche la plus ancienne occurrence connue d'une photo.",
    url: 'https://tineye.com/',
    color: brand.magentaLight,
  },
  {
    id: 'clemi',
    titre: 'CLEMI',
    editeur: 'Éducation nationale',
    categorie: 'Comprendre',
    description:
      "Ressources pédagogiques sur l'éducation aux médias, pensées pour la classe comme pour l'auto-formation.",
    url: 'https://www.clemi.fr/',
    color: brand.blue,
  },
  {
    id: 'educnum',
    titre: 'Educnum',
    editeur: 'CNIL',
    categorie: 'Comprendre',
    description:
      'Guides sur les usages numériques : données personnelles, algorithmes de recommandation, réseaux sociaux.',
    url: 'https://www.educnum.fr/',
    color: brand.magenta,
  },
]

export default resources
