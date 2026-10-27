import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Search, X } from 'lucide-react'
import { getChapitre, getChapitres } from '../api/contenu'
import { icone } from '../data/icones'
import { correspond } from '../lib/search'
import { useRessource } from '../lib/useRessource'
import { PATHS, chapterPath } from '../routes'
import Banniere from '../components/ui/Banniere'
import Page from '../components/ui/Page'
import { FilsRouges } from '../components/TableauEnquete'
import { useFilRouge } from '../lib/useFilRouge'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'

function Icone({ nom, size }) {
  return createElement(icone(nom), { size, strokeWidth: 1.9 })
}

function repere(surtitre, rang) {
  if (!surtitre) return `Pièce n° ${rang}`
  return /^\d+$/.test(surtitre) ? `Pièce n° ${surtitre}` : surtitre
}

function Coupures({ notes }) {
  return notes?.map((note) => (
    <div key={note.label} className="coupure">
      <p className="coupure__label">{note.label}</p>
      <p className="coupure__texte">{note.texte}</p>
    </div>
  ))
}

function Piece({ entree, rang, epingle }) {
  const { surtitre, titre, texte, notes } = entree

  return (
    <li ref={epingle} className="note-dossier">
      <span className="punaise" aria-hidden="true" />
      <p className="note-dossier__repere">{repere(surtitre, rang)}</p>
      {titre && <h3 className="note-dossier__titre">{titre}</h3>}
      {texte && <p className="note-dossier__texte">{texte}</p>}
      <Coupures notes={notes} />
    </li>
  )
}

function Illustration({ image, legende, picto }) {
  if (!image && !picto) return null

  return (
    <figure className={image ? 'bloc__figure bloc__figure--photo' : 'bloc__figure'}>
      {image ? (
        <img src={image} alt={legende ?? ''} loading="lazy" className="bloc__image" />
      ) : (
        <span className="bloc__picto">{createElement(icone(picto), { size: 26 })}</span>
      )}
      {legende && <figcaption className="bloc__legende">{legende}</figcaption>}
    </figure>
  )
}

function Bloc({ bloc, id, epingler }) {
  const { genre, titre, paragraphes, entrees, image, legende, picto } = bloc

  if (genre === 'CONSEIL') {
    return (
      <div ref={epingler(id)} className="conseil">
        <span className="punaise punaise--grande" aria-hidden="true" />
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
        <ul className="scelles">
          {entrees?.map((entree, i) => (
            <li key={entree.titre} className="scelle">
              <p className="scelle__numero">Scellé n° {i + 1}</p>
              <p className="scelle__valeur">{entree.titre}</p>
              <p className="scelle__texte">{entree.texte}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (genre === 'TEXTE') {
    return (
      <div className="rapport papier">
        <span className="papier__ruban" aria-hidden="true" />
        <p className="rapport__label">{titre ?? "Rapport d'enquête"}</p>
        <Illustration image={image} legende={legende} picto={picto} />
        {paragraphes?.map((p) => (
          <p key={p} className="rapport__texte">
            {p}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="bloc">
      {titre && <h3 className="bloc__titre">{titre}</h3>}
      <Illustration image={image} legende={legende} picto={picto} />
      <ol className="notes-dossier">
        {entrees?.map((entree, i) => (
          <Piece
            key={entree.titre ?? i}
            entree={entree}
            rang={i + 1}
            epingle={epingler(`${id}-${i}`)}
          />
        ))}
      </ol>
    </div>
  )
}

function Tableau({ blocs }) {
  const { tableau, epingler, fils } = useFilRouge({ enChaine: true })

  return (
    <div ref={tableau} className="chapitre__tableau">
      <FilsRouges fils={fils} />
      {blocs.map((bloc, i) => (
        <Bloc key={i} id={`b${i}`} bloc={bloc} epingler={epingler} />
      ))}
    </div>
  )
}

function Couverture({ chapitre }) {
  const pieces = chapitre.blocs
    .filter((bloc) => bloc.genre === 'LISTE')
    .reduce((total, bloc) => total + (bloc.entrees?.length ?? 0), 0)

  return (
    <header className="chemise" style={{ '--dossier': chapitre.couleur }}>
      {chapitre.onglet && <p className="chemise__onglet">{chapitre.onglet}</p>}
      <div className="chemise__couverture">
        <span className="chemise__icone" aria-hidden="true">
          <Icone nom={chapitre.icone} />
        </span>
        <p className="tampon chemise__tampon">Dossier n° {chapitre.numero}</p>
        <h1 className="chemise__titre">{chapitre.titre}</h1>
        <p className="chemise__chapo">{chapitre.chapo}</p>
        <p className="chemise__meta">
          {pieces > 0 && `${pieces} pièces au dossier · `}Lecture 2 min
        </p>
      </div>
    </header>
  )
}

function Suite({ chapitre }) {
  const { donnees: chapitres } = useRessource(getChapitres, [])
  const rang = chapitres?.findIndex((c) => c.id === chapitre.id) ?? -1
  const suivant = rang >= 0 && chapitres.length > 1 ? chapitres[(rang + 1) % chapitres.length] : null

  return (
    <footer className="chapitre__pied">
      <p className="chapitre__pied-titre">Poursuivre l'enquête</p>
      <a
        href={chapitre.lien.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bouton bouton--petit chapitre-lien"
      >
        <ExternalLink size={14} strokeWidth={2} />
        {chapitre.lien.texte}
      </a>

      {suivant && (
        <Link
          to={chapterPath(suivant.id)}
          className="dossier-suivant"
          style={{ '--dossier': suivant.couleur }}
        >
          <span className="dossier-suivant__texte">
            <span className="dossier-suivant__numero">Dossier suivant · n° {suivant.numero}</span>
            <span className="dossier-suivant__titre">{suivant.titre}</span>
          </span>
          <span className="bouton__pastille">
            <ArrowRight size={18} strokeWidth={2.2} />
          </span>
        </Link>
      )}
    </footer>
  )
}

export function ChapterScreen() {
  const { slug } = useParams()
  const page = useRef(null)
  const charger = useCallback(() => getChapitre(slug), [slug])
  const { donnees, chargement, erreur, recharger } = useRessource(charger, [slug])

  useEffect(() => {
    page.current?.scrollTo(0, 0)
  }, [slug])

  const retour = (
    <Link to={PATHS.resources} className="bouton bouton--petit chapitre__retour">
      <ArrowLeft size={16} strokeWidth={2.2} />
      Tous les dossiers
    </Link>
  )

  if (erreur) {
    return (
      <Page ref={page} seamless>
        <div className="learn__body">
          {retour}
          <ErreurChargement erreur={erreur} onReessayer={recharger} />
        </div>
      </Page>
    )
  }

  if (chargement || !donnees) {
    return (
      <Page ref={page} seamless>
        <div className="learn__body">
          {retour}
          <Chargement quoi="le dossier" />
        </div>
      </Page>
    )
  }

  return (
    <Page ref={page} seamless>
      <article className="chapitre learn__body">
        {retour}
        <Couverture chapitre={donnees} />
        <Tableau key={slug} blocs={donnees.blocs} />
        <Suite chapitre={donnees} />
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
      <Banniere className="learn-hero">
        <p className="etiquette learn-hero__eyebrow">Ressources</p>
        <h1 className="learn-hero__title">Ce qu'il faut savoir avant de partager.</h1>
        <p className="learn-hero__lead">
          Huit thèmes courts. Chacun se lit en deux minutes et mène vers un site
          qui va plus loin.
        </p>
      </Banniere>

      <div className="learn__body">
        <div className="search-field">
          <Search size={19} strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un thème: le complotisme, les biais…"
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
              <li key={chapitre.id}>
                <Link
                  to={chapterPath(chapitre.id)}
                  aria-label={`Ouvrir le thème « ${chapitre.titre} »`}
                  className="theme"
                  style={{ background: chapitre.couleur }}
                >
                  {chapitre.couverture ? (
                    <img
                      src={chapitre.couverture}
                      alt=""
                      loading="lazy"
                      className="theme__image"
                    />
                  ) : (
                    <span className="theme__icone">
                      <Icone nom={chapitre.icone} />
                    </span>
                  )}

                  <span className="theme__voile">
                    <span className="theme__numero">Dossier n° {chapitre.numero}</span>
                    <span className="theme__titre">{chapitre.titre}</span>
                    <span className="theme__plus">Lire · 2 min →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="entry-card">
          <h2 className="entry-card__title">À toi de jouer</h2>
          <p className="entry-card__text">
            Lire, c'est bien. Se faire piéger pour de faux, c'est mieux : le
            fil d'actualité reprend tout ce qui précède, mais en situation.
          </p>
          <div className="entry-card__actions">
            <Link to={PATHS.feed} className="bouton bouton--plein">
              Ouvrir le fil d'actualité
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <Link to={PATHS.home} className="bouton">
              <BookOpen size={16} strokeWidth={2} />
              Où vérifier une info
            </Link>
          </div>
        </section>
      </div>
    </Page>
  )
}
