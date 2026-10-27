import { createContext, useContext } from 'react'

// `requestExit(to)` : true si la navigation peut suivre, false si elle est retenue.
export const ExitGuardContext = createContext({ requestExit: () => true })

export function useExitGuard() {
  return useContext(ExitGuardContext)
}
