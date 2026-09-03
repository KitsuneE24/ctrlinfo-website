import { motion } from 'framer-motion'
import Banniere from './ui/Banniere'

/**
 * Connexion et inscription, sur un même cadre.
 *
 *   ┌══════════════┬──────────────┐
 *   ║ Créer compte ║ Se connecter │   la porte active est dans le métal
 *   ║              ╫──────────────┤
 *   ║   accroche   ║  formulaire  │   le métal descend sous sa porte
 *   └══════════════┴──────────────┘
 *
 * Le métal en fusion est **une seule surface**, posée derrière la colonne
 * active — bouton compris. Elle glisse d'un bord à l'autre quand on change de
 * porte : un seul élément qui bouge, donc un mouvement qui ne peut pas se
 * désynchroniser. C'est aussi un seul contexte WebGL, là où deux panneaux
 * séparés en auraient demandé deux.
 *
 * Ce qui est posé par-dessus suit le même ressort : l'accroche et le
 * formulaire changent de colonne avec `layout`. La colonne de chacun est
 * décidée en CSS depuis `data-mode`, et non par un style en ligne — sinon la
 * disposition empilée du téléphone ne pourrait plus la reprendre.
 *
 * Les réglages du métal ne sont pas recopiés ici : ils vivent dans
 * `ui/Banniere.jsx`, et cette surface est donc réglée comme les bandeaux de
 * l'accueil et des ressources.
 */
const RESSORT = { type: 'spring', stiffness: 120, damping: 22, mass: 1.1 }

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

export default function AuthPanels({ mode, onMode, children }) {
  const inscrire = mode === 'inscription'
  const accroche = ACCROCHES[mode] ?? ACCROCHES.connexion

  return (
    <div className="auth" data-mode={mode}>
      {/* La surface de métal, derrière tout le reste. Le formulaire est opaque
          et la recouvre : elle ne se voit que sous la porte active. */}
      <motion.div
        aria-hidden="true"
        animate={{ x: inscrire ? '0%' : '100%' }}
        transition={RESSORT}
        className="auth__metal"
      >
        <Banniere className="auth__fond" />
      </motion.div>

      <div className="auth__grille">
        <button
          type="button"
          onClick={() => onMode('inscription')}
          aria-pressed={inscrire}
          className={`auth__porte auth__porte--gauche${
            inscrire ? ' auth__porte--actif' : ''
          }`}
        >
          Créer un compte
        </button>
        <button
          type="button"
          onClick={() => onMode('connexion')}
          aria-pressed={!inscrire}
          className={`auth__porte auth__porte--droite${
            !inscrire ? ' auth__porte--actif' : ''
          }`}
        >
          Se connecter
        </button>

        <motion.div layout transition={RESSORT} className="auth__accroche">
          <p className="auth__eyebrow">CTRL INFO</p>
          <h2 className="auth__titre">{accroche.titre}</h2>
          <p className="auth__texte">{accroche.texte}</p>
        </motion.div>

        <motion.div layout transition={RESSORT} className="auth__forme">
          {children}
        </motion.div>
      </div>
    </div>
  )
}
