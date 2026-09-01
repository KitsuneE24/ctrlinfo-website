import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  abonner,
  connexion as connexionApi,
  continuerEnInvite as continuerEnInviteApi,
  deconnexion as deconnexionApi,
  etatCompte,
  inscription as inscriptionApi,
  quitterModeInvite as quitterModeInviteApi,
} from '../api/client'
import { ContexteCompte } from './compte'

/**
 * Branche l'identité rangée dans `localStorage` (api/client.js) sur React.
 *
 * L'état vit dans le module d'API, pas ici : c'est lui que les appels réseau
 * consultent, et il doit rester juste même hors de tout rendu. Ce fournisseur
 * s'y abonne, et c'est tout — une connexion faite dans l'onglet Profil se voit
 * aussitôt dans l'en-tête.
 */
export default function FournisseurCompte({ children }) {
  const etat = useSyncExternalStore(abonner, etatCompte)

  const connexion = useCallback((identifiants) => connexionApi(identifiants), [])
  const inscription = useCallback((identifiants) => inscriptionApi(identifiants), [])
  const deconnexion = useCallback(() => deconnexionApi(), [])
  const continuerEnInvite = useCallback(() => continuerEnInviteApi(), [])
  const quitterModeInvite = useCallback(() => quitterModeInviteApi(), [])

  const valeur = useMemo(
    () => ({
      ...etat,
      connexion,
      inscription,
      deconnexion,
      continuerEnInvite,
      quitterModeInvite,
    }),
    [etat, connexion, inscription, deconnexion, continuerEnInvite, quitterModeInvite]
  )

  return <ContexteCompte.Provider value={valeur}>{children}</ContexteCompte.Provider>
}
