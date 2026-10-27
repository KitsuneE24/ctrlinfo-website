import { Fragment } from 'react'
import { getMentionsLegales } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'
import Page from '../components/ui/Page'

// Adresses web, courriels et champs « [À compléter…] ».
const MOTIF = /(https?:\/\/[^\s]+[^\s.,;:)]|[\w.+-]+@[\w-]+\.[\w.-]*\w|\[[^\]]+\])/g

function Texte({ texte }) {
  return texte.split(MOTIF).map((morceau, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{morceau}</Fragment>
    if (morceau.startsWith('[')) return <mark key={i} className="mentions__a-completer">{morceau}</mark>
    const courriel = !morceau.startsWith('http')
    return (
      <a
        key={i}
        href={courriel ? `mailto:${morceau}` : morceau}
        {...(courriel ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {morceau.replace(/^https?:\/\//, '')}
      </a>
    )
  })
}

/** Les lignes « • » forment une liste ; les autres, des paragraphes. */
function Paragraphe({ texte }) {
  const lignes = texte.split('\n')
  const blocs = []
  for (const ligne of lignes) {
    const puce = ligne.startsWith('• ')
    const dernier = blocs.at(-1)
    if (puce && dernier?.liste) dernier.lignes.push(ligne.slice(2))
    else blocs.push({ liste: puce, lignes: [puce ? ligne.slice(2) : ligne] })
  }

  return blocs.map((bloc, i) =>
    bloc.liste ? (
      <ul key={i} className="mentions__liste">
        {bloc.lignes.map((ligne, j) => (
          <li key={j}><Texte texte={ligne} /></li>
        ))}
      </ul>
    ) : (
      <p key={i} className="mentions__texte"><Texte texte={bloc.lignes[0]} /></p>
    )
  )
}

export default function LegalScreen() {
  const { donnees, chargement, erreur, recharger } = useRessource(getMentionsLegales, [])

  return (
    <Page seamless>
      <article className="mentions learn__body">
        <h1 className="mentions__titre">Mentions légales</h1>

        {erreur ? (
          <ErreurChargement erreur={erreur} onReessayer={recharger} />
        ) : chargement || !donnees ? (
          <Chargement quoi="les mentions légales" />
        ) : (
          donnees.map((section) => (
            <section key={section.id} id={section.id} className="mentions__section">
              <h2 className="mentions__intertitre">{section.titre}</h2>
              {section.paragraphes.map((paragraphe, i) => (
                <Paragraphe key={i} texte={paragraphe.texte} />
              ))}
            </section>
          ))
        )}
      </article>
    </Page>
  )
}
