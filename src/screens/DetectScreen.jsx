import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ScanSearch, Check, X, Minus, Trophy } from 'lucide-react'
import manches from '../data/detect'
import Page from '../components/ui/Page'

// Trois états après validation : indice correctement repéré, indice manqué,
// et fausse alerte (élément sain signalé à tort).
function verdictOf(indice, selected) {
  if (indice.suspect && selected) return 'found'
  if (indice.suspect && !selected) return 'missed'
  if (!indice.suspect && selected) return 'false'
  return 'neutral'
}

const VERDICTS = {
  found:   { Icon: Check, texte: 'Bien vu' },
  missed:  { Icon: X,     texte: 'Indice manqué' },
  false:   { Icon: Minus, texte: 'Fausse alerte' },
  neutral: { Icon: Check, texte: 'Rien à signaler' },
}

export default function DetectScreen() {
  const [mancheIdx, setMancheIdx] = useState(0)
  const [selection, setSelection] = useState([])
  const [valide, setValide] = useState(false)
  const [total, setTotal] = useState({ points: 0, max: 0 })

  const manche = manches[mancheIdx]
  const fini = mancheIdx >= manches.length

  const bilan = useMemo(() => {
    if (!manche) return null
    let points = 0
    let max = 0
    for (const indice of manche.indices) {
      if (indice.suspect) max += 1
      const verdict = verdictOf(indice, selection.includes(indice.id))
      if (verdict === 'found') points += 1
      if (verdict === 'false') points -= 1
    }
    return { points: Math.max(0, points), max }
  }, [manche, selection])

  function toggle(id) {
    if (valide) return
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function suivant() {
    setTotal((prev) => ({
      points: prev.points + bilan.points,
      max: prev.max + bilan.max,
    }))
    setSelection([])
    setValide(false)
    setMancheIdx((i) => i + 1)
  }

  function rejouer() {
    setMancheIdx(0)
    setSelection([])
    setValide(false)
    setTotal({ points: 0, max: 0 })
  }

  if (fini) {
    return (
      <Page title="Repère les indices">
        <section className="card outcome">
          <span className="outcome__badge">
            <Trophy size={34} strokeWidth={1.8} />
          </span>
          <h2 className="outcome__title">Manches terminées</h2>
          <p className="outcome__line">
            <span className="outcome__figure">
              {total.points}/{total.max}
            </span>{' '}
            indices repérés
          </p>
          <p className="outcome__note">
            Les trois réflexes à garder&nbsp;: vérifier le nom de domaine exact,
            exiger une date précise, et se demander d'où vient l'image avant de
            croire ce que dit la légende.
          </p>
          <div className="outcome__action">
            <button type="button" onClick={rejouer} className="button">
              Rejouer
            </button>
          </div>
        </section>
      </Page>
    )
  }

  return (
    <Page
      title="Repère les indices"
      subtitle={`Manche ${mancheIdx + 1} sur ${manches.length}`}
    >
      <section className="card">
        {/* Consigne */}
        <div className="brief">
          <ScanSearch size={19} strokeWidth={1.9} className="brief__icon" />
          <p className="brief__text">
            Désigne les éléments qui posent problème. Attention&nbsp;: tout n'est
            pas suspect, et signaler un élément sain coûte un point.
          </p>
        </div>

        {/* Aperçu de la publication analysée */}
        <div className="specimen">
          <p className="specimen__context">{manche.contexte}</p>
          <div className="specimen__post">
            <span
              className="post__avatar"
              style={{ background: manche.apercu.couleur }}
            >
              {manche.apercu.compte[0]}
            </span>
            <div>
              <p className="specimen__account">{manche.apercu.compte}</p>
              <p className="specimen__title">{manche.apercu.titre}</p>
            </div>
          </div>
        </div>

        {/* Les indices à trier */}
        <ul className="clue-list">
          {manche.indices.map((indice) => {
            const selected = selection.includes(indice.id)
            const verdict = valide ? verdictOf(indice, selected) : null
            const meta = verdict ? VERDICTS[verdict] : null

            const modifier = verdict
              ? ` clue--${verdict}`
              : selected
                ? ' clue--selected'
                : ''

            return (
              <li key={indice.id}>
                <button
                  type="button"
                  onClick={() => toggle(indice.id)}
                  disabled={valide}
                  aria-pressed={selected}
                  className={`clue${modifier}`}
                >
                  <span className="clue__layout">
                    <span className="clue__mark">
                      {meta ? (
                        <meta.Icon size={12} strokeWidth={3} color="#fff" />
                      ) : selected ? (
                        <Check size={12} strokeWidth={3} color="#fff" />
                      ) : null}
                    </span>

                    <span className="clue__text">
                      <span className="clue__label">{indice.label}</span>
                      <span className="clue__value">{indice.valeur}</span>

                      {valide && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="clue__reveal"
                        >
                          <span className="clue__verdict">{meta.texte}</span>
                          <span className="clue__why">{indice.explication}</span>
                        </motion.span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Validation / passage à la manche suivante */}
        <div className="card__body">
          {valide ? (
            <>
              <p className="clue__tally">
                <span className="outcome__figure">
                  {bilan.points}/{bilan.max}
                </span>{' '}
                indices repérés sur cette manche
              </p>
              <button type="button" onClick={suivant} className="button">
                {mancheIdx + 1 < manches.length ? 'Manche suivante' : 'Voir le bilan'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setValide(true)}
              disabled={selection.length === 0}
              className="button"
            >
              Valider ma sélection
            </button>
          )}
        </div>
      </section>
    </Page>
  )
}
