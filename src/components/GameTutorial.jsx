import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'

/**
 * Tutoriel d'un jeu : un carrousel de trois volets — le but, les actions, le
 * pourquoi. Les contenus viennent de l'API (table `volet_tutoriel`), chargés
 * avec les jeux ; seule l'icône est rattachée ici, côté front.
 *
 * Il se traverse au clavier (flèches, Échap), au doigt (glissement) ou au
 * bouton.
 */
export default function GameTutorial({ jeu, onClose }) {
  const volets = jeu.tuto ?? []
  const [index, setIndex] = useState(0)
  // Le sens du dernier passage : le volet sort à l'opposé de son entrée.
  const [sens, setSens] = useState(1)

  useEffect(() => {
    function surTouche(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const pas = event.key === 'ArrowRight' ? 1 : -1
        setIndex((actuel) => {
          const prochain = actuel + pas
          if (prochain < 0 || prochain >= volets.length) return actuel
          setSens(pas)
          return prochain
        })
      }
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [onClose, volets.length])

  if (volets.length === 0) return null

  function aller(prochain) {
    if (prochain < 0 || prochain >= volets.length) return
    setSens(prochain > index ? 1 : -1)
    setIndex(prochain)
  }

  const dernier = index === volets.length - 1
  const { Icon, titre, texte } = volets[index]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Comment jouer à « ${jeu.titre} »`}
      className="tuto"
    >
      <motion.div
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="tuto__card"
      >
        <header className="tuto__head">
          <div>
            <p className="tuto__eyebrow">Comment jouer</p>
            <h2 className="tuto__game">{jeu.titre}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Passer le tutoriel"
            className="tuto__skip"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        {/* Le volet glisse, le cadre ne bouge pas : la scène a une hauteur
            minimale. */}
        <div className="tuto__stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: sens * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: sens * -32 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={(event, info) => {
                if (info.offset.x < -60) aller(index + 1)
                else if (info.offset.x > 60) aller(index - 1)
              }}
              className="tuto__slide"
            >
              <span className="tuto__icon">
                <Icon size={26} strokeWidth={1.9} />
              </span>
              <h3 className="tuto__title">{titre}</h3>
              <p className="tuto__text">{texte}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="tuto__dots">
          {volets.map((volet, i) => (
            <button
              key={volet.titre}
              type="button"
              onClick={() => aller(i)}
              aria-label={`Volet ${i + 1} sur ${volets.length} : ${volet.titre}`}
              aria-current={i === index ? 'step' : undefined}
              className={`tuto__dot${i === index ? ' tuto__dot--active' : ''}`}
            />
          ))}
        </div>

        <footer className="tuto__foot">
          <button
            type="button"
            onClick={() => aller(index - 1)}
            disabled={index === 0}
            className="tuto__back"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
            Précédent
          </button>

          {dernier ? (
            <button type="button" onClick={onClose} className="tuto__next">
              <Play size={15} fill="currentColor" strokeWidth={0} />
              Commencer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => aller(index + 1)}
              className="tuto__next"
            >
              Suivant
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          )}
        </footer>
      </motion.div>
    </motion.div>
  )
}
