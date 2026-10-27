import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Flag, Heart, Play, Send } from 'lucide-react'
import Page from '../components/ui/Page'
import Banniere from '../components/ui/Banniere'
import Filaments from '../components/ui/Filaments'
import StoryBar from '../components/StoryBar'
import TableauEnquete from '../components/TableauEnquete'
import DailyTip from '../components/DailyTip'
import { PATHS } from '../routes'

// Chemin ou URL de la vidéo (null : visuel d'attente).
const VIDEO_URL = null

const INSTAGRAM_URL = 'https://www.instagram.com/planke_nc'

// Clichés glissés sous la photo Instagram.
const CLICHES_DESSOUS = ['/planke/chut.jpg', '/planke/collection.jpg']

const LEVIERS = [
  {
    id: 'urgence',
    titre: "L'urgence",
    texte: "« Partage avant que ce soit supprimé » : le but est de court-circuiter votre réflexion avant que vous vérifiiez.",
    rotation: -2,
  },
  {
    id: 'emotion',
    titre: "L'émotion",
    texte: 'La colère et la peur circulent bien plus vite que le doute. Un contenu qui vous fait réagir fortement mérite une pause.',
    rotation: 1.5,
  },
  {
    id: 'autorite',
    titre: "L'autorité",
    texte: 'Un titre de « docteur », un nom de site sérieux, un logo : la forme suffit souvent à faire passer le fond.',
    rotation: -1.5,
  },
]

/** Intitulé numéroté d'une zone du tableau. */
function Zone({ numero, children, bleu = false, className = '' }) {
  return (
    <p className={`tableau__zone${bleu ? ' tableau__zone--bleu' : ''} ${className}`.trim()}>
      <span className="tableau__zone-numero">{numero}</span>
      {children}
    </p>
  )
}

/** Accueil : bandeau, stories, tableau d'enquête (1 sujet, 2 pièges, 3 principe, 4 parade). */
export default function HomeScreen() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <Page seamless>
      <Banniere className="hero">
        <div className="hero__contenu">
          <p className="etiquette hero__etiquette">
            Éducation aux médias
          </p>
          <h1 className="hero__title">
            Reprenez le contrôle de <em>votre fil.</em>
          </h1>
          <p className="hero__tagline">
            Un fil d'actualité comme le vôtre. Certaines infos sont vraies,
            d'autres fausses, d'autres sorties de leur contexte.
          </p>
          <div className="hero__actions">
            <Link to={PATHS.feed} className="bouton bouton--plein bouton--pastille">
              Jouer au fil d'actualité
              <span className="bouton__pastille">
                <ArrowRight size={18} strokeWidth={2.4} />
              </span>
            </Link>
            <Link to={PATHS.resources} className="bouton hero__second">
              Comprendre d'abord
            </Link>
          </div>
        </div>
      </Banniere>

      <StoryBar />

      <section aria-labelledby="dossier-titre" className="dossier">
        <div className="dossier__tete">
          <div className="dossier__intro">
            <p className="etiquette dossier__etiquette">Le dossier</p>
            <h2 id="dossier-titre" className="dossier__titre">
              Tout part d'un même point.
            </h2>
            <p className="dossier__texte">
              CTRL INFO est un projet d'éducation aux médias développé en
              Nouvelle-Calédonie&nbsp;: plutôt que de vous expliquer la
              désinformation dans un cours, on vous la fait vivre.
            </p>
          </div>
        </div>

        <TableauEnquete>
          {(epingler) => (
            <>
              <Zone numero={1} className="tableau__zone--sujet">Le sujet</Zone>
              <Zone numero={2} className="tableau__zone--pieges">Comment elle vous piège</Zone>
              <Zone numero={3} className="tableau__zone--principe">Le principe</Zone>

              <div
                ref={epingler('sujet')}
                className="papier piece piece--sujet"
                style={{ '--rotation': '-1deg' }}
              >
                <span className="punaise punaise--grande" />
                <span className="tampon tampon--papier">La désinformation</span>
                <p className="piece__phrase piece__phrase--grande">
                  Elle ne ressemble presque jamais à une fake news.
                </p>
                <p className="piece__texte">
                  Elle emprunte de vraies photos, cite de vraies personnes, et
                  arrive au moment où elle aura le plus d'impact.
                </p>
              </div>

              {/* 2 — Les pièges */}
              {LEVIERS.map(({ id, titre, texte, rotation }, i) => (
                <div
                  key={id}
                  ref={epingler(id, { vers: 'sujet' })}
                  className={`papier piece piece--levier piece--${id}`}
                  style={{ '--rotation': `${rotation}deg` }}
                >
                  <span className="punaise" />
                  <p className="piece__tete">
                    <span className="piece__numero">0{i + 1}</span>
                    {titre}
                  </p>
                  <p className="piece__texte">{texte}</p>
                </div>
              ))}

              {/* 3 — Le principe et la vidéo */}
              <div
                ref={epingler('principe', { vers: 'sujet' })}
                className="papier piece piece--journal"
                style={{ '--rotation': '2.5deg' }}
              >
                <span className="punaise" />
                <p className="piece__manchette">
                  <span>Le principe</span>
                  <span className="piece__manchette-date">CTRL INFO</span>
                </p>
                <p className="piece__phrase">On ne vous l'explique pas&nbsp;: on vous la fait vivre.</p>
                <p className="piece__texte">
                  Vous incarnez un compte qui reçoit des posts&nbsp;:
                  certains sont vrais, d'autres faux, d'autres vrais mais
                  sortis de leur contexte.
                </p>
              </div>

              <div
                ref={epingler('video', { vers: 'sujet' })}
                className="papier piece piece--video"
                style={{ '--rotation': '-2deg' }}
              >
                <span className="punaise" />
                <div className="video">
                  {videoOpen && VIDEO_URL ? (
                    <video src={VIDEO_URL} controls autoPlay className="video__player" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVideoOpen(true)}
                      className="video__poster"
                      aria-label="Lire la vidéo de présentation"
                    >
                      <Filaments forme="wide" className="filaments--couvre" />
                      <span className="video__play">
                        <Play size={20} fill="currentColor" strokeWidth={0} />
                      </span>
                      {videoOpen && (
                        <span className="video__hint">
                          La vidéo sera intégrée ici — renseigne <code>VIDEO_URL</code>{' '}
                          dans <code>src/screens/HomeScreen.jsx</code>.
                        </span>
                      )}
                    </button>
                  )}
                </div>
                <p className="piece__phrase">Et tout le monde y croit</p>
              </div>

              <a
                ref={epingler('instagram', { vers: 'sujet' })}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="piece piece--cliche"
                style={{ '--rotation': '3deg' }}
                aria-label="Nous suivre sur Instagram : @planke_nc (nouvel onglet)"
              >
                {CLICHES_DESSOUS.map((src, i) => (
                  <img key={src} src={src} alt="" className={`cliche__dessous cliche__dessous--${i + 1}`} />
                ))}
                <span className="cliche__cadre">
                  <span className="punaise" />
                  <img
                    src="/planke/escalier.jpg"
                    alt="Les personnages Planké assis sur des marches, sous un néon rouge"
                    className="cliche__photo"
                  />
                  <span className="cliche__legende">
                    @planke_nc
                    <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
                  </span>
                </span>
              </a>

              {/* 4 — La parade */}
              <div className="tableau__parade">
                <Zone numero={4} bleu className="tableau__zone--parade">La parade</Zone>
                <div className="tableau__parade-notes">
                  <div
                    ref={epingler('reflexe', { vers: 'sujet' })}
                    className="piece piece--reflexe"
                    style={{ '--rotation': '-1.5deg' }}
                  >
                    <span className="punaise" />
                    <p className="etiquette piece__etiquette">Le réflexe</p>
                    <p className="piece__phrase">
                      Avant de partager, cherchez la même info ailleurs. Si aucun
                      autre média n'en parle, méfiez-vous.
                    </p>
                  </div>

                  <div
                    ref={epingler('jouer', { vers: 'reflexe', pointille: true })}
                    className="piece piece--jouer"
                    style={{ '--rotation': '1.5deg' }}
                  >
                    <span className="punaise" />
                    <p className="etiquette piece__etiquette">À vous de jouer</p>
                    <p className="piece__phrase">Aimer, partager ou signaler&nbsp;: vous tranchez.</p>
                    <ul className="piece__gestes" aria-label="Les trois gestes du jeu">
                      <li><Heart size={19} strokeWidth={1.8} aria-label="J'aime" /></li>
                      <li><Send size={19} strokeWidth={1.8} aria-label="Partager" /></li>
                      <li><Flag size={19} strokeWidth={1.8} aria-label="Signaler" /></li>
                    </ul>
                    <Link to={PATHS.feed} className="bouton bouton--plein bouton--large">
                      Ouvrir le fil d'actualité
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </TableauEnquete>
      </section>

      {/* Fin de page, téléphone seulement. */}
      <section className="home__fin">
        <Link to={PATHS.resources} className="bouton bouton--large">
          Comprendre d'abord
        </Link>
      </section>

      <DailyTip />
    </Page>
  )
}
