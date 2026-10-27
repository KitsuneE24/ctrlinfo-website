import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router'
import { Check, ChevronRight, MessageCircle, MessageCirclePlus } from 'lucide-react'
import {
  fabriquerNouvellesConversations,
  getConversation,
  getConversations,
  getPlusDeConversations,
} from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { texteSur } from '../lib/contraste'
import { clearSession, getRunIds, saveRunIds } from '../state/conversationSessions'
import { useExitGuard } from '../state/exitGuard'
import { useProgression } from '../state/useProgression'
import { PATHS, chatPath } from '../routes'
import Page from '../components/ui/Page'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'
import ChatThread from '../components/ChatThread'

export default function ChatScreen() {
  const { slug: openId = null } = useParams()
  const navigate = useNavigate()
  const { paused, onFinished, onRegles } = useOutletContext()
  const { requestExit } = useExitGuard()
  const { conversations: avancement } = useProgression()

  // Numéro de partie par conversation : change à chaque « Recommencer » pour remonter le fil.
  const [runIds, setRunIds] = useState(getRunIds)

  const liste = useRessource(getConversations, [])
  const conversations = liste.donnees ?? []
  const toutesFaites = conversations.every((c) => avancement[c.id]?.faite === true)
  const { donnees: plus } = useRessource(getPlusDeConversations, [])
  // null, 'encours' ou 'rien'
  const [fabrication, setFabrication] = useState(null)

  function fabriquer() {
    setFabrication('encours')
    fabriquerNouvellesConversations()
      .then((nombre) => {
        setFabrication(nombre === 0 ? 'rien' : null)
        if (nombre > 0) liste.recharger()
      })
      .catch(() => setFabrication('rien'))
  }

  const chargerOuverte = useCallback(
    () => (openId ? getConversation(openId) : Promise.resolve(null)),
    [openId]
  )
  const ouverte = useRessource(chargerOuverte, [openId])

  useEffect(() => {
    saveRunIds(runIds)
  }, [runIds])

  const open = ouverte.donnees
  const sessionKey = openId ? `${openId}-${runIds[openId] ?? 0}` : null

  function restart() {
    clearSession(openId)
    setRunIds((prev) => ({ ...prev, [openId]: (prev[openId] ?? 0) + 1 }))
  }

  return (
    <Page fill>
      <div className="messaging">
        <div className={`messaging__list${openId ? ' messaging__list--hidden' : ''}`}>
          <div className="messaging__scroll no-scrollbar">
            <header className="page__heading">
              <h1 className="page__title">Messages</h1>
              <p className="page__subtitle">
                Quand la fake news vient de vos proches
              </p>
            </header>

            {liste.erreur ? (
              <ErreurChargement erreur={liste.erreur} onReessayer={liste.recharger} />
            ) : liste.chargement ? (
              <Chargement quoi="les conversations" />
            ) : (
              <ul>
                {conversations.map((conversation) => {
                  const isOpen = conversation.id === openId
                  const faite = avancement[conversation.id]?.faite === true
                  return (
                    <li key={conversation.id}>
                      <Link
                        to={chatPath(conversation.id)}
                        className={`inbox-item${isOpen ? ' inbox-item--active' : ''}`}
                      >
                        <span
                          className="inbox-item__avatar"
                          style={{
                            background: conversation.color,
                            color: texteSur(conversation.color),
                          }}
                        >
                          {conversation.name[0]}
                        </span>

                        <span className="inbox-item__text">
                          <span className="inbox-item__name">{conversation.name}</span>
                          <span className="inbox-item__preview">
                            {conversation.preview}
                          </span>
                        </span>

                        {faite ? (
                          <span
                            title="Conversation déjà menée au bout"
                            className="inbox-item__faite"
                          >
                            <Check size={14} strokeWidth={3} />
                          </span>
                        ) : (
                          <ChevronRight size={18} className="inbox-item__chevron" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}

            {plus && !liste.chargement && !liste.erreur && toutesFaites && (
              <div className="fabriquer">
                <p className="fabriquer__texte">
                  {fabrication === 'rien'
                    ? 'Pas de nouveaux messages pour l’instant. Revenez demain !'
                    : 'Vous êtes à jour : vous avez répondu à tout le monde.'}
                </p>
                {fabrication !== 'rien' && (
                  <button
                    type="button"
                    onClick={fabriquer}
                    disabled={fabrication === 'encours'}
                    className="bouton bouton--plein"
                  >
                    <MessageCirclePlus size={16} strokeWidth={2.2} />
                    {fabrication === 'encours' ? 'Chargement…' : 'Continuer à discuter'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`messaging__panel${openId ? '' : ' messaging__panel--hidden'}`}>
          {ouverte.erreur ? (
            <ErreurChargement erreur={ouverte.erreur} onReessayer={ouverte.recharger} />
          ) : openId && ouverte.chargement ? (
            <Chargement quoi="la conversation" />
          ) : open ? (
            <ChatThread
              key={sessionKey}
              conversation={open}
              paused={paused}
              onFinished={onFinished}
              onBack={() => {
                if (requestExit(PATHS.chats)) navigate(PATHS.chats)
              }}
              onRestart={restart}
              onRegles={onRegles}
            />
          ) : (
            <div className="messaging__empty">
              <span className="messaging__empty-icon">
                <MessageCircle size={38} strokeWidth={1.4} />
              </span>
              <p className="messaging__empty-title">Vos conversations</p>
              <p className="messaging__empty-text">
                Choisissez une conversation à gauche pour lancer un mini-jeu.
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}
