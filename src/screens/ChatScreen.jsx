import { useEffect, useState } from 'react'
import { ChevronRight, MessageCircle } from 'lucide-react'
import conversations from '../data/conversations'
import {
  clearSession,
  getInboxState,
  saveInboxState,
} from '../state/conversationSessions'
import Page from '../components/ui/Page'
import ChatThread from '../components/ChatThread'

/**
 * Onglet « Conversations ».
 *
 * - Téléphone : une seule vue à la fois — la liste, puis le fil, avec un
 *   bouton retour.
 * - À partir de 768px : les deux volets côte à côte. Le même état (`openId`)
 *   pilote les deux cas, seule la visibilité change.
 */
export default function ChatScreen() {
  // L'état d'ouverture est repris de la session : revenir sur l'onglet rouvre
  // la conversation qu'on consultait, au message près.
  const [openId, setOpenId] = useState(() => getInboxState().openId)
  // Un numéro de partie par conversation. Il change à chaque « Recommencer » :
  // la clé du fil change, le composant se remonte à zéro.
  const [runIds, setRunIds] = useState(() => getInboxState().runIds)

  useEffect(() => {
    saveInboxState({ openId, runIds })
  }, [openId, runIds])

  const open = conversations.find((c) => c.id === openId)
  const sessionKey = open ? `${open.id}-${runIds[open.id] ?? 0}` : null

  function restart() {
    clearSession(sessionKey)
    setRunIds((prev) => ({ ...prev, [open.id]: (prev[open.id] ?? 0) + 1 }))
  }

  return (
    <Page fill>
      <div className="messaging">
        {/* Volet liste */}
        <div className={`messaging__list${open ? ' messaging__list--hidden' : ''}`}>
          <div className="messaging__scroll no-scrollbar">
            <header className="page__heading">
              <h1 className="page__title">Messages</h1>
              <p className="page__subtitle">Mini-jeux de conversation</p>
            </header>

            <ul>
              {conversations.map((conversation) => {
                const isOpen = conversation.id === openId
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(conversation.id)}
                      className={`inbox-item${isOpen ? ' inbox-item--active' : ''}`}
                    >
                      <span className="inbox-item__ring">
                        <span
                          className="inbox-item__avatar"
                          style={{ background: conversation.color }}
                        >
                          {conversation.name[0]}
                        </span>
                      </span>

                      <span className="inbox-item__text">
                        <span className="inbox-item__line">
                          <span className="inbox-item__name">{conversation.name}</span>
                          <span
                            className="inbox-item__mode"
                            style={{ background: conversation.color }}
                          >
                            {conversation.subtitle.replace('Mode ', '')}
                          </span>
                        </span>
                        <span className="inbox-item__preview">
                          {conversation.preview}
                        </span>
                      </span>

                      <ChevronRight size={18} className="inbox-item__chevron" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="messaging__note">
              Dans ces conversations, tu réponds en choisissant une bulle. Chaque
              choix est commenté&nbsp;: c'est l'occasion de te tromper sans
              conséquence.
            </p>
          </div>
        </div>

        {/* Volet conversation */}
        <div className={`messaging__panel${open ? '' : ' messaging__panel--hidden'}`}>
          {open ? (
            <ChatThread
              key={sessionKey}
              sessionKey={sessionKey}
              conversation={open}
              onBack={() => setOpenId(null)}
              onRestart={restart}
            />
          ) : (
            <div className="messaging__empty">
              <span className="messaging__empty-icon">
                <MessageCircle size={38} strokeWidth={1.4} />
              </span>
              <p className="messaging__empty-title">Tes conversations</p>
              <p className="messaging__empty-text">
                Choisis une discussion à gauche pour lancer un mini-jeu.
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}
