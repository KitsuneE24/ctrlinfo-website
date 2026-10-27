import { useState } from 'react'
import { Check, ClipboardCopy, Download, RotateCcw, TriangleAlert, Upload } from 'lucide-react'
import { getConversations } from '../api/contenu'
import { ErreurCode, decoderCode, encoderCode } from '../lib/codeProgression'
import { exportable, incoherence, reinitialiser, remplacer } from '../state/progression'
import { useProgression } from '../state/useProgression'

export default function CodeProgression() {
  const etat = useProgression()

  const [code, setCode] = useState(null)
  const [copie, setCopie] = useState(false)

  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState(null)
  const [aConfirmer, setAConfirmer] = useState(null)
  const [restaure, setRestaure] = useState(false)
  const [remise, setRemise] = useState(false)

  // Ce qu'il y a à perdre. Un joueur qui n'a rien joué n'a pas besoin qu'on lui
  // demande confirmation avant d'écraser un état vide.
  const aQuelqueChose = etat.fil.decisions > 0 || Object.keys(etat.conversations).length > 0

  async function exporter() {
    setCopie(false)
    const enLigne = await getConversations().catch(() => [])
    setCode(await encoderCode(exportable(enLigne.map((conversation) => conversation.id))))
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(code)
      setCopie(true)
    } catch {
      // Presse-papiers refusé : copie manuelle depuis la zone de texte.
      setCopie(false)
      setErreur('Le presse-papiers est bloqué : sélectionnez le code et copiez-le à la main.')
    }
  }

  async function restaurer() {
    setErreur(null)
    setRestaure(false)
    try {
      const recu = await decoderCode(saisie)
      const probleme = incoherence(recu)
      if (probleme) {
        setErreur(`Ce code a été modifié et ne peut pas être restauré : ${probleme}.`)
        return
      }
      if (aQuelqueChose) setAConfirmer(recu)
      else appliquer(recu)
    } catch (echec) {
      if (!(echec instanceof ErreurCode)) throw echec
      setErreur(echec.message)
    }
  }

  function appliquer(recu) {
    setAConfirmer(null)
    if (!remplacer(recu)) {
      setErreur('Ce code est lisible, mais il ne contient pas de progression CTRL INFO.')
      return
    }
    setSaisie('')
    setCode(null)
    setRestaure(true)
  }

  function effacer() {
    reinitialiser()
    setRemise(false)
    setCode(null)
    setSaisie('')
    setRestaure(false)
    setErreur(null)
  }

  return (
    <section className="card">
      <div className="card__body">
        <h2 className="card__title">Garder votre progression</h2>
        <p className="card__text">
          Copiez votre code pour retrouver votre progression ailleurs.
        </p>

        {/* Exporter */}
        <div className="code">
          {code === null ? (
            <button type="button" onClick={exporter} className="bouton bouton--plein bouton--large">
              <Download size={16} strokeWidth={2.2} />
              Exporter mon code
            </button>
          ) : (
            <>
              <label className="champ">
                <span className="champ__label">Ton code</span>
                <textarea
                  value={code}
                  readOnly
                  rows={3}
                  spellCheck="false"
                  onFocus={(event) => event.target.select()}
                  className="champ__input champ__zone"
                />
                <span className="champ__aide">
                  À copier en entier, d'un bout à l'autre : un code coupé ne
                  peut pas être relu.
                </span>
              </label>
              <div className="code__actions code__actions--droite">
                <button
                  type="button"
                  onClick={() => setCode(null)}
                  className="bouton bouton--large"
                >
                  Masquer
                </button>
                <button type="button" onClick={copier} className="bouton bouton--plein bouton--large">
                  {copie ? (
                    <Check size={16} strokeWidth={2.4} />
                  ) : (
                    <ClipboardCopy size={16} strokeWidth={2.2} />
                  )}
                  {copie ? 'Code copié' : 'Copier le code'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* --- Restaurer --------------------------------------------------- */}
        <div className="code code--restaurer">
          <label className="champ">
            <span className="champ__label">Restaurer un code</span>
            <textarea
              value={saisie}
              onChange={(event) => {
                setSaisie(event.target.value)
                setErreur(null)
                setAConfirmer(null)
                setRestaure(false)
              }}
              rows={2}
              spellCheck="false"
              placeholder="CTRL1.…"
              className="champ__input champ__zone champ__zone--courte"
            />
          </label>

          {erreur && (
            <p className="code__message code__message--ko">
              <TriangleAlert size={15} strokeWidth={2.2} />
              {erreur}
            </p>
          )}

          {restaure && (
            <p className="code__message code__message--ok">
              <Check size={15} strokeWidth={2.4} />
              Progression restaurée. Vos niveaux et vos conversations sont
              revenus.
            </p>
          )}

          {aConfirmer ? (
            <>
              <p className="code__message code__message--ko">
                <TriangleAlert size={15} strokeWidth={2.2} />
                Ce code est valide, mais le restaurer remplacera la progression
                de cet appareil. Exportez-la d'abord si vous voulez la garder.
              </p>
              <div className="code__actions">
                <button
                  type="button"
                  onClick={() => appliquer(aConfirmer)}
                  className="bouton bouton--plein bouton--large"
                >
                  Remplacer ma progression
                </button>
                <button
                  type="button"
                  onClick={() => setAConfirmer(null)}
                  className="bouton bouton--large"
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={restaurer}
              disabled={saisie.trim() === ''}
              className="bouton bouton--plein bouton--large"
            >
              <Upload size={16} strokeWidth={2.2} />
              Restaurer
            </button>
          )}
        </div>

        {/* --- Repartir de zéro -------------------------------------------- */}
        {aQuelqueChose && (
          <div className="code code--effacer">
            {remise ? (
              <>
                <p className="code__message code__message--ko">
                  <TriangleAlert size={15} strokeWidth={2.2} />
                  Tout sera effacé : niveaux, posts vus, conversations.
                  Sans code exporté, c'est définitif.
                </p>
                <div className="code__actions">
                  <button type="button" onClick={effacer} className="bouton bouton--plein bouton--large">
                    Effacer ma progression
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemise(false)}
                    className="bouton bouton--large"
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setRemise(true)}
                className="code__lien"
              >
                <RotateCcw size={14} strokeWidth={2.2} />
                Repartir de zéro
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
