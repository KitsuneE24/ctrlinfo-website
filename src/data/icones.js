import {
  Banknote,
  Brain,
  Eye,
  Filter,
  HelpCircle,
  Layers,
  Lightbulb,
  MessagesSquare,
  MousePointerClick,
  Newspaper,
  Search,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'

/**
 * Le seul « contenu » qui reste dans ce dépôt, et ce n'en est pas vraiment :
 * les icônes.
 *
 * La base stocke un **nom** d'icône (« Newspaper »), pas un dessin. Le dessin
 * est du code — un composant React — et n'a rien à faire dans une table. Ce
 * fichier fait la jonction entre les deux, pour les jeux comme pour les
 * chapitres de « Comprendre ».
 *
 * Pour utiliser une nouvelle icône, l'importer ici et écrire son nom dans la
 * base : sans cette entrée, l'écran affiche un point d'interrogation plutôt
 * que de casser.
 */
const ICONES = {
  Banknote,
  Brain,
  Eye,
  Filter,
  Layers,
  Lightbulb,
  MessagesSquare,
  MousePointerClick,
  Newspaper,
  Search,
  Sparkles,
  Target,
  Zap,
}

export function icone(nom) {
  return ICONES[nom] ?? HelpCircle
}
