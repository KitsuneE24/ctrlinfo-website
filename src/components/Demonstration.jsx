import { Flag, Heart, Send, SendHorizontal } from 'lucide-react'
import Riche from './ui/Riche'

// Règles d'un jeu montrées sur une maquette : chaque puce renvoie à une action de la liste.
// `ligne` : dans le texte, devant les mots ; sinon posée sur le coin de l'élément.
function Puce({ reperes, cible, ligne = false }) {
  const i = reperes.findIndex((r) => r.cible === cible)
  if (i < 0) return null
  const place = ligne ? 'demo__puce--ligne' : 'demo__puce'
  return <span className={`annot__puce annot__puce--${reperes[i].nature.toLowerCase()} ${place}`}>{i + 1}</span>
}

function MaquetteFil({ exemple, reperes }) {
  return (
    <div className="demo demo--fil">
      <div className="demo__compte">
        <span className="demo__avatar">
          {exemple.compte?.[0] ?? '?'}
          <Puce reperes={reperes} cible="compte" />
        </span>
        <span className="demo__identite">
          <span className="demo__nom">{exemple.compte}</span>
          <span className="demo__detail">{exemple.detail}</span>
        </span>
      </div>
      <p className="demo__post">
        <Puce reperes={reperes} cible="post" ligne />
        <strong>{exemple.titre}</strong> {exemple.texte}
      </p>
      <div className="demo__actions">
        <span className="demo__groupe">
          <Heart size={20} strokeWidth={1.8} />
          <Send size={19} strokeWidth={1.8} />
          <Puce reperes={reperes} cible="aimer" />
        </span>
        <span className="demo__groupe">
          <Flag size={19} strokeWidth={1.8} />
          <Puce reperes={reperes} cible="signaler" />
        </span>
      </div>
    </div>
  )
}

function MaquetteMessages({ exemple, reperes }) {
  const [premier, second] = exemple.choix ?? []
  return (
    <div className="demo demo--messages">
      <p className="demo__contact">{exemple.contact}</p>
      <p className="demo__bulle">
        {exemple.message}
        <Puce reperes={reperes} cible="message" />
      </p>
      <p className="demo__choix">
        <span className="demo__lettre">A</span>
        <span>
          <Puce reperes={reperes} cible="choix" ligne />
          {premier}
        </span>
        <SendHorizontal size={14} strokeWidth={2.2} />
      </p>
      <p className="demo__choix">
        <span className="demo__lettre">B</span>
        <span>
          <Puce reperes={reperes} cible="but" ligne />
          {second}
        </span>
        <SendHorizontal size={14} strokeWidth={2.2} />
      </p>
    </div>
  )
}

export default function Demonstration({ jeu }) {
  const { exemple, reperes = [], apres } = jeu.demonstration
  const Maquette = jeu.id === 'chat' ? MaquetteMessages : MaquetteFil

  return (
    <>
      {/* La liste dit la même chose : la maquette est décorative. */}
      <div aria-hidden="true">
        <Maquette exemple={exemple} reperes={reperes} />
      </div>
      <ol className="game-start__points">
        {reperes.map((repere, i) => (
          <li key={repere.cible}>
            <span className={`annot__puce annot__puce--${repere.nature.toLowerCase()} game-start__numero game-start__numero--puce`}>
              {i + 1}
            </span>
            <span>
              <Riche texte={repere.texte} />
            </span>
          </li>
        ))}
      </ol>
      {apres && <p className="game-start__apres">{apres}</p>}
    </>
  )
}
