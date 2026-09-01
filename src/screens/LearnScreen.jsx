import { createElement, useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Search, X } from 'lucide-react'
import { getChapitre, getChapitres } from '../api/contenu'
import { icone } from '../data/icones'
import { correspond } from '../lib/search'
import { useRessource } from '../lib/useRessource'
import { PATHS, chapterPath } from '../routes'
import Banniere from '../components/ui/Banniere'
import Page from '../components/ui/Page'
import ResourcesTabs from '../components/ResourcesTabs'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'

/**
 * L'onglet « Ressources », côté *Comprendre* : la partie lecture du site, là
 * où les jeux font pratiquer.
 *
 * Deux écrans, et deux adresses — c'est le changement : un thème se partage,
 * se met en favori et survit à un rechargement.
 *
 *   1. **la galerie** (`/ressources`) — une recherche en tête, puis une
 *      vignette par thème : son numéro, son titre, quelques lignes de résumé,
 *      et le lien qui mène plus loin ;
 *   2. **le thème** (`/ressources/comprendre/:slug`), avec son texte entier.
 *
 * Tout le texte vient de l'API (`/chapitres`) : il n'y a pas une ligne de
 * contenu dans ce fichier, seulement la mise en page. La galerie ne charge que
 * les résumés ; le corps d'un thème n'arrive qu'à son ouverture.
 */

/**
 * Le nom d'icône rangé en base, dessiné.
 *
 * `createElement` plutôt qu'une variable `Icon` : le dessin est choisi à chaque
 * rendu, et le déclarer comme un composant local ferait remonter le sous-arbre
 * à chaque fois.
 */
function Icone({ nom, size }) {
  return createElement(icone(nom), { size, strokeWidth: 1.9 })
}

/** Le lien de sortie d'un thème : où aller quand la fiche ne suffit pas. */
function LienDAide({ lien, compact = false }) {
  return (
    <a
      href={lien.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`chapitre-lien${compact ? ' chapitre-lien--compact' : ''}`}
    >
      <ExternalLink size={14} strokeWidth={2} />
      {lien.texte}
    </a>
  )
}

/** Une entrée de liste : un surtitre, un titre, un texte, des encadrés. */
function Entree({ entree }) {
  const { surtitre, titre, texte, notes } = entree

  return (
    <li className="entree">
      {surtitre && <p className="entree__surtitre">{surtitre}</p>}
      {titre && <h3 className="entree__titre">{titre}</h3>}
      {texte && <p className="entree__texte">{texte}</p>}

      {notes?.map((note) => (
        <div key={note.label} className="encadre">
          <p className="encadre__label">{note.label}</p>
          <p className="encadre__texte">{note.texte}</p>
        </div>
      ))}
    </li>
  )
}

/** Un bloc de thème. Le genre décide de la mise en page, pas du sujet. */
function Bloc({ bloc }) {
  const { genre, titre, paragraphes, entrees } = bloc

  if (genre === 'CONSEIL') {
    return (
      <div className="conseil">
        <p className="conseil__label">{titre ?? 'Le réflexe'}</p>
        {paragraphes?.map((p) => (
          <p key={p} className="conseil__texte">
            {p}
          </p>
        ))}
      </div>
    )
  }

  if (genre === 'CHIFFRES') {
    return (
      <div className="bloc">
        {titre && <h3 className="bloc__titre">{titre}</h3>}
        <ul className="chiffres">
          {entrees?.map((entree) => (
            <li key={entree.titre} className="chiffre">
              <p className="chiffre__valeur">{entree.titre}</p>
              <p className="chiffre__texte">{entree.texte}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (genre === 'TEXTE') {
    return (
      <div className="bloc">
        {titre && <h3 className="bloc__titre">{titre}</h3>}
        {paragraphes?.map((p) => (
          <p key={p} className="bloc__texte">
            {p}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="bloc">
      {titre && <h3 className="bloc__titre">{titre}</h3>}
      <ul className="entrees">
        {entrees?.map((entree, i) => (
          <Entree key={entree.titre ?? i} entree={entree} />
        ))}
      </ul>
    </div>
  )
}

/**
 * La page d'un thème — son adresse est `/ressources/comprendre/:slug`.
 *
 * Elle n'a pas de sous-onglets : on est dans un thème, pas dans la galerie. Le
 * retour se fait par le lien en tête, ou par le bouton « précédent ».
 */
export function ChapterScreen() {
  const { slug } = useParams()
  const charger = useCallback(() => getChapitre(slug), [slug])
  const { donnees, chargement, erreur, recharger } = useRessource(charger, [slug])

  const retour = (
    <Link to={PATHS.resources} className="chapitre__retour">
      <ArrowLeft size={16} strokeWidth={2.2} />
      Tous les thèmes
    </Link>
  )

  if (erreur) {
    return (
      <Page seamless>
        <div className="learn__body">
          {retour}
          <ErreurChargement erreur={erreur} onReessayer={recharger} />
        </div>
      </Page>
    )
  }

  if (chargement || !donnees) {
    return (
      <Page seamless>
        <div className="learn__body">
          {retour}
          <Chargement quoi="le thème" />
        </div>
      </Page>
    )
  }

  return (
    <Page seamless>
      <article className="chapitre learn__body">
        {retour}

        <header className="chapitre__head">
          <span className="chapitre__badge" style={{ background: donnees.couleur }}>
            <Icone nom={donnees.icone} size={20} />
          </span>
          <p className="chapitre__numero">Thème {donnees.numero}</p>
          <h1 className="chapitre__titre">{donnees.titre}</h1>
          <p className="chapitre__chapo">{donnees.chapo}</p>
        </header>

        <div className="chapitre__corps">
          {donnees.blocs.map((bloc, i) => (
            <Bloc key={i} bloc={bloc} />
          ))}
        </div>

        <footer className="chapitre__pied">
          <p className="chapitre__pied-titre">Pour aller plus loin</p>
          <LienDAide lien={donnees.lien} />
        </footer>
      </article>
    </Page>
  )
}

export default function LearnScreen() {
  const [query, setQuery] = useState('')
  const { donnees, chargement, erreur, recharger } = useRessource(getChapitres, [])

  const chapitres = useMemo(() => donnees ?? [], [donnees])

  const resultats = useMemo(
    () =>
      chapitres.filter((chapitre) =>
        correspond(query, `${chapitre.titre} ${chapitre.onglet} ${chapitre.resume}`)
      ),
    [chapitres, query]
  )

  return (
    <Page seamless>
      {/* Bandeau d'entrée : la même bannière que l'accueil, fond animé
          compris (ui/Banniere.jsx). */}
      <Banniere className="learn-hero">
        <p className="learn-hero__eyebrow">Ressources</p>
        <h1 className="learn-hero__title">Ce qu'il faut savoir avant de partager</h1>
        <p className="learn-hero__lead">
          Huit thèmes courts. Chacun se lit en deux minutes et mène vers un site
          qui va plus loin.
        </p>
      </Banniere>

      <div className="learn__body">
        <ResourcesTabs />

        {/* La recherche en premier : c'est la porte d'entrée de l'onglet. */}
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un thème — le complotisme, les biais…"
            aria-label="Chercher un thème"
            className="search-field__input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {erreur ? (
          <ErreurChargement erreur={erreur} onReessayer={recharger} />
        ) : chargement ? (
          <Chargement quoi="les thèmes" />
        ) : resultats.length === 0 ? (
          <div className="empty-result">
            <p className="empty-result__title">Aucun thème ne correspond</p>
            <p className="empty-result__text">Essaie un autre mot-clé.</p>
          </div>
        ) : (
          <ul className="themes">
            {resultats.map((chapitre) => (
              <li key={chapitre.id} className="theme">
                <Link
                  to={chapterPath(chapitre.id)}
                  aria-label={`Ouvrir le thème « ${chapitre.titre} »`}
                  className="theme__ouvrir"
                >
                  <span className="theme__badge" style={{ background: chapitre.couleur }}>
                    <Icone nom={chapitre.icone} size={19} />
                  </span>
                  <span className="theme__numero">{chapitre.numero}</span>
                  <span className="theme__titre">{chapitre.titre}</span>
                  <span className="theme__resume">{chapitre.resume}</span>
                  <span className="theme__lire">
                    Lire le thème
                    <ArrowRight size={14} strokeWidth={2.2} />
                  </span>
                </Link>

                {/* Hors du lien : un lien dans un lien n'est pas valide, et le
                    clavier s'y perd. */}
                <LienDAide lien={chapitre.lien} compact />
              </li>
            ))}
          </ul>
        )}

        <section className="learn-fin">
          <h2 className="learn-fin__titre">À toi de jouer</h2>
          <p className="learn-fin__texte">
            Lire, c'est bien. Se faire piéger pour de faux, c'est mieux : le
            fil d'actualité reprend tout ce qui précède, mais en situation.
          </p>
          <div className="learn-fin__boutons">
            <Link to={PATHS.feed} className="learn-fin__bouton">
              Ouvrir le fil d'actualité
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <Link to={PATHS.verify} className="learn-cta">
              <BookOpen size={16} strokeWidth={2} />
              Où vérifier une info
            </Link>
          </div>
        </section>
      </div>
    </Page>
  )
}
