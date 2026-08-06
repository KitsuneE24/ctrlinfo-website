/**
 * Les étapes du jeu du fil d'actualité.
 *
 * Rendu partagé entre l'accueil (où le jeu est présenté) et la page de
 * lancement de l'onglet Jouer (où il est rappelé juste avant de commencer) :
 * les deux endroits doivent dire exactement la même chose.
 */
const ETAPES = [
  <>Lis chaque publication comme sur ton réseau préféré.</>,
  <>
    Décide quoi en faire&nbsp;: <b>J'aime</b>, <b>Partager</b> ou{' '}
    <b>Signaler</b>. Un chrono de 30&nbsp;secondes te laisse le temps de lire et
    de réfléchir.
  </>,
  <>
    Chaque choix est commenté&nbsp;: tu apprends surtout en te trompant, sans
    conséquence.
  </>,
]

export default function GameRules() {
  return (
    <ol className="rules">
      {ETAPES.map((texte, i) => (
        <li key={i} className="rules__item">
          <span className="rules__index">{i + 1}</span>
          <span>{texte}</span>
        </li>
      ))}
    </ol>
  )
}
