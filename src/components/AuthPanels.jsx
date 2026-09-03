import { motion } from 'framer-motion'
import Banniere from './ui/Banniere'

/**
 * Connexion et inscription, en deux volets qui s'inversent.
 *
 * Le volet décoratif et le formulaire échangent leur place quand on passe d'un
 * mode à l'autre : c'est ce mouvement qui dit qu'on a changé de porte, plutôt
 * qu'un onglet qui s'allume. Les deux panneaux portent `layout` — framer-motion
 * anime alors leur déplacement par une transformation, sans redimensionner le
 * canevas WebGL qui se trouve dedans.
 *
 * Les réglages du « métal en fusion » ne sont pas recopiés ici : ils vivent
 * dans `ui/Banniere.jsx`, et ce volet est donc réglé comme les bandeaux de
 * l'accueil et des ressources.
 *
 * Sur téléphone, les deux volets s'empilent et l'inversion ne se voit pas —
 * c'est voulu : la place manque, et le mouvement n'y apporterait rien.
 */
const RESSORT = { type: 'spring', stiffness: 260, damping: 30 }

const ACCROCHES = {
  connexion: {
    titre: 'Content de te revoir',
    texte: 'Ta série, tes couronnes et ce qui te piège le plus t’attendent.',
  },
  inscription: {
    titre: 'Garde ce que tu apprends',
    texte:
      'Un compte suffit à retenir tes parties, ta série de jours et les pièges sur lesquels tu tombes.',
  },
}

export default function AuthPanels({ mode, children }) {
  const inscrire = mode === 'inscription'
  const accroche = ACCROCHES[mode] ?? ACCROCHES.connexion

  return (
    <div className="auth">
      <motion.div layout transition={RESSORT} className="auth__volet" style={{ order: inscrire ? 2 : 1 }}>
        <Banniere className="auth__decor">
          <p className="auth__eyebrow">CTRL INFO</p>
          <h2 className="auth__titre">{accroche.titre}</h2>
          <p className="auth__texte">{accroche.texte}</p>
        </Banniere>
      </motion.div>

      <motion.div layout transition={RESSORT} className="auth__volet" style={{ order: inscrire ? 1 : 2 }}>
        {children}
      </motion.div>
    </div>
  )
}
