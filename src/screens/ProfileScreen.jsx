import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowRight,
  CircleUserRound,
  LogOut,
  MessagesSquare,
  Newspaper,
  Route,
  Trophy,
} from 'lucide-react'
import { getTableauDeBord } from '../api/progression'
import { useRessource } from '../lib/useRessource'
import { useCompte } from '../state/compte'
import { PATHS } from '../routes'
import Page from '../components/ui/Page'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'

/**
 * Onglet « Profil » : la porte d'entrée du compte, et le tableau de bord.
 *
 * Deux états, jamais mélangés :
 *
 *   - **sans compte** — on propose la connexion, l'inscription, et le mode
 *     invité. Le mode invité est présenté pour ce qu'il est : on joue tout de
 *     suite, mais rien n'est enregistré. Aucun compte n'est créé en base.
 *   - **connecté** — les chiffres du joueur, tels que l'API les calcule
 *     (`/moi/tableau-de-bord`). Le front n'en recalcule aucun.
 */

/** Une jauge de complétion. Le pourcentage vient du serveur. */
function Jauge({ Icon, libelle, valeur }) {
  return (
    <div className="jauge">
      <div className="jauge__tete">
        <span className="jauge__icone">
          <Icon size={16} strokeWidth={2} />
        </span>
        <p className="jauge__libelle">{libelle}</p>
        <p className="jauge__chiffre">
          {valeur.fait}
          <span className="jauge__total"> / {valeur.total}</span>
        </p>
      </div>
      <div className="jauge__piste">
        <div className="jauge__barre" style={{ width: `${valeur.pourcentage}%` }} />
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

// ── Sans compte ──────────────────────────────────────────────────────────────

function Formulaire() {
  const navigate = useNavigate()
  const { connexion, inscription, continuerEnInvite, quitterModeInvite, invite } = useCompte()

  const [mode, setMode] = useState('connexion')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [erreur, setErreur] = useState(null)
  const [enCours, setEnCours] = useState(false)

  const inscrire = mode === 'inscription'

  async function envoyer(event) {
    event.preventDefault()
    setErreur(null)
    setEnCours(true)
    try {
      if (inscrire) await inscription({ email, motDePasse, pseudo })
      else await connexion({ email, motDePasse })
    } catch (echec) {
      setErreur(echec.message)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Page feed title="Ton profil" subtitle="Pour garder tes scores d'une fois sur l'autre">
      <section className="card compte">
        <div className="compte__bascule">
          <button
            type="button"
            onClick={() => setMode('connexion')}
            className={`compte__onglet${!inscrire ? ' compte__onglet--actif' : ''}`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setMode('inscription')}
            className={`compte__onglet${inscrire ? ' compte__onglet--actif' : ''}`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={envoyer} className="compte__form">
          {inscrire && (
            <label className="champ">
              <span className="champ__label">Pseudo</span>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                minLength={2}
                maxLength={40}
                autoComplete="nickname"
                className="champ__input"
              />
            </label>
          )}

          <label className="champ">
            <span className="champ__label">Adresse e-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="champ__input"
            />
          </label>

          <label className="champ">
            <span className="champ__label">Mot de passe</span>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              minLength={inscrire ? 8 : 1}
              autoComplete={inscrire ? 'new-password' : 'current-password'}
              className="champ__input"
            />
            {inscrire && <span className="champ__aide">Huit caractères au minimum.</span>}
          </label>

          {erreur && <p className="compte__erreur">{erreur}</p>}

          <button type="submit" disabled={enCours} className="button">
            {enCours ? 'Un instant…' : inscrire ? 'Créer mon compte' : 'Me connecter'}
          </button>
        </form>
      </section>

      {/* Le mode invité, annoncé sans détour : ce qu'on y gagne, ce qu'on y
          perd. C'est la seule différence qu'il produit pour le joueur. */}
      <section className="card invite">
        <h2 className="invite__titre">Jouer sans compte</h2>
        <p className="invite__texte">
          Tout le site reste jouable : le fil d'actualité, les conversations, les
          thèmes. En revanche <b>tes scores ne sont pas enregistrés</b> — pas de
          tableau de bord, et rien à retrouver à ta prochaine visite.
        </p>
        <div className="invite__actions">
          <button
            type="button"
            onClick={() => {
              continuerEnInvite()
              navigate(PATHS.feed)
            }}
            className="button button--ghost"
          >
            Continuer en invité
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
          {invite && (
            <>
              <p className="invite__note">
                Tu joues actuellement en invité. Crée un compte quand tu veux :
                ce que tu feras à partir de là sera gardé.
              </p>
              {/* Sans ce bouton, « continuer en invité » serait sans retour :
                  la question ne se reposerait plus jamais. */}
              <button
                type="button"
                onClick={quitterModeInvite}
                className="invite__annuler"
              >
                Annuler le mode invité
              </button>
            </>
          )}
        </div>
      </section>
    </Page>
  )
}

// ── Connecté ─────────────────────────────────────────────────────────────────

const NOM_DU_JEU = { feed: "Le fil d'actualité", chat: 'Les conversations' }

function TableauDeBord() {
  const { utilisateur, deconnexion } = useCompte()
  const { donnees, chargement, erreur, recharger } = useRessource(getTableauDeBord, [])

  const partir = useCallback(() => deconnexion(), [deconnexion])

  const entete = (
    <header className="profil__tete">
      <span className="profil__avatar">
        <CircleUserRound size={30} strokeWidth={1.6} />
      </span>
      <div className="profil__identite">
        <p className="profil__pseudo">{utilisateur?.pseudo}</p>
        <p className="profil__email">{utilisateur?.email}</p>
      </div>
      <button type="button" onClick={partir} className="profil__sortie">
        <LogOut size={15} strokeWidth={2} />
        Se déconnecter
      </button>
    </header>
  )

  if (erreur) {
    return (
      <Page feed>
        {entete}
        <ErreurChargement erreur={erreur} onReessayer={recharger} />
      </Page>
    )
  }

  if (chargement || !donnees) {
    return (
      <Page feed>
        {entete}
        <Chargement quoi="tes résultats" />
      </Page>
    )
  }

  const { parties, decisions, score, completion, biais, parcours } = donnees
  const scenarios = parcours.filter((p) => p.genre === 'SCENARIO')
  const chemins = parcours.filter((p) => p.genre !== 'SCENARIO')

  return (
    <Page feed>
      {entete}

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">Tes chiffres</h2>
          <ul className="stats">
            <Chiffre valeur={score} libelle="points au total" />
            <Chiffre valeur={parties.fils} libelle="fils joués" />
            <Chiffre valeur={parties.conversations} libelle="conversations" />
            <Chiffre valeur={`${decisions.pourcentage} %`} libelle="de bonnes décisions" />
          </ul>
          <p className="card__note">
            {decisions.correctes} bonnes réponses sur {decisions.total} décisions
            prises.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">Ce qu'il te reste à voir</h2>
          <Jauge Icon={Newspaper} libelle="Publications du fil" valeur={completion.fil} />
          <Jauge
            Icon={MessagesSquare}
            libelle="Conversations"
            valeur={completion.conversations}
          />
        </div>
      </section>

      {scenarios.length > 0 && (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Les scénarios</h2>
            <ul className="parcours">
              {scenarios.map((scenario) => (
                <li key={scenario.slug} className="parcours__item">
                  <span className="parcours__icone">
                    <Route size={16} strokeWidth={2} />
                  </span>
                  <div className="parcours__texte">
                    <p className="parcours__titre">{scenario.titre}</p>
                    <p className="parcours__etat">
                      {scenario.termine
                        ? 'Terminé'
                        : `Étape ${scenario.etape} sur ${scenario.etapes}`}
                    </p>
                  </div>
                  <span className="parcours__pourcentage">{scenario.pourcentage} %</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {chemins.length > 0 && (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Les parcours</h2>
            <ul className="parcours">
              {chemins.map((chemin) => (
                <li key={chemin.slug} className="parcours__item">
                  <span className="parcours__icone">
                    <Trophy size={16} strokeWidth={2} />
                  </span>
                  <div className="parcours__texte">
                    <p className="parcours__titre">{chemin.titre}</p>
                    <p className="parcours__etat">
                      {chemin.termine
                        ? 'Terminé'
                        : `Étape ${chemin.etape} sur ${chemin.etapes}`}
                    </p>
                  </div>
                  <span className="parcours__pourcentage">{chemin.pourcentage} %</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Le seul chiffre vraiment utile : pas « combien », mais « sur quoi ». */}
      {biais.length > 0 && (
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Ce qui te piège le plus</h2>
            <ul className="biais-liste">
              {biais.slice(0, 5).map((entree) => (
                <li key={entree.nom} className="biais-ligne">
                  <div className="biais-ligne__tete">
                    <p className="biais-ligne__nom">{entree.nom}</p>
                    <p className="biais-ligne__score">{entree.reussite} % de réussite</p>
                  </div>
                  {entree.conseil && <p className="biais-ligne__conseil">{entree.conseil}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {donnees.derniereSession && (
        <p className="profil__derniere">
          Dernière partie : {NOM_DU_JEU[donnees.derniereSession.jeu] ?? donnees.derniereSession.jeu}
          {donnees.derniereSession.conversation
            ? ` — ${donnees.derniereSession.conversation.nom}`
            : ''}
          .
        </p>
      )}
    </Page>
  )
}

export default function ProfileScreen() {
  const { connecte } = useCompte()
  return connecte ? <TableauDeBord /> : <Formulaire />
}
