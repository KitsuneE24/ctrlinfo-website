/**
 * La partie ouverte en ce moment, hors de React.
 *
 * L'alerte de sortie est déclenchée par la barre d'onglets, très loin du jeu
 * qui a ouvert la session : ce registre est ce qui permet d'abandonner la
 * partie proprement au lieu de la laisser « en cours » pour toujours.
 */
let courante = null

export const setCurrentSession = (sessionId) => {
  courante = sessionId
}

export const clearCurrentSession = (sessionId) => {
  if (courante === sessionId) courante = null
}

export const getCurrentSession = () => courante
