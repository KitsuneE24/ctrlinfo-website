import { createContext, useContext } from 'react'

export const ExitGuardContext = createContext({ requestExit: () => true })

export function useExitGuard() {
  return useContext(ExitGuardContext)
}
