import { useState } from 'react'
import { Check, ClipboardCopy, Download, RotateCcw, TriangleAlert, Upload } from 'lucide-react'
import { ErreurCode, decoderCode, encoderCode } from '../lib/codeProgression'
import { exportable, reinitialiser, remplacer } from '../state/progression'
import { useProgression } from '../state/useProgression'

/**
 * Le code de progression : l'emporter, le remettre.
 *
 * C'est ce qui remplace le compte. Sans lui, une progression ne quitte pas le
 * navigateur où elle a été faite — et disparaît avec un nettoyage de l'
 * historique. Le code est donc présenté pour ce qu'il est : la sauvegarde, et
 * la seule.
 *
 * Trois précautions, qui font l'essentiel du composant :
 *
 *   1. le code n'apparaît que sur demande, dans une zone en lecture seule qu'on
 *      ne peut pas modifier par mégarde ;
 *   2. restaurer **écrase** l'avancement local : quand il y a quelque chose à
 *      perdre, on le dit et on demande une seconde fois. Le code est décodé
 *      avant cette question, pour ne pas faire hésiter le joueur sur un code de
 *      toute façon illisible ;
 *   3. un refus dit *pourquoi* — pas « code invalide ». `codeProgression.js`
 *      distingue un code tronqué, un code d'une autre version et un code abîmé
 *      au copier-coller ; ce sont trois gestes différents à proposer.
 */
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
    setCode(await encoderCode(exportable()))
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(code)
      setCopie(true)
    } catch {
      // Presse-papiers refusé — page non sécurisée, permission bloquée. La
      // zone de texte est juste là : on invite à la copier à la main.
      setCopie(false)
      setErreur('Le presse-papiers est bloqué : sélectionne le code et copie-le à la main.')
    }
  }

  async function restaurer() {
    setErreur(null)
    setRestaure(false)
    try {
      const recu = await decoderCode(saisie)
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
        <h2 className="card__title">Garder ta progression</h2>
        <p className="card__text">
          Tout ce que tu fais est retenu dans ce navigateur, sans compte et sans
          e-mail. Pour la retrouver sur un autre appareil — ou après un nettoyage
          de ton historique — copie ton code et garde-le quelque part.
        </p>

        {/* --- Exporter ---------------------------------------------------- */}
        <div className="code">
          {code === null ? (
            <button type="button" onClick={exporter} className="button">
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
              <div className="code__actions">
                <button type="button" onClick={copier} className="button">
                  {copie ? (
                    <Check size={16} strokeWidth={2.4} />
                  ) : (
                    <ClipboardCopy size={16} strokeWidth={2.2} />
                  )}
                  {copie ? 'Code copié' : 'Copier le code'}
                </button>
                <button
                  type="button"
                  onClick={() => setCode(null)}
                  className="button button--ghost"
                >
                  Masquer
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
              rows={3}
              spellCheck="false"
              placeholder="CTRL1.…"
              className="champ__input champ__zone"
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
              Progression restaurée. Tes niveaux et tes conversations sont
              revenus.
            </p>
          )}

          {aConfirmer ? (
            <>
              <p className="code__message code__message--ko">
                <TriangleAlert size={15} strokeWidth={2.2} />
                Ce code est valide, mais le restaurer remplacera la progression
                de cet appareil. Exporte-la d'abord si tu veux la garder.
              </p>
              <div className="code__actions">
                <button
                  type="button"
                  onClick={() => appliquer(aConfirmer)}
                  className="button"
                >
                  Remplacer ma progression
                </button>
                <button
                  type="button"
                  onClick={() => setAConfirmer(null)}
                  className="button button--ghost"
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
              className="button"
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
                  Tout sera effacé : niveaux, publications vues, conversations.
                  Sans code exporté, c'est définitif.
                </p>
                <div className="code__actions">
                  <button type="button" onClick={effacer} className="button">
                    Effacer ma progression
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemise(false)}
                    className="button button--ghost"
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
