import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Play, Zap, Flame, ShieldQuestion } from 'lucide-react'
import Page from '../components/ui/Page'
import Banniere from '../components/ui/Banniere'
import StoryBar from '../components/StoryBar'
import DailyTip from '../components/DailyTip'
import { PATHS } from '../routes'

// Un chemin (ex. '/ctrl-info.mp4') ou une URL d'intégration, pour remplacer le
// visuel d'attente par la vraie vidéo.
const VIDEO_URL = null

const LEVIERS = [
  {
    Icon: Zap,
    titre: "L'urgence",
    texte: "« Partage avant que ce soit supprimé » : le but est de court-circuiter ta réflexion avant que tu vérifies.",
  },
  {
    Icon: Flame,
    titre: "L'émotion",
    texte: 'La colère et la peur circulent bien plus vite que le doute. Un contenu qui te fait réagir fort mérite une pause.',
  },
  {
    Icon: ShieldQuestion,
    titre: "L'autorité",
    texte: 'Un titre de « docteur », un nom de site sérieux, un logo : la forme suffit souvent à faire passer le fond.',
  },
]

export default function HomeScreen() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <Page seamless>
      {/* En-tête de marque, bord à bord. Le fond animé vient de la bannière
          partagée (ui/Banniere.jsx), commune avec Ressources. */}
      <Banniere className="hero">
        <h1 className="hero__title">CTRL&nbsp;INFO</h1>
        <p className="hero__tagline">
          Reprends le contrôle de ton fil&nbsp;
        </p>
      </Banniere>

      {/* Les stories, juste sous la bannière : c'est la première chose qu'on
          fait défiler sur un réseau social, et c'est là que sont maintenant
          les sites où vérifier une information. */}
      <StoryBar />

      {/* Le corps : une colonne bornée en largeur, espacée des bords. */}
      <div className="home__body">
        <section className="card">
          <div className="card__body">
            <h2 className="card__title">Explication du projet</h2>
            <p className="card__text">
              CTRL INFO est un projet d'éducation aux médias né en
              Nouvelle-Calédonie. Le principe&nbsp;: plutôt que d'expliquer la
              désinformation dans un cours, on te la fait vivre dans un fil
              d'actualité qui ressemble à ceux que tu consultes tous les jours.
            </p>
            <p className="card__text">
              Tu incarnes un compte qui reçoit des publications&nbsp;: certaines
              sont vraies, d'autres fausses, d'autres encore vraies mais sorties
              de leur contexte. À toi de décider quoi en faire — <b>aimer</b>,{' '}
              <b>partager</b> ou <b>signaler</b>.
            </p>
          </div>
        </section>

        {/* Vidéo à gauche, explication à droite. En dessous de 900px, les deux
            blocs s'empilent. */}
        <section className="card split">
          <div>
            <div className="card__body">
              <h2 className="card__title">
                Et tout le monde y croit — La désinformation
              </h2>
            </div>
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
                  <span className="video__play">
                    <Play size={26} fill="var(--brand-blue)" strokeWidth={0} />
                  </span>
                  {videoOpen && (
                    <p className="video__hint">
                      La vidéo sera intégrée ici — renseigne <code>VIDEO_URL</code>{' '}
                      dans <code>src/screens/HomeScreen.jsx</code>.
                    </p>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="card__body">
            <h2 className="card__title">Explication sur la désinformation</h2>
            <p className="card__text">
              Une fausse information ne ressemble presque jamais à une fausse
              information. Elle emprunte de vraies photos, cite de vraies
              personnes, et arrive au moment où elle te touche le plus. Voici les
              trois leviers les plus utilisés.
            </p>

            <ul className="levers">
              {LEVIERS.map(({ Icon, titre, texte }) => (
                <li key={titre} className="lever">
                  <span className="lever__icon">
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="lever__title">{titre}</p>
                    <p className="lever__text">{texte}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="tip">
              <p className="tip__text">
                <b>Le réflexe qui protège le mieux&nbsp;:</b> avant de partager,
                cherche la même information ailleurs. Si aucun autre média n'en
                parle, méfie-toi.
              </p>
            </div>
          </div>
        </section>

        {/* Les deux entrées du site, en fin de page — comme à la fin de
            Ressources, et avec la même carte. Elles étaient dans la bannière,
            avant d'avoir été lues. */}
        <section className="entry-card">
          <h2 className="entry-card__title">Par où commencer</h2>
          <p className="entry-card__text">
            Le fil d'actualité te met en situation tout de suite. Si tu préfères
            savoir avant d'essayer, les ressources se lisent en deux minutes.
          </p>
          <div className="entry-card__actions">
            <Link to={PATHS.feed} className="entry-card__button">
              Jouer au fil d'actualité
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <Link to={PATHS.resources} className="entry-card__link">
              Comprendre d'abord
            </Link>
          </div>
        </section>
      </div>

      <DailyTip />
    </Page>
  )
}
