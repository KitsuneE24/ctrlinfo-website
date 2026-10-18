import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Check, HelpCircle, Lightbulb, SendHorizontal } from 'lucide-react'
import { getSession, saveSession } from '../state/conversationSessions'
import { finirConversation } from '../state/progression'
import { texteSur } from '../lib/contraste'

/**
 * Durée des points de frappe, modulée par la longueur du message. Valeurs
 * calées sur conversations.js : moyenne ≈ 1,8 s, de 1,2 s à 2,6 s.
 */
const TYPING_BASE_MS = 700
const TYPING_PER_CHAR_MS = 10
const TYPING_MIN_MS = 1200
const TYPING_MAX_MS = 2600

// Les explications ne sont pas « tapées » : pas d'indicateur de frappe.
const EXPLICATION_DELAY_MS = 500

const COMPOSER_PLACEHOLDER = 'Votre message...'

/**
 * Les messages d'une étape, le dernier portant la question.
 *
 * Dans un groupe, plusieurs personnes peuvent parler avant qu'on demande quoi
 * que ce soit : c'est la conversation qui monte, et c'est elle qui fait la
 * pression.
 */
function messagesDe(etape) {
  return etape.messages.map((message, i) => ({
    text: message.texte,
    auteur: message.auteur,
    kind: i === etape.messages.length - 1 ? 'question' : 'message',
  }))
}

function delayFor(item, isFirst) {
  // Le premier message est déjà là à l'ouverture.
  if (isFirst) return 0
  if (item.kind === 'explication') return EXPLICATION_DELAY_MS
  const estimation = TYPING_BASE_MS + item.text.length * TYPING_PER_CHAR_MS
  return Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, estimation))
}

function Avatar({ name, color, size = 30 }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        color: texteSur(color),
        fontSize: size * 0.42,
      }}
    >
      {name[0]?.toUpperCase()}
    </span>
  )
}

function TypingBubble() {
  return (
    <span className="typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing__dot"
        />
      ))}
    </span>
  )
}

/**
 * Le composant est monté avec une clé qui change à chaque partie
 * (`conversation-runId`, cf. ChatScreen) : recommencer, c'est le remonter.
 *
 * Les initialiseurs de useState regardent d'abord si une partie est en cours
 * pour cette conversation, et reprennent au message près — y compris après un
 * rechargement, puisque le fil est maintenant écrit dans le navigateur. Seul le
 * compte à rebours du message en cours de frappe repart à zéro.
 */
export default function ChatThread({ conversation, paused, onFinished, onBack, onRestart, onRegles }) {
  const { name, color, intro, steps, outro, groupe, contexte, participants } = conversation

  // Dans un groupe, l'en-tête montre qui est là ; en tête-à-tête, le nom de la
  // conversation suffit.
  const entete = groupe ? contexte || name : name

  const saved = getSession(conversation.id)

  const [log, setLog] = useState(() => saved?.log ?? [])
  const [queue, setQueue] = useState(
    () =>
      saved?.queue ?? [
        ...intro.map((message) => ({
          text: message.texte,
          auteur: message.auteur,
          kind: 'message',
        })),
        ...messagesDe(steps[0]),
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
    saveSession(conversation.id, { log, queue, stepIdx, awaiting, endAfterQueue, score, done })
  }, [conversation.id, log, queue, stepIdx, awaiting, endAfterQueue, score, done])

  // Délivre les messages de l'interlocuteur un par un.
  useEffect(() => {
    if (paused || queue.length === 0) return
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
  }, [paused, queue, endAfterQueue, log.length])

  function choose(choice) {
    setAwaiting(false)
    setLog((prev) => [...prev, { text: choice.text, kind: 'message', from: 'me' }])

    const finalScore = score + (choice.correct ? 1 : 0)
    setScore(finalScore)

    const nextIdx = stepIdx + 1
    setStepIdx(nextIdx)

    // Réplique du personnage, puis explication, puis question suivante.
    const suite = [
      { text: choice.reply, auteur: steps[stepIdx].auteur, kind: 'message' },
      { text: choice.explication, kind: 'explication', correct: choice.correct },
    ]

    if (nextIdx < steps.length) {
      setQueue([...suite, ...messagesDe(steps[nextIdx])])
    } else {
      const verdict = finalScore >= steps.length - 1 ? outro.high : outro.low
      setQueue([...suite, { text: verdict, kind: 'message' }])
      setEndAfterQueue(true)
      onFinished?.()
    }
  }

  // La discussion arrive à son terme : la conversation est retenue comme faite,
  // et son fil n'a plus à être gardé. Recommencer ne la retirera pas des
  // conversations vues — seul le meilleur score bouge encore.
  useEffect(() => {
    if (done) finirConversation(conversation.id, { score, total: steps.length })
  }, [done, conversation.id, score, steps.length])

  const choices = awaiting ? steps[stepIdx]?.choices ?? [] : []
  const typing = queue.length > 0 && queue[0].kind !== 'explication' && log.length > 0

  // Le fil suit le dernier message. Trois choses le font remonter : un
  // message, l'indicateur de frappe, et la zone de réponses qui s'ouvre —
  // d'où les dépendances.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [log, typing, choices.length, done])

  // Filet de sécurité : toute variation de hauteur ramène le fil en bas.
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
        {/* Le retour ne sert que sur téléphone. */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour aux conversations"
          className="thread__back"
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>
        {groupe ? (
          <span className="thread__pile">
            {participants.slice(0, 3).map((personne) => (
              <Avatar key={personne.id} name={personne.nom} color={personne.couleur} size={30} />
            ))}
          </span>
        ) : (
          <Avatar name={name} color={color} size={38} />
        )}
        <div>
          <p className="thread__name">{entete}</p>
          {/* Qui est en face, pas dans quel « mode » on joue : dans un groupe
              la liste des présents, sinon le rôle de l'interlocuteur. */}
          <p className="thread__subtitle">
            {groupe
              ? participants.map((personne) => personne.nom).join(', ')
              : participants[0]?.role}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegles}
          aria-label="Règles du jeu"
          title="Règles du jeu"
          className="bouton-rond thread__regles"
        >
          <HelpCircle size={20} strokeWidth={2} />
        </button>
      </header>

      <div ref={scrollRef} className="thread__log no-scrollbar">
        {log.map((message, i) => {
          // Registre 1 — la voix pédagogique : ni avatar ni bulle.
          if (message.kind === 'explication') {
            return (
              <div
                key={i}
                className={`note anim-monte${message.correct ? '' : ' note--wrong'}`}
              >
                <p className="note__label">
                  <Lightbulb size={12} strokeWidth={2.5} />
                  Pourquoi
                </p>
                <p className="note__text">{message.text}</p>
              </div>
            )
          }

          // Registre 2 — les réponses du joueur.
          if (message.from === 'me') {
            return (
              <div
                key={i}
                className="message message--mine anim-monte"
              >
                <span className="message__bubble message__bubble--mine">
                  {message.text}
                </span>
              </div>
            )
          }

          // Registre 3 — ce que dit le personnage. Liseré de la couleur du
          // contact sur les messages qui attendent une réponse.
          const isQuestion = message.kind === 'question'
          return (
            <div
              key={i}
              className="message anim-monte"
              style={{ '--contact-color': message.auteur?.couleur ?? color }}
            >
              <Avatar
                name={message.auteur?.nom ?? name}
                color={message.auteur?.couleur ?? color}
              />
              <span className="message__corps">
                {/* Dans un groupe, savoir qui parle change tout : la même
                    phrase ne pèse pas pareil selon qui la dit. */}
                {groupe && message.auteur && (
                  <span className="message__auteur">
                    {message.auteur.nom}
                    <span className="message__role"> · {message.auteur.role}</span>
                  </span>
                )}
                <span
                  className={`message__bubble${isQuestion ? ' message__bubble--question' : ''}`}
                >
                  {message.text}
                </span>
              </span>
            </div>
          )
        })}

        {typing && (
          <div className="message">
            <Avatar
              name={queue[0]?.auteur?.nom ?? name}
              color={queue[0]?.auteur?.couleur ?? color}
            />
            <TypingBubble />
          </div>
        )}

        {done && (
          <div
            className="thread__score anim-monte"
          >
            <span className="outcome__badge outcome__badge--small">
              <Check size={20} strokeWidth={2.6} />
            </span>
            <p className="thread__score-value">
              {score}/{steps.length} bons réflexes
            </p>
            <div className="outcome__action">
              <button type="button" onClick={onRestart} className="bouton bouton--plein bouton--large">
                Recommencer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Le champ de saisie ne disparaît jamais : les choix s'ouvrent
          au-dessus de lui et reprennent son apparence. */}
      <div className="composer">
        {choices.length > 0 && (
          <div className="composer__stack anim-monte">
            <p className="composer__consigne">Choisis ta réponse</p>
            {choices.map((choice, i) => (
              <button
                key={choice.text}
                type="button"
                onClick={() => choose(choice)}
                className="composer__field composer__field--choice"
              >
                <span className="composer__lettre">{String.fromCharCode(65 + i)}</span>
                <span className="composer__text">{choice.text}</span>
                <span className="composer__send">
                  <SendHorizontal size={15} strokeWidth={2.2} />
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="composer__field composer__field--idle" aria-hidden="true">
          <span className="composer__text composer__text--waiting">
            {COMPOSER_PLACEHOLDER}
          </span>
          <span className="composer__send composer__send--idle">
            <SendHorizontal size={15} strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </div>
  )
}
