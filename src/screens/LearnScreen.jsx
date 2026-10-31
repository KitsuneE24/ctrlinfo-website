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
import Riche from '../components/ui/Riche'
import { lienWeb } from '../lib/lienWeb'

function Icone({ nom, size }) {
  return createElement(icone(nom), { size, strokeWidth: 1.9 })
}

function repere(surtitre, rang, lettre) {
  if (lettre) return `Pièce ${lettre}${rang}`
  if (!surtitre) return `Pièce n° ${rang}`
  return /^\d+$/.test(surtitre) ? `Pièce n° ${surtitre}` : surtitre
}

function LienSource({ source }) {
  if (!lienWeb(source?.url)) return null
  return (
    <p className="source-lien">
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        Source : {source.texte}
        <span className="pour-lecteur"> (nouvel onglet)</span>
      </a>
    </p>
  )
}

function Sources({ sources }) {
  return sources?.map((source) => <LienSource key={source.url} source={source} />)
}

function LienOutil({ lien }) {
  if (!lienWeb(lien?.url)) return null
  return (
    <a href={lien.url} target="_blank" rel="noopener noreferrer" className="bouton bouton--encre bouton--petit note-dossier__outil">
      <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
      {lien.texte}
      <span className="pour-lecteur"> (nouvel onglet)</span>
    </a>
  )
}

function Coupures({ notes }) {
  return notes?.map((note) => (
    <div key={note.label} className="coupure">
      <p className="coupure__label">{note.label}</p>
      <p className="coupure__texte"><Riche texte={note.texte} /></p>
      {lienWeb(note.source?.url) && (
        <p className="coupure__source">
          <a href={note.source.url} target="_blank" rel="noopener noreferrer">
            Source : {note.source.texte}
          </a>
        </p>
      )}
    </div>
  ))
}

// Même source pour toutes les pièces : on la cite une fois, en fin de partie.
function sourceCommune(entrees = []) {
  const url = entrees[0]?.source?.url
  return url && entrees.length > 1 && entrees.every((e) => e.source?.url === url) ? entrees[0].source : null
}

function Piece({ entree, rang, lettre, epingle, Titre = 'h2', sansSource = false }) {
  const { surtitre, titre, texte, notes, lien } = entree
  const source = sansSource ? null : entree.source

  return (
    <li ref={epingle} className="note-dossier">
      <span className="punaise" aria-hidden="true" />
      <p className="note-dossier__repere">{repere(surtitre, rang, lettre)}</p>
      {titre && <Titre className="note-dossier__titre">{titre}</Titre>}
      {texte && <p className="note-dossier__texte"><Riche texte={texte} /></p>}
      <LienOutil lien={lien} />
      <LienSource source={source} />
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

function Partie({ lettre, titre, nombre, children }) {
  if (!lettre) return children
  return (
    <section id={`partie-${lettre}`} aria-labelledby={`partie-${lettre}-titre`} className="partie">
      <header className="partie__intercalaire">
        <span className="partie__onglet">Partie {lettre}</span>
        <h2 id={`partie-${lettre}-titre`} className="partie__titre">{titre}</h2>
        <span className="partie__compte">
          {nombre} pièce{nombre > 1 ? 's' : ''}
        </span>
      </header>
      {children}
    </section>
  )
}

function SourcePartie({ source }) {
  if (!lienWeb(source?.url)) return null
  return (
    <p className="source-partie">
      <span className="source-partie__label">Source des pièces</span>
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {source.texte}
        <span className="pour-lecteur"> (nouvel onglet)</span>
      </a>
    </p>
  )
}

function Bloc({ bloc, id, lettre, epingler }) {
  const { genre, titre, paragraphes, entrees, image, legende, picto, sources } = bloc
  const commune = sourceCommune(entrees)

  if (genre === 'CONSEIL') {
    return (
      <div ref={epingler(id, { groupe: id })} className="conseil">
        <span className="punaise punaise--grande" aria-hidden="true" />
        <p className="conseil__label">{titre ?? 'Le réflexe'}</p>
        {paragraphes?.map((p) => (
          <p key={p} className="conseil__texte">
            <Riche texte={p} />
          </p>
        ))}
        <Sources sources={sources} />
      </div>
    )
  }

  if (genre === 'CHIFFRES') {
    return (
      <Partie lettre={lettre} titre={titre} nombre={entrees?.length ?? 0}>
        <div className="bloc">
          {titre && !lettre && <h2 className="bloc__titre">{titre}</h2>}
          <ul className="scelles">
            {entrees?.map((entree, i) => (
              <li key={entree.titre} className="scelle">
                <p className="scelle__numero">Scellé {lettre ? `${lettre}${i + 1}` : `n° ${i + 1}`}</p>
                <p className="scelle__valeur">{entree.titre}</p>
                <p className="scelle__texte"><Riche texte={entree.texte} /></p>
                {!commune && <LienSource source={entree.source} />}
              </li>
            ))}
          </ul>
          <SourcePartie source={commune} />
        </div>
      </Partie>
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
            <Riche texte={p} />
          </p>
        ))}
        <Sources sources={sources} />
      </div>
    )
  }

  return (
    <Partie lettre={lettre} titre={titre} nombre={entrees?.length ?? 0}>
      <div className="bloc">
        {titre && !lettre && <h2 className="bloc__titre">{titre}</h2>}
        <Illustration image={image} legende={legende} picto={picto} />
        <ol className="notes-dossier">
          {entrees?.map((entree, i) => (
            <Piece
              key={entree.titre ?? i}
              entree={entree}
              rang={i + 1}
              lettre={lettre}
              epingle={epingler(`${id}-${i}`, { groupe: id })}
              Titre={titre ? 'h3' : 'h2'}
              sansSource={Boolean(commune)}
            />
          ))}
        </ol>
        <SourcePartie source={commune} />
      </div>
    </Partie>
  )
}

const LETTRES = 'ABCDEFGHIJ'

// Plusieurs parties titrées : chacune reçoit une lettre et son intercalaire.
function lettresDes(blocs) {
  const titrees = blocs.filter((b) => b.titre && b.genre !== 'CONSEIL' && b.genre !== 'TEXTE')
  if (titrees.length < 2) return blocs.map(() => null)
  return blocs.map((b) => (titrees.includes(b) ? LETTRES[titrees.indexOf(b)] : null))
}

function Sommaire({ blocs, lettres }) {
  const parties = blocs.map((bloc, i) => ({ bloc, lettre: lettres[i] })).filter((p) => p.lettre)
  if (parties.length === 0) return null

  return (
    <nav aria-label="Sommaire du dossier" className="sommaire papier">
      <span className="papier__ruban" aria-hidden="true" />
      <p className="sommaire__titre">Sommaire du dossier</p>
      <ol className="sommaire__liste">
        {parties.map(({ bloc, lettre }) => (
          <li key={lettre}>
            <a href={`#partie-${lettre}`} className="sommaire__lien">
              <span className="sommaire__lettre">{lettre}</span>
              <span className="sommaire__nom">{bloc.titre}</span>
              <span className="sommaire__compte">{bloc.entrees?.length ?? 0}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Tableau({ blocs }) {
  const { tableau, epingler, fils } = useFilRouge({ enChaine: true })
  const lettres = lettresDes(blocs)

  return (
    <>
      <Sommaire blocs={blocs} lettres={lettres} />
      <div ref={tableau} className="chapitre__tableau">
        <FilsRouges fils={fils} />
        {blocs.map((bloc, i) => (
          <Bloc key={i} id={`b${i}`} bloc={bloc} lettre={lettres[i]} epingler={epingler} />
        ))}
      </div>
    </>
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
        <p className="chemise__chapo"><Riche texte={chapitre.chapo} /></p>
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
      {lienWeb(chapitre.lien?.url) && (
        <a
          href={chapitre.lien.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bouton bouton--petit chapitre-lien"
        >
          <ExternalLink size={14} strokeWidth={2} />
          {chapitre.lien.texte}
        </a>
      )}

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
          Des dossiers courts, chacun lisible en deux minutes, avec des cas réels
          et leurs sources.
        </p>
      </Banniere>

      <div className="learn__body">
        <div className="search-field">
          <Search size={19} strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un thème : le complotisme, les biais…"
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
            <p className="empty-result__text">Essayez un autre mot-clé.</p>
          </div>
        ) : (
          <ul className="themes">
            {resultats.map((chapitre) => (
              <li key={chapitre.id}>
                <Link
                  to={chapterPath(chapitre.id)}
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
          <h2 className="entry-card__title">À vous de jouer</h2>
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
