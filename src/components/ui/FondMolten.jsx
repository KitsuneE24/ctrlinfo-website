import { Suspense, lazy } from 'react'
import { couleur } from '../../lib/couleurs'

const MoltenMetal = lazy(() => import('../MoltenMetal'))

const REGLAGES = {
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

export default function FondMolten({ className = '', ...reglages }) {
  return (
    <div aria-hidden="true" className={className}>
      <Suspense fallback={null}>
        <MoltenMetal
          color1={couleur('brand-violet')}
          color2={couleur('brand-mauve')}
          color3={couleur('blanc')}
          {...REGLAGES}
          {...reglages}
        />
      </Suspense>
    </div>
  )
}
