import { createContext, useContext } from 'react'

/**
 * Le garde de sortie de partie.
 *
 * `requestExit(to)` rend `true` si la navigation peut suivre son cours, et
 * `false` si elle a été retenue le temps de poser la question. La barre
 * d'onglets et le logotype sont les deux seules sorties : ce sont eux qui
 * appellent.
 */
export const ExitGuardContext = createContext({ requestExit: () => true })

export function useExitGuard() {
  return useContext(ExitGuardContext)
}
