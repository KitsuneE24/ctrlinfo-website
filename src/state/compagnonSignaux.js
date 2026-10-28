const auditeurs = new Set()

export function signalerAuCompagnon(nom) {
  for (const auditeur of auditeurs) auditeur(nom)
}

export function ecouterLeCompagnon(auditeur) {
  auditeurs.add(auditeur)
  return () => auditeurs.delete(auditeur)
}
