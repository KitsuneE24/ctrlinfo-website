import { MessagesSquare, Newspaper } from 'lucide-react'
import { getAvatars, getConversations, getNiveaux } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { useProgression } from '../state/useProgression'
import AvatarPicker, { AvatarJoueur } from '../components/AvatarPicker'
import CodeProgression from '../components/CodeProgression'
import InterestPicker from '../components/InterestPicker'
import Page from '../components/ui/Page'

/**
 * Onglet « Ma progression ».
 *
 * Il portait la connexion, l'inscription et le mode invité, puis un tableau de
 * bord calculé par l'API. Il n'y a plus de compte : ni e-mail, ni mot de passe,
 * ni rien à créer pour que les parties comptent. Cet écran est devenu la
 * réponse à une seule question — *où est passé ce que j'ai fait ?* — et il y
 * répond en trois temps : ce que tu as fait, comment l'emporter, ce que tu veux
 * voir.
 *
 * Les chiffres sont maintenant calculés ici, à partir du magasin local. Deux
 * conséquences assumées :
 *
 *   - ce sont les mêmes définitions qu'au serveur, pas les mêmes calculs : les
 *     points viennent du contenu lui-même (`post.scores`), que le serveur
 *     additionnait de son côté ;
 *   - les couronnes, les badges et la série de jours ont disparu. Ils
 *     demandaient un historique daté que personne ne tient plus. Mieux valait
 *     les retirer que d'en montrer des versions approximatives.
 *
 * Les totaux, eux, restent du contenu : combien de publications existent,
 * combien de conversations. C'est à l'API de le dire.
 */

/** Une jauge de complétion. */
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

function Chiffre({ valeur, libelle }) {
  return (
    <li className="stat">
      <p className="stat__valeur">{valeur}</p>
      <p className="stat__libelle">{libelle}</p>
    </li>
  )
}

export default function ProfileScreen() {
  const etat = useProgression()

  // Les totaux : ce que contient le jeu, face à ce qui a été fait. Le reste de
  // l'écran s'affiche sans eux — une jauge sans total vaut mieux qu'un écran de
  // chargement devant un code de progression qu'on est venu chercher.
  const { donnees: niveaux } = useRessource(getNiveaux, [])
  const { donnees: conversations } = useRessource(getConversations, [])
  const { donnees: avatars } = useRessource(getAvatars, [])

  const publications = (niveaux ?? []).reduce((somme, n) => somme + (n.publications ?? 0), 0)
  const avatar = (avatars ?? []).find((entree) => entree.id === etat.avatar) ?? null

  const { fil } = etat
  const faites = Object.values(etat.conversations).filter((c) => c.faite).length
  const reussite = fil.decisions > 0 ? Math.round((fil.justes / fil.decisions) * 100) : 0

  // Ce qui piège le plus : les biais les moins bien réussis d'abord, et
  // seulement ceux qu'on a rencontrés assez souvent pour que ça veuille dire
  // quelque chose. Deux erreurs sur deux publications ne font pas une faiblesse.
  const biais = Object.entries(fil.biais)
    .filter(([, compte]) => compte.total >= 3)
    .map(([nom, compte]) => ({
      nom,
      reussite: Math.round((compte.justes / compte.total) * 100),
      total: compte.total,
    }))
    .sort((a, b) => a.reussite - b.reussite)
    .slice(0, 5)

  const jamaisJoue = fil.decisions === 0 && faites === 0

  return (
    <Page
      feed
      title="Ma progression"
      subtitle="Gardée dans ce navigateur, sans compte ni e-mail"
    >
      <header className="profil__tete">
        <AvatarJoueur avatar={avatar} />
        <div className="profil__identite">
          <p className="profil__etat">
            {jamaisJoue ? "Rien de joué pour l'instant" : `Niveau ${fil.niveau} du fil`}
          </p>
          <p className="profil__detail">
            {jamaisJoue
              ? 'Lance une partie : tout sera retenu à partir de la première décision.'
              : `${fil.decisions} décisions prises, ${faites} conversation${faites > 1 ? 's' : ''} menée${faites > 1 ? 's' : ''} au bout`}
          </p>
        </div>
      </header>

      {/* Le code d'abord quand il y a quelque chose à sauver : c'est la seule
          chose de cet écran qui se perd si on ne la fait pas. */}
      {!jamaisJoue && <CodeProgression />}

      {!jamaisJoue && (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Tes chiffres</h2>
            <ul className="stats">
              <Chiffre valeur={fil.points} libelle="points au total" />
              <Chiffre valeur={fil.parties} libelle="fils terminés" />
              <Chiffre valeur={faites} libelle="conversations" />
              <Chiffre valeur={`${reussite} %`} libelle="de bonnes décisions" />
            </ul>
            <p className="card__note">
              {fil.justes} bonnes réponses sur {fil.decisions} décisions prises.
            </p>
          </div>
        </section>
      )}

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">Ce qu'il te reste à voir</h2>
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

      {/* Le seul chiffre vraiment utile : pas « combien », mais « sur quoi ». */}
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
                  <p className="biais-ligne__conseil">
                    Rencontré {entree.total} fois.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <AvatarPicker avatars={avatars ?? []} choisi={etat.avatar} />

      <InterestPicker />

      {/* Rien de joué : le code n'a rien à transporter, mais un joueur qui
          arrive avec le code d'un autre appareil vient le coller ici. */}
      {jamaisJoue && <CodeProgression />}
    </Page>
  )
}
