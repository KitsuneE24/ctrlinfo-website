import { useState } from 'react'
import { MessagesSquare, Newspaper, Pencil, Signal } from 'lucide-react'
import { getAvatars, getConversations, getNiveaux } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { noterPseudo } from '../state/progression'
import { useAvatar } from '../state/useAvatar'
import { useProgression } from '../state/useProgression'
import AvatarPicker, { AvatarJoueur } from '../components/AvatarPicker'
import CodeProgression from '../components/CodeProgression'
import Page from '../components/ui/Page'

/**
 * Onglet « Ma progression », sur le gabarit d'un profil de réseau social :
 * l'avatar et trois chiffres en tête, le pseudo et la ligne d'état dessous.
 */

function Jauge({ Icon, libelle, fait, total }) {
  const pourcentage = total > 0 ? Math.round((fait / total) * 100) : 0

  return (
    <div className="jauge">
      <div className="jauge__tete">
        <span className="jauge__icone">
          <Icon size={16} strokeWidth={2} />
        </span>
        <p className="jauge__libelle">{libelle}</p>
        <p className="jauge__chiffre">
          {fait}
          <span className="jauge__total"> / {total}</span>
        </p>
      </div>
      <div className="jauge__piste">
        <div className="jauge__barre" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  )
}

/** Le pseudo : un texte qu'on clique pour le changer. */
function Pseudo({ valeur }) {
  const [edition, setEdition] = useState(false)
  const [saisie, setSaisie] = useState(valeur)

  function valider(event) {
    event.preventDefault()
    noterPseudo(saisie)
    setEdition(false)
  }

  if (edition) {
    return (
      <form onSubmit={valider} className="profil-pseudo__form">
        <input
          type="text"
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          maxLength={40}
          autoFocus
          placeholder="Ton pseudo"
          aria-label="Ton pseudo"
          className="champ__input"
        />
        <button type="submit" className="button">
          Valider
        </button>
      </form>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setSaisie(valeur)
        setEdition(true)
      }}
      className="profil-pseudo"
    >
      {valeur || 'Choisis ton pseudo'}
      <Pencil size={13} strokeWidth={2.2} />
    </button>
  )
}

export default function ProfileScreen() {
  const etat = useProgression()
  const avatar = useAvatar()
  const [galerie, setGalerie] = useState(false)

  const { donnees: niveaux } = useRessource(getNiveaux, [])
  const { donnees: conversations } = useRessource(getConversations, [])
  const { donnees: avatars } = useRessource(getAvatars, [])

  const publications = (niveaux ?? []).reduce((somme, n) => somme + (n.publications ?? 0), 0)

  const { fil } = etat
  const faites = Object.values(etat.conversations).filter((c) => c.faite).length
  const reussite = fil.decisions > 0 ? Math.round((fil.justes / fil.decisions) * 100) : 0
  const jamaisJoue = fil.decisions === 0 && faites === 0

  // Seulement les biais rencontrés assez souvent : deux erreurs sur deux
  // publications ne font pas une faiblesse.
  const biais = Object.entries(fil.biais)
    .filter(([, compte]) => compte.total >= 3)
    .map(([nom, compte]) => ({
      nom,
      reussite: Math.round((compte.justes / compte.total) * 100),
      total: compte.total,
    }))
    .sort((a, b) => a.reussite - b.reussite)
    .slice(0, 5)

  return (
    <Page feed>
      <header className="profil-tete">
        <button
          type="button"
          onClick={() => setGalerie((ouverte) => !ouverte)}
          aria-expanded={galerie}
          title="Changer d'avatar"
          className="profil-avatar"
        >
          <AvatarJoueur avatar={avatar} taille={82} />
        </button>
        <div className="profil-bio">
          <Pseudo valeur={etat.pseudo} />
          <p className="profil-bio__ligne">
            {jamaisJoue
              ? 'Rien de joué pour l’instant.'
              : `${fil.decisions} décisions · ${reussite} % de bonnes réponses`}
          </p>
        </div>
      </header>

      {galerie && (
        <AvatarPicker
          avatars={avatars ?? []}
          choisi={etat.avatar}
          onChoisi={() => setGalerie(false)}
        />
      )}

      <CodeProgression />

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">Où tu en es</h2>
          <Jauge Icon={Signal} libelle="Niveaux du fil" fait={fil.niveau} total={3} />
          <Jauge
            Icon={Newspaper}
            libelle="Publications du fil"
            fait={fil.vus.length}
            total={publications}
          />
          <Jauge
            Icon={MessagesSquare}
            libelle="Conversations"
            fait={faites}
            total={conversations?.length ?? 0}
          />
        </div>
      </section>

      {biais.length > 0 && (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Ce qui te piège le plus</h2>
            <ul className="biais-liste">
              {biais.map((entree) => (
                <li key={entree.nom} className="biais-ligne">
                  <div className="biais-ligne__tete">
                    <p className="biais-ligne__nom">{entree.nom}</p>
                    <p className="biais-ligne__score">{entree.reussite} % de réussite</p>
                  </div>
                  <p className="biais-ligne__conseil">Rencontré {entree.total} fois.</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Page>
  )
}
