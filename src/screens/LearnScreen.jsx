import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Quote } from 'lucide-react'
import Banniere from '../components/ui/Banniere'
import Page from '../components/ui/Page'
import {
  BIAIS,
  BULLE,
  CAS,
  CHAPITRES,
  CHIFFRES,
  FAMILLES,
  MOTEURS,
  OUTILS_DE_VERIF,
  QUESTIONS,
  ROUAGES,
  SIGNAUX,
} from '../data/learn'

/**
 * Onglet « Comprendre » : la partie lecture du site, là où les jeux font
 * pratiquer.
 *
 * Huit chapitres à la file, précédés d'un sommaire collant qui suit la
 * lecture. Le sommaire et les sections lisent la même liste (`CHAPITRES`) et
 * ne peuvent donc pas se désaccorder.
 *
 * Tout le texte vit dans src/data/learn.js — ici, il n'y a que la mise en
 * page.
 */

/** L'encadré « à retenir », commun à plusieurs chapitres. */
function Conseil({ label = 'Le réflexe', children }) {
  return (
    <div className="tip conseil">
      <p className="conseil__label">{label}</p>
      <p className="tip__text">{children}</p>
    </div>
  )
}

function Chapitre({ chapitre, enregistrer, children }) {
  const { id, numero, Icon, titre, chapo } = chapitre

  return (
    <section
      ref={(el) => enregistrer(id, el)}
      data-chapitre={id}
      aria-labelledby={`titre-${id}`}
      className="chapitre"
    >
      <header className="chapitre__head">
        <span className="chapitre__badge">
          <Icon size={19} strokeWidth={1.9} />
        </span>
        <div className="chapitre__intro">
          <p className="chapitre__numero">Chapitre {numero}</p>
          <h2 id={`titre-${id}`} className="chapitre__titre">
            {titre}
          </h2>
          <p className="chapitre__chapo">{chapo}</p>
        </div>
      </header>

      <div className="chapitre__corps">{children}</div>
    </section>
  )
}

/** Les en-têtes, indexés par identifiant, pour aller les chercher un à un. */
const PAR_ID = Object.fromEntries(CHAPITRES.map((c) => [c.id, c]))

export default function LearnScreen({ onNavigate }) {
  // La zone défilante, pour le sommaire et l'observateur : c'est elle qui
  // défile, pas la fenêtre.
  const pageRef = useRef(null)
  const sections = useRef({})
  const [actif, setActif] = useState(CHAPITRES[0].id)

  // Stable : sans `useCallback`, chaque rendu détacherait puis rattacherait
  // les références de toutes les sections.
  const enregistrer = useCallback((id, el) => {
    sections.current[id] = el
  }, [])

  // Le sommaire suit la lecture : le chapitre allumé est le premier qui
  // traverse la bande centrale de l'écran.
  useEffect(() => {
    const racine = pageRef.current
    if (!racine) return

    const observateur = new IntersectionObserver(
      (entrees) => {
        const visibles = entrees
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibles.length > 0) setActif(visibles[0].target.dataset.chapitre)
      },
      { root: racine, rootMargin: '-30% 0px -55% 0px' }
    )

    Object.values(sections.current).forEach((el) => {
      if (el) observateur.observe(el)
    })
    return () => observateur.disconnect()
  }, [])

  function allerAu(id) {
    sections.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Page ref={pageRef} seamless>
      {/* Bandeau d'entrée : la même bannière que l'accueil, fond animé
          compris (ui/Banniere.jsx). */}
      <Banniere className="learn-hero">
        <p className="learn-hero__eyebrow">Comprendre</p>
        <h1 className="learn-hero__title">
          Ce qu'il faut savoir avant de partager
        </h1>
        <p className="learn-hero__lead">
          Comment une fausse information se fabrique, pourquoi elle rapporte de
          l'argent, à quoi elle s'accroche dans ta tête — et les quelques
          secondes qui suffisent à ne pas tomber dedans.
        </p>
        <p className="learn-hero__meta">
          {CHAPITRES.length} chapitres · une dizaine de minutes de lecture
        </p>
      </Banniere>

      {/* Sommaire collant : il reste en haut pendant toute la lecture. */}
      <nav aria-label="Sommaire" className="learn-toc">
        <div className="learn-toc__inner no-scrollbar">
          {CHAPITRES.map(({ id, numero, onglet }) => (
            <button
              key={id}
              type="button"
              onClick={() => allerAu(id)}
              aria-current={actif === id ? 'true' : undefined}
              className={`learn-toc__chip${
                actif === id ? ' learn-toc__chip--active' : ''
              }`}
            >
              <span className="learn-toc__num">{numero}</span>
              {onglet}
            </button>
          ))}
        </div>
      </nav>

      <div className="learn__body">
        {/* --- 01 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.familles} enregistrer={enregistrer}>
          <ol className="familles">
            {FAMILLES.map(({ id, titre, texte, exemple, piege }, i) => (
              <li key={id} className="famille">
                <p className="famille__rang">{i + 1}</p>
                <h3 className="famille__titre">{titre}</h3>
                <p className="famille__texte">{texte}</p>

                {exemple && (
                  <div className="encadre encadre--cas">
                    <p className="encadre__label">Cas réel</p>
                    <p className="encadre__texte">{exemple}</p>
                  </div>
                )}

                {piege && (
                  <div className="encadre encadre--piege">
                    <p className="encadre__label">Le piège</p>
                    <p className="encadre__texte">{piege}</p>
                  </div>
                )}
              </li>
            ))}
          </ol>

          <Conseil label="À retenir">
            Avant de croire une info qui te choque, demande-toi de quelle
            famille elle relève. Inventée&nbsp;? Déplacée&nbsp;? Faite pour le
            clic&nbsp;? Ou juste une blague qui a mal tourné&nbsp;?
          </Conseil>
        </Chapitre>

        {/* --- 02 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.argent} enregistrer={enregistrer}>
          <ul className="chiffres">
            {CHIFFRES.map(({ valeur, texte }) => (
              <li key={valeur} className="chiffre">
                <p className="chiffre__valeur">{valeur}</p>
                <p className="chiffre__texte">{texte}</p>
              </li>
            ))}
          </ul>

          <ul className="rouages">
            {ROUAGES.map((texte) => (
              <li key={texte} className="rouage">
                {texte}
              </li>
            ))}
          </ul>

          <Conseil label="À retenir">
            Un titre qui te met une claque — peur, colère, indignation — a
            peut-être été calibré pour ça. Le clic est le carburant de la
            désinformation. Pose-toi la seule question qui compte&nbsp;:{' '}
            <b>à qui profite mon clic&nbsp;?</b>
          </Conseil>
        </Chapitre>

        {/* --- 03 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.propagation} enregistrer={enregistrer}>
          <div className="duo">
            {MOTEURS.map(({ id, titre, texte, conseil }) => (
              <article key={id} className="moteur">
                <h3 className="moteur__titre">{titre}</h3>
                <p className="moteur__texte">{texte}</p>
                <Conseil>{conseil}</Conseil>
              </article>
            ))}
          </div>
        </Chapitre>

        {/* --- 04 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.reflexe} enregistrer={enregistrer}>
          <ol className="questions">
            {QUESTIONS.map(({ question, texte }, i) => (
              <li key={question} className="question">
                <span className="question__num">{i + 1}</span>
                <div>
                  <p className="question__titre">{question}</p>
                  <p className="question__texte">{texte}</p>
                </div>
              </li>
            ))}
          </ol>

          <Conseil label="À retenir">
            Dix secondes, quatre questions. Ce petit réflexe suffit à éviter la
            grande majorité des pièges.
          </Conseil>

          <div className="duo duo--serre">
            {OUTILS_DE_VERIF.map(({ id, titre, texte, encadre }) => (
              <article key={id} className="moteur">
                <h3 className="moteur__titre">{titre}</h3>
                <p className="moteur__texte">{texte}</p>
                <div className="encadre encadre--cas">
                  <Quote size={14} strokeWidth={2} className="encadre__icone" />
                  <p className="encadre__texte">{encadre}</p>
                </div>
              </article>
            ))}
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('sources')}
              className="learn-cta"
            >
              <BookOpen size={16} strokeWidth={2} />
              Voir les sources où vérifier une info
              <ArrowRight size={15} strokeWidth={2.2} />
            </button>
          )}
        </Chapitre>

        {/* --- 05 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.complot} enregistrer={enregistrer}>
          <p className="chapitre__texte">
            Ces discours ne se reconnaissent pas à leur sujet — n'importe quel
            sujet peut y passer — mais à leur forme. Quatre signes reviennent
            presque toujours.
          </p>

          <ul className="signaux">
            {SIGNAUX.map(({ titre, texte }) => (
              <li key={titre} className="signal">
                <p className="signal__titre">{titre}</p>
                <p className="signal__texte">{texte}</p>
              </li>
            ))}
          </ul>

          <Conseil label="À retenir">
            Une explication qui transforme chaque objection en confirmation ne
            peut jamais être contredite. Et ce qui ne peut jamais être contredit
            ne peut jamais être vérifié non plus.
          </Conseil>
        </Chapitre>

        {/* --- 06 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.bulle} enregistrer={enregistrer}>
          {BULLE.paragraphes.map((p) => (
            <p key={p} className="chapitre__texte">
              {p}
            </p>
          ))}
          <Conseil label="À retenir">{BULLE.conseil}</Conseil>
        </Chapitre>

        {/* --- 07 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.biais} enregistrer={enregistrer}>
          <ul className="biais-grille">
            {BIAIS.map(({ nom, pensee, exploitation, reflexe }) => (
              <li key={nom} className="biais">
                <p className="biais__nom">{nom}</p>
                <p className="biais__pensee">{pensee}</p>

                <div className="biais__ligne">
                  <p className="biais__label">Ce qu'on en fait</p>
                  <p className="biais__texte">{exploitation}</p>
                </div>
                <div className="biais__ligne biais__ligne--reflexe">
                  <p className="biais__label">Le bon réflexe</p>
                  <p className="biais__texte">{reflexe}</p>
                </div>
              </li>
            ))}
          </ul>
        </Chapitre>

        {/* --- 08 ---------------------------------------------------------- */}
        <Chapitre chapitre={PAR_ID.cas} enregistrer={enregistrer}>
          <ul className="cas-liste">
            {CAS.map(({ id, annee, titre, texte, lecon }) => (
              <li key={id} className="cas">
                <p className="cas__annee">{annee}</p>
                <h3 className="cas__titre">{titre}</h3>
                <p className="cas__texte">{texte}</p>
                <p className="cas__lecon">{lecon}</p>
              </li>
            ))}
          </ul>
        </Chapitre>

        {/* Sortie de lecture : la théorie appelle la pratique. */}
        {onNavigate && (
          <section className="learn-fin">
            <h2 className="learn-fin__titre">À toi de jouer</h2>
            <p className="learn-fin__texte">
              Lire, c'est bien. Se faire piéger pour de faux, c'est mieux : les
              trois jeux reprennent tout ce qui précède, mais dans un fil
              d'actualité.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('game')}
              className="learn-fin__bouton"
            >
              Ouvrir les jeux
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </section>
        )}
      </div>
    </Page>
  )
}
