/**
 * Ce que le jeu raconte au compagnon.
 *
 * Le fil et la coque savent des choses qu'il aimerait commenter — une décision
 * juste, une erreur, une partie finie — mais ils sont très loin de lui dans
 * l'arbre : le fil est dans l'`<Outlet />`, lui est posé à côté. Passer par un
 * contexte obligerait toute la coque à se re-rendre à chaque décision.
 *
 * D'où ce registre, hors de React : celui qui agit **signale**, le compagnon
 * **écoute**. Personne d'autre n'écoute, et rien n'est gardé — un signal envoyé
 * quand il n'est pas monté est simplement perdu, ce qui est le bon
 * comportement : il n'a rien à rattraper.
 *
 * Ce qu'il fait du signal — le compter, attendre une série, se taire ou parler
 * — ne se décide pas ici mais dans [Compagnon.jsx](../components/Compagnon.jsx)
 * et la table `REACTIONS` de [lib/compagnon.js](../lib/compagnon.js). L'appelant
 * dit ce qui s'est passé, jamais ce qu'il faut en dire.
 */

const auditeurs = new Set()

/** Prévenir le compagnon qu'il vient de se passer quelque chose. */
export function signalerAuCompagnon(nom) {
  for (const auditeur of auditeurs) auditeur(nom)
}

/** S'abonner aux signaux. Rend la fonction qui désabonne. */
export function ecouterLeCompagnon(auditeur) {
  auditeurs.add(auditeur)
  return () => auditeurs.delete(auditeur)
}
