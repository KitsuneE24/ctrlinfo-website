import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Check, Lightbulb, SendHorizontal } from 'lucide-react'
import { getSession, saveSession } from '../state/conversationSessions'

/**
 * Durée d'affichage des points de frappe, pour les messages du personnage.
 *
 * Modulé par la longueur : une phrase courte n'a pas besoin d'autant de temps
 * qu'un paragraphe, et un délai fixe finit par paraître faux. Valeurs calées
 * sur les messages réellement présents dans conversations.js — moyenne
 * mesurée ≈ 1,8 s, de 1,2 s à 2,6 s.
 */
const TYPING_BASE_MS = 700
const TYPING_PER_CHAR_MS = 10
const TYPING_MIN_MS = 1200
const TYPING_MAX_MS = 2600

// Les explications ne sont pas « tapées » par le personnage : elles arrivent
// juste après sa réplique, sans indicateur de frappe.
const EXPLICATION_DELAY_MS = 500

const COMPOSER_PLACEHOLDER = 'Votre message...'

function delayFor(item, isFirst) {
  // Le tout premier message est déjà là quand on ouvre la conversation :
  // attendre devant un écran vide n'a aucun intérêt.
  if (isFirst) return 0
  if (item.kind === 'explication') return EXPLICATION_DELAY_MS
  const estimation = TYPING_BASE_MS + item.text.length * TYPING_PER_CHAR_MS
  return Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, estimation))
}

function Avatar({ name, color, size = 30 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {name[0]?.toUpperCase()}
    </span>
  )
}

function TypingBubble() {
  return (
    <span className="typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="typing__dot"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  )
}

/**
 * Le composant est monté avec une clé qui change à chaque partie
 * (`conversation-runId`, cf. ChatScreen) : recommencer, c'est remonter le
 * composant, et l'état de départ tient dans les initialiseurs de useState.
 *
 * Ces initialiseurs commencent par regarder si une partie est déjà en cours
 * pour cette clé : changer d'onglet démonte l'écran, et on doit revenir là où
 * la discussion s'était arrêtée. La reprise est fidèle au message près — la
 * seule chose qui repart à zéro est le compte à rebours du message en train
 * d'être « tapé » au moment où on a quitté.
 */
export default function ChatThread({ conversation, sessionKey, onBack, onRestart }) {
  const { name, subtitle, color, intro, steps, outro } = conversation

  const saved = getSession(sessionKey)

  const [log, setLog] = useState(() => saved?.log ?? [])
  const [queue, setQueue] = useState(
    () =>
      saved?.queue ?? [
        ...intro.map((text) => ({ text, kind: 'message' })),
        { text: steps[0].prompt, kind: 'question' },
      ]
  )
  const [stepIdx, setStepIdx] = useState(() => saved?.stepIdx ?? 0)
  const [awaiting, setAwaiting] = useState(() => saved?.awaiting ?? false)
  const [endAfterQueue, setEndAfterQueue] = useState(() => saved?.endAfterQueue ?? false)
  const [score, setScore] = useState(() => saved?.score ?? 0)
  const [done, setDone] = useState(() => saved?.done ?? false)

  const scrollRef = useRef(null)

  // Sauvegarde continue : au prochain montage, on reprend exactement ici.
  useEffect(() => {
    saveSession(sessionKey, { log, queue, stepIdx, awaiting, endAfterQueue, score, done })
  }, [sessionKey, log, queue, stepIdx, awaiting, endAfterQueue, score, done])

  // Délivre les messages de l'interlocuteur un par un.
  useEffect(() => {
    if (queue.length === 0) return
    const timer = setTimeout(() => {
      const [next, ...rest] = queue
      setLog((prev) => [...prev, { ...next, from: 'them' }])
      setQueue(rest)
      if (rest.length === 0) {
        if (endAfterQueue) setDone(true)
        else setAwaiting(true)
      }
    }, delayFor(queue[0], log.length === 0))
    return () => clearTimeout(timer)
  }, [queue, endAfterQueue, log.length])

  function choose(choice) {
    setAwaiting(false)
    setLog((prev) => [...prev, { text: choice.text, kind: 'message', from: 'me' }])

    const finalScore = score + (choice.correct ? 1 : 0)
    setScore(finalScore)

    const nextIdx = stepIdx + 1
    setStepIdx(nextIdx)

    // Réplique du personnage, puis explication, puis question suivante.
    const suite = [
      { text: choice.reply, kind: 'message' },
      { text: choice.explication, kind: 'explication', correct: choice.correct },
    ]

    if (nextIdx < steps.length) {
      setQueue([...suite, { text: steps[nextIdx].prompt, kind: 'question' }])
    } else {
      const verdict = finalScore >= steps.length - 1 ? outro.high : outro.low
      setQueue([...suite, { text: verdict, kind: 'message' }])
      setEndAfterQueue(true)
    }
  }

  const choices = awaiting ? steps[stepIdx]?.choices ?? [] : []
  const typing = queue.length > 0 && queue[0].kind !== 'explication' && log.length > 0

  /*
   * Le fil suit toujours le dernier message, comme une vraie messagerie.
   * Trois choses font remonter la discussion, pas seulement l'arrivée d'un
   * message : l'indicateur de frappe qui apparaît puis disparaît, et la zone
   * de réponses qui s'ouvre en trois pilules et réduit d'autant la hauteur
   * disponible. D'où les dépendances, en plus du journal lui-même.
   */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [log, typing, choices.length, done])

  // Filet de sécurité : toute variation de hauteur du fil — y compris celles
  // qu'aucune dépendance ne capte, comme un retour à la ligne au
  // redimensionnement — le ramène en bas.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="thread">
      <header className="thread__header">
        {/* Le retour n'a de sens que sur téléphone : en grand écran la liste
            reste affichée à côté du fil. */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour aux conversations"
          className="thread__back"
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>
        <Avatar name={name} color={color} size={38} />
        <div>
          <p className="thread__name">{name}</p>
          <p className="thread__subtitle">{subtitle}</p>
        </div>
      </header>

      <div ref={scrollRef} className="thread__log no-scrollbar">
        {log.map((message, i) => {
          // Registre 1 — la voix pédagogique. Hors fiction : pas d'avatar,
          // pas de bulle, un bloc à part qui ne peut pas être confondu avec
          // ce que dit le personnage.
          if (message.kind === 'explication') {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`note${message.correct ? '' : ' note--wrong'}`}
              >
                <p className="note__label">
                  <Lightbulb size={12} strokeWidth={2.5} />
                  Pourquoi
                </p>
                <p className="note__text">{message.text}</p>
              </motion.div>
            )
          }

          // Registre 2 — les réponses du joueur.
          if (message.from === 'me') {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="message message--mine"
              >
                <span className="message__bubble message__bubble--mine">
                  {message.text}
                </span>
              </motion.div>
            )
          }

          // Registre 3 — ce que dit le personnage. Les messages qui interrogent
          // portent un liseré de la couleur du contact : on repère d'un coup
          // d'œil ceux qui attendent une réponse.
          const isQuestion = message.kind === 'question'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="message"
              style={{ '--contact-color': color }}
            >
              <Avatar name={name} color={color} />
              <span
                className={`message__bubble${isQuestion ? ' message__bubble--question' : ''}`}
              >
                {message.text}
              </span>
            </motion.div>
          )
        })}

        {typing && (
          <div className="message">
            <Avatar name={name} color={color} />
            <TypingBubble />
          </div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="thread__score"
          >
            <span className="outcome__badge outcome__badge--small">
              <Check size={20} strokeWidth={2.6} />
            </span>
            <p className="thread__score-value">
              {score}/{steps.length} bons réflexes
            </p>
            <div className="outcome__action">
              <button type="button" onClick={onRestart} className="button">
                Recommencer
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/*
        Zone d'écriture : elle reste toujours en place, seul son contenu change.
        Quand c'est au joueur de répondre, chaque choix reprend l'apparence du
        champ de saisie — même pilule, même bouton d'envoi — de sorte que
        choisir une réponse revient visuellement à l'envoyer.
      */}
      <div className="composer">
        <AnimatePresence mode="wait" initial={false}>
          {choices.length > 0 ? (
            <motion.div
              key="choix"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="composer__stack"
            >
              {choices.map((choice) => (
                <button
                  key={choice.text}
                  type="button"
                  onClick={() => choose(choice)}
                  className="composer__field composer__field--choice"
                >
                  <span className="composer__text">{choice.text}</span>
                  <span className="composer__send">
                    <SendHorizontal size={15} strokeWidth={2.2} />
                  </span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="attente"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="composer__field"
            >
              <span className="composer__text composer__text--waiting">
                {COMPOSER_PLACEHOLDER}
              </span>
              <span className="composer__send composer__send--idle">
                <SendHorizontal size={15} strokeWidth={2.2} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
