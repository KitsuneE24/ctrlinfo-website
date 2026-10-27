import { useState } from 'react'
import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import { getAvatars, getConversations } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { noterPseudo } from '../state/progression'
import { noterCompagnonVisible, useCompagnonVisible } from '../state/compagnonVisible'
import { useAvatar } from '../state/useAvatar'
import { useProgression } from '../state/useProgression'
import AvatarPicker, { AvatarJoueur } from '../components/AvatarPicker'
import CodeProgression from '../components/CodeProgression'
import Filaments from '../components/ui/Filaments'
import Page from '../components/ui/Page'
import { PATHS } from '../routes'

// `total` à Infinity : barre ouverte.
function Jauge({ libelle, fait, total }) {
  const infini = total === Infinity
  const pourcentage = infini ? 100 : total > 0 ? Math.round((fait / total) * 100) : 0

  return (
    <div className="jauge">
      <div className="jauge__tete">
        <p className="jauge__libelle">{libelle}</p>
        <p className="jauge__chiffre">
          {fait} /{' '}
          {infini ? (
            <span className="jauge__infini" aria-label="sans fin">
              ∞
            </span>
          ) : (
            total
          )}
        </p>
      </div>
      <div className="jauge__piste">
        <div
          className={`jauge__barre${infini ? ' jauge__barre--infini' : ''}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  )
}

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
          placeholder="Votre pseudo"
          aria-label="Votre pseudo"
          className="champ__input"
        />
        <button type="submit" className="bouton bouton--plein">
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
      aria-label={`${valeur || 'Choisissez votre pseudo'}, modifier`}
      className="profil-pseudo"
    >
      {valeur || 'Choisissez votre pseudo'}
      <Pencil size={14} strokeWidth={2} />
    </button>
  )
}

export default function ProfileScreen() {
  const etat = useProgression()
  const avatar = useAvatar()
  const [galerie, setGalerie] = useState(false)
  const compagnonVisible = useCompagnonVisible()

  const { donnees: conversations } = useRessource(getConversations, [])
  const { donnees: avatars } = useRessource(getAvatars, [])

  const { fil } = etat
  const faites = (conversations ?? []).filter((c) => etat.conversations[c.id]?.faite).length
  const reussite = fil.decisions > 0 ? Math.round((fil.justes / fil.decisions) * 100) : 0

  const biais = Object.entries(fil.biais)
    .filter(([, compte]) => compte.total >= 3)
    .map(([nom, compte]) => ({
      nom,
      reussite: Math.round((compte.justes / compte.total) * 100),
      total: compte.total,
    }))
    .sort((a, b) => a.reussite - b.reussite)
    .slice(0, 5)

  const [pire, ...autres] = biais

  return (
    <Page seamless>
      <div className="profil">
        <span aria-hidden="true" className="profil__halo" />
        <Filaments forme="swirl" tourne inverse className="profil__filaments" />

        <section className="profil__colonne">
          <header className="profil-tete">
            <button
              type="button"
              onClick={() => setGalerie((ouverte) => !ouverte)}
              aria-expanded={galerie}
              aria-label="Changer d'avatar"
              title="Changer d'avatar"
              className="profil-avatar"
            >
              <AvatarJoueur avatar={avatar} taille={96} />
            </button>
            <div className="profil-bio">
              <Pseudo valeur={etat.pseudo} />
              <p className="etiquette">Niveau {fil.niveau} du fil</p>
            </div>
          </header>

          {galerie && (
            <AvatarPicker
              avatars={avatars ?? []}
              choisi={etat.avatar}
              onChoisi={() => setGalerie(false)}
            />
          )}

          <h1 className="profil__titre">Votre profil.</h1>

          <dl className="profil-chiffres">
            <div>
              <dt>décisions</dt>
              <dd>{fil.decisions}</dd>
            </div>
            <div>
              <dt>justes</dt>
              <dd>{reussite}&nbsp;%</dd>
            </div>
            <div>
              <dt>conversations</dt>
              <dd>{faites}</dd>
            </div>
          </dl>

          <div className="profil-jauges">
            <Jauge libelle="Niveaux du fil" fait={fil.niveau} total={Infinity} />
            <Jauge libelle="Posts" fait={fil.decisions} total={Infinity} />
            <Jauge
              libelle="Conversations"
              fait={faites}
              total={conversations?.length ?? 0}
            />
          </div>
        </section>

        <section className="profil__colonne profil__colonne--large">
          <div className="papier profil-piege">
            <span className="papier__ruban" />
            <div className="profil-piege__texte">
              <p className="etiquette profil-piege__etiquette">Ce qui vous piège</p>
              {pire ? (
                <>
                  <p className="profil-piege__titre">{pire.nom}</p>
                  <p className="profil-piege__detail">
                    {pire.reussite}&nbsp;% de bonnes réponses sur {pire.total} posts.
                  </p>
                  {autres.length > 0 && (
                    <ul className="biais-liste">
                      {autres.map((entree) => (
                        <li key={entree.nom} className="biais-ligne">
                          <span className="biais-ligne__nom">{entree.nom}</span>
                          <span className="biais-ligne__score">{entree.reussite}&nbsp;%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <p className="profil-piege__titre">Pas encore assez de parties.</p>
                  <p className="profil-piege__detail">
                    Jouez quelques posts pour voir quel piège vous résiste.
                  </p>
                </>
              )}
            </div>
            <Link to={PATHS.feed} className="bouton bouton--encre bouton--petit">
              S'entraîner
            </Link>
          </div>

          <label className="reglage">
            <span className="reglage__texte">
              <span className="reglage__titre">Le cagou</span>
              <span className="reglage__aide">Il commente votre partie en bas de l'écran.</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={compagnonVisible}
              onChange={(event) => noterCompagnonVisible(event.target.checked)}
              className="reglage__interrupteur"
            />
          </label>

          <CodeProgression />
        </section>
      </div>
    </Page>
  )
}
