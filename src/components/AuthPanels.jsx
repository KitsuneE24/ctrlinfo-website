import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Banniere from './ui/Banniere'

/**
 * Connexion et inscription, sur un même cadre.
 *
 * Le métal en fusion est **une seule surface**, qui passe **devant** le
 * formulaire — comme un rideau. Elle porte son accroche, donc rien ne peut se
 * désynchroniser : un seul élément se déplace, et un seul contexte WebGL est
 * ouvert.
 *
 * Le formulaire, lui, change de côté **à mi-course**, pendant qu'il est
 * couvert. C'est ce qui fait la transition : on ne le voit jamais sauter, il
 * est déjà à sa nouvelle place quand le rideau le découvre.
 *
 * Les boutons restent au-dessus du rideau : ce sont les deux portes, elles ne
 * bougent pas — c'est le métal qui passe de l'une à l'autre.
 *
 * Les réglages du métal ne sont pas recopiés ici : ils vivent dans
 * `ui/Banniere.jsx`, et cette surface est donc réglée comme les bandeaux de
 * l'accueil et des ressources.
 */
const COURSE_MS = 620

// Une courbe sans rebond : un rideau qui dépasse puis revient ne ressemble
// plus à une transition de page.
const GLISSEMENT = { type: 'tween', duration: COURSE_MS / 1000, ease: [0.65, 0, 0.35, 1] }

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
  // Ce que le rideau a déjà découvert. En retard d'une demi-course sur `mode`.
  const [decouvert, setDecouvert] = useState(mode)

  useEffect(() => {
    const minuteur = setTimeout(() => setDecouvert(mode), COURSE_MS / 2)
    return () => clearTimeout(minuteur)
  }, [mode])

  const inscrire = mode === 'inscription'
  const accroche = ACCROCHES[decouvert] ?? ACCROCHES.connexion

  return (
    <div className="auth" data-mode={mode} data-decouvert={decouvert}>
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

        <div className="auth__forme">{children}</div>
      </div>

      {/* Le rideau, par-dessus le formulaire et sous les portes. */}
      <motion.div
        animate={{ x: inscrire ? '0%' : '100%' }}
        transition={GLISSEMENT}
        className="auth__metal"
      >
        <Banniere className="auth__fond" />
        <motion.div
          // La clé refait l'apparition : l'accroche se substitue en fondu
          // plutôt que de changer d'un coup au milieu du mouvement.
          key={decouvert}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="auth__accroche"
        >
          <p className="auth__eyebrow">CTRL INFO</p>
          <h2 className="auth__titre">{accroche.titre}</h2>
          <p className="auth__texte">{accroche.texte}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
