// Réglage « réduire les animations » du système (RGAA 13.8).
export const mouvementReduit = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
