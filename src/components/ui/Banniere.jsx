import MoltenMetal from '../MoltenMetal'
import { brand } from '../../css/colors'

/**
 * Bandeau de tête d'un écran, fond animé compris.
 *
 * Les réglages du « métal en fusion » sont décrits **ici et nulle part
 * ailleurs** : une page qui veut ce bandeau passe par ce composant, elle ne
 * recopie pas la vingtaine de props de MoltenMetal. Les deux bandeaux du site
 * — accueil et Comprendre — sont donc réglés à l'identique par construction.
 *
 * Ce que ça coûte, en pratique :
 *
 * - **Jamais deux effets à la fois.** Les écrans se remplacent l'un l'autre,
 *   et MoltenMetal rend son contexte WebGL en partant. Seul le fondu-enchaîné
 *   de la coque (0,16 s) fait brièvement coexister les deux.
 * - **Rien ne tourne hors écran.** La boucle de rendu s'arrête dès que le
 *   bandeau sort du champ ou que l'onglet passe en arrière-plan, et le rendu
 *   est plafonné à 1,5 pixel physique — voir MoltenMetal.jsx.
 *
 * `className` porte l'habillage propre à la page : ses marges intérieures et
 * sa typographie. La coquille — position, débordement, aplat de repli — est
 * commune, dans `colonne-de-contenu.css`.
 */
const REGLAGES = {
  color1: brand.violet,
  color2: brand.mauve,
  color3: brand.cream,
  speed: 0.28,
  scale: 3,
  detail: 3,
  glow: 1.5,
  coreSize: 0.1,
  swirl: 1,
  fold: -0.2,
  blackPoint: 0.06,
  brightness: 1.3,
  colorMode: 'molten',
  grain: true,
  grainIntensity: 0.05,
  mouseInteraction: true,
  mouseStrength: 0.3,
  opacity: 1,
}

export default function Banniere({ className, children }) {
  return (
    <section className={`banniere${className ? ` ${className}` : ''}`}>
      <div className="banniere__fx">
        <MoltenMetal {...REGLAGES} />
      </div>

      {/* Le contenu repasse devant l'effet. */}
      <div className="banniere__contenu">{children}</div>
    </section>
  )
}
