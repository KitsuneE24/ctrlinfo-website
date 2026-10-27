// Générés par outils/generer-filaments.py.
const SOURCES = {
  swirl: 'filaments/molten-swirl.webp',
  wide: 'filaments/molten-wide.webp',
}

export default function Filaments({ forme = 'swirl', tourne = false, inverse = false, className = '' }) {
  const animation = tourne ? (inverse ? ' filaments--tourne-inverse' : ' filaments--tourne') : ''
  return (
    <img
      src={`/${SOURCES[forme]}`}
      alt=""
      aria-hidden="true"
      draggable="false"
      decoding="async"
      className={`filaments${animation}${className ? ` ${className}` : ''}`}
    />
  )
}
