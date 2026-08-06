export const brand = {
  blue:         '#1800ad',
  magenta:      '#791561',
  magentaLight: '#e0309a',
  cream:        '#fffaf9',
}

export const headerGradient =
  `linear-gradient(to right, ${brand.blue}, ${brand.magenta})`

export const brandGradient =
  `linear-gradient(135deg, ${brand.blue}, ${brand.magenta})`

// Anneau de story : dégradé de marque plutôt que l'orange/rose d'Instagram.
export const storyRing =
  `linear-gradient(135deg, ${brand.magentaLight}, ${brand.magenta} 55%, ${brand.blue})`
