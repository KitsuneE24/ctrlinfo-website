// Adresse devinable ou laissée à l'exemple (ancien compris) : pas d'admin dans le build.
export const adresseAdminChoisie = (chemin) =>
  typeof chemin === 'string' && /^[a-z0-9-]{12,}$/i.test(chemin) && !/^(admin|A-CHOISIR|gestion-3f9a2c)$/i.test(chemin)
