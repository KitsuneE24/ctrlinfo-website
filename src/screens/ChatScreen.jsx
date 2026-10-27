import { useCallback, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router'
import { Check, ChevronRight, MessageCircle } from 'lucide-react'
import { fabriquerNouveauxSujets, getConversation, getConversations } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { texteSur } from '../lib/contraste'
import { useExitGuard } from '../state/exitGuard'
import { useProgression } from '../state/useProgression'
import { PATHS, chatPath } from '../routes'
import Page from '../components/ui/Page'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'
import ChatThread from '../components/ChatThread'

const contactDe = (conversation) => conversation.contact ?? conversation.id

/** Un contact par ligne, avec ses sujets dans l'ordre. */
function parContact(conversations) {
  const contacts = new Map()
  for (const conversation of conversations) {
    const cle = contactDe(conversation)
    if (!contacts.has(cle)) contacts.set(cle, [])
    contacts.get(cle).push(conversation)
  }
  return [...contacts.values()]
}

export default function ChatScreen() {
  const { slug: openId = null } = useParams()
  const navigate = useNavigate()
  const { paused, onFinished, onRegles } = useOutletContext()
  const { requestExit } = useExitGuard()
  const { conversations: avancement } = useProgression()

  const liste = useRessource(getConversations, [])
  const conversations = liste.donnees ?? []
  const faite = (conversation) => avancement[conversation.id]?.faite === true
  // État du bouton « Nouveau sujet », pour le sujet ouvert.
  const [suite, setSuite] = useState({ pour: null, etat: null })

  const chargerOuverte = useCallback(
    () => (openId ? getConversation(openId) : Promise.resolve(null)),
    [openId]
  )
  const ouverte = useRessource(chargerOuverte, [openId])
  const open = ouverte.donnees

  function nouveauSujet() {
    const contact = contactDe(open)
    const suivant = conversations.find(
      (c) => contactDe(c) === contact && c.id !== open.id && !faite(c)
    )
    if (suivant) {
      navigate(chatPath(suivant.id))
      return
    }
    setSuite({ pour: openId, etat: 'encours' })
    fabriquerNouveauxSujets(contact)
      .then((nouveaux) => {
        if (nouveaux.length === 0) {
          setSuite({ pour: openId, etat: 'rien' })
          return
        }
        setSuite({ pour: null, etat: null })
        liste.recharger()
        navigate(chatPath(nouveaux[0].id))
      })
      .catch(() => setSuite({ pour: openId, etat: 'rien' }))
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
                {parContact(conversations).map((sujets) => {
                  const courant = sujets.find((c) => !faite(c)) ?? sujets[sujets.length - 1]
                  const toutFait = sujets.every(faite)
                  const isOpen = sujets.some((c) => c.id === openId)
                  return (
                    <li key={contactDe(courant)}>
                      <Link
                        to={chatPath(courant.id)}
                        className={`inbox-item${isOpen ? ' inbox-item--active' : ''}`}
                      >
                        <span
                          className="inbox-item__avatar"
                          style={{
                            background: courant.color,
                            color: texteSur(courant.color),
                          }}
                        >
                          {courant.name[0]}
                        </span>

                        <span className="inbox-item__text">
                          <span className="inbox-item__name">{courant.name}</span>
                          <span className="inbox-item__preview">
                            {toutFait ? 'Tout est lu. Ouvrez pour un nouveau sujet.' : courant.preview}
                          </span>
                        </span>

                        {toutFait ? (
                          <span title="Tous les sujets sont faits" className="inbox-item__faite">
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
          </div>
        </div>

        <div className={`messaging__panel${openId ? '' : ' messaging__panel--hidden'}`}>
          {ouverte.erreur ? (
            <ErreurChargement erreur={ouverte.erreur} onReessayer={ouverte.recharger} />
          ) : openId && ouverte.chargement ? (
            <Chargement quoi="la conversation" />
          ) : open ? (
            <ChatThread
              key={openId}
              conversation={open}
              paused={paused}
              onFinished={onFinished}
              onBack={() => {
                if (requestExit(PATHS.chats)) navigate(PATHS.chats)
              }}
              onNouveauSujet={nouveauSujet}
              suite={suite.pour === openId ? suite.etat : null}
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
