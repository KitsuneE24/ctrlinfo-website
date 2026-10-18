import { useState } from 'react'
import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import { getAvatars, getConversations, getNiveaux } from '../api/contenu'
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

function Jauge({ libelle, fait, total }) {
  const pourcentage = total > 0 ? Math.round((fait / total) * 100) : 0

  return (
    <div className="jauge">
      <div className="jauge__tete">
        <p className="jauge__libelle">{libelle}</p>
        <p className="jauge__chiffre">
          {fait} / {total}
        </p>
      </div>
      <div className="jauge__piste">
        <div className="jauge__barre" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  )
}

/** Pseudo cliquable pour le modifier. */
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
      aria-label="Modifier le pseudo"
      className="profil-pseudo"
    >
      {valeur || 'Choisis ton pseudo'}
      <Pencil size={14} strokeWidth={2} />
    </button>
  )
}

export default function ProfileScreen() {
  const etat = useProgression()
  const avatar = useAvatar()
  const [galerie, setGalerie] = useState(false)
  const compagnonVisible = useCompagnonVisible()

  const { donnees: niveaux } = useRessource(getNiveaux, [])
  const { donnees: conversations } = useRessource(getConversations, [])
  const { donnees: avatars } = useRessource(getAvatars, [])

  const publications = (niveaux ?? []).reduce((somme, n) => somme + (n.publications ?? 0), 0)

  const { fil } = etat
  const faites = Object.values(etat.conversations).filter((c) => c.faite).length
  const reussite = fil.decisions > 0 ? Math.round((fil.justes / fil.decisions) * 100) : 0

  // Biais vus au moins 3 fois, du plus raté au moins raté.
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

          <h1 className="profil__titre">Ma progression.</h1>

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
            <Jauge libelle="Niveaux du fil" fait={fil.niveau} total={3} />
            <Jauge libelle="Publications" fait={fil.vus.length} total={publications} />
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
              <p className="etiquette profil-piege__etiquette">Ce qui te piège</p>
              {pire ? (
                <>
                  <p className="profil-piege__titre">{pire.nom}</p>
                  <p className="profil-piege__detail">
                    {pire.reussite}&nbsp;% de bonnes réponses sur {pire.total} publications.
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
                    Joue quelques publications pour voir quel piège te résiste.
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
              <span className="reglage__titre">Le petit compagnon</span>
              <span className="reglage__aide">Le personnage qui commente ta partie en bas de l'écran.</span>
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
