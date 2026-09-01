import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { getConversation, getConversations } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { clearSession, getRunIds, saveRunIds } from '../state/conversationSessions'
import { useExitGuard } from '../state/exitGuard'
import { PATHS, chatPath } from '../routes'
import Page from '../components/ui/Page'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'
import ChatThread from '../components/ChatThread'

/**
 * Onglet « Conversations ».
 *
 * - Téléphone : une seule vue à la fois — la liste, puis le fil, avec un
 *   bouton retour.
 * - À partir de 768px : les deux volets côte à côte. La même adresse pilote
 *   les deux cas, seule la visibilité change.
 *
 * La conversation ouverte est dans l'URL, pas dans un état : on peut envoyer
 * le lien d'une discussion, la retrouver après un rechargement, et le bouton
 * « précédent » du navigateur revient à la liste.
 *
 * Deux appels, et c'est volontaire : la boîte de réception ne charge que de
 * quoi lister (nom, aperçu, couleur), et les branches d'une discussion
 * n'arrivent qu'à son ouverture. Inutile de télécharger tous les
 * embranchements de toutes les conversations pour en afficher les titres.
 */
export default function ChatScreen() {
  const { slug: openId = null } = useParams()
  const navigate = useNavigate()
  // Tant que l'écran de départ est là, la discussion ne se déroule pas.
  const { paused, onFinished } = useOutletContext()
  const { requestExit } = useExitGuard()

  // Un numéro de partie par conversation, qui change à chaque
  // « Recommencer » : la clé du fil change, le composant se remonte. Il vit
  // hors de React pour survivre au passage d'un écran à l'autre.
  const [runIds, setRunIds] = useState(getRunIds)

  const liste = useRessource(getConversations, [])
  const conversations = liste.donnees ?? []

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
    clearSession(sessionKey)
    setRunIds((prev) => ({ ...prev, [openId]: (prev[openId] ?? 0) + 1 }))
  }

  return (
    <Page fill>
      <div className="messaging">
        {/* Volet liste */}
        <div className={`messaging__list${openId ? ' messaging__list--hidden' : ''}`}>
          <div className="messaging__scroll no-scrollbar">
            <header className="page__heading">
              <h1 className="page__title">Les conversations</h1>
              <p className="page__subtitle">
                Quand la fausse info vient de tes proches
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
                  return (
                    <li key={conversation.id}>
                      <Link
                        to={chatPath(conversation.id)}
                        className={`inbox-item${isOpen ? ' inbox-item--active' : ''}`}
                      >
                        <span
                          className="inbox-item__avatar"
                          style={{ background: conversation.color }}
                        >
                          {conversation.name[0]}
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
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Volet conversation */}
        <div className={`messaging__panel${openId ? '' : ' messaging__panel--hidden'}`}>
          {ouverte.erreur ? (
            <ErreurChargement erreur={ouverte.erreur} onReessayer={ouverte.recharger} />
          ) : openId && ouverte.chargement ? (
            <Chargement quoi="la conversation" />
          ) : open ? (
            <ChatThread
              key={sessionKey}
              sessionKey={sessionKey}
              conversation={open}
              paused={paused}
              onFinished={onFinished}
              onBack={() => {
                if (requestExit(PATHS.chats)) navigate(PATHS.chats)
              }}
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
