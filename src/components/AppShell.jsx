import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import AppHeader from './AppHeader'
import Compagnon from './Compagnon'
import ExitGamePrompt from './ExitGamePrompt'
import GameStart from './GameStart'
import TabBar from './TabBar'
import { ExitGuardContext } from '../state/exitGuard'
import { signalerAuCompagnon } from '../state/compagnonSignaux'
import { useCompagnonVisible } from '../state/compagnonVisible'
import { useJeu, useJeux } from '../state/jeux'
import { PATHS, pageTitle } from '../routes'
import { dejaVu, marquerVu } from '../lib/premiereFois'

const reglesLues = (gameId) => Boolean(gameId) && dejaVu(`regles:${gameId}`)

const gameOfPath = (path) => {
  if (path === PATHS.feed) return 'feed'
  if (path.startsWith(`${PATHS.chats}/`)) return 'chat'
  return null
}

export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const gameId = gameOfPath(pathname)
  const jeu = useJeu(gameId)
  const { chargement: jeuxEnCours } = useJeux()
  const compagnonVisible = useCompagnonVisible()

  const [lancee, setLancee] = useState(() => reglesLues(gameId))
  const [lastPath, setLastPath] = useState(pathname)
  const [relecture, setRelecture] = useState(false)
  const [exitTo, setExitTo] = useState(null)
  const [finished, setFinished] = useState(false)

  if (lastPath !== pathname) {
    setLastPath(pathname)
    setLancee(reglesLues(gameId))
    setRelecture(false)
    setExitTo(null)
    setFinished(false)
  }

  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])

  const jeuEnPlace = Boolean(gameId && jeu)
  const enAttente = Boolean(gameId) && jeuxEnCours
  const seuil = jeuEnPlace && !lancee

  const departVisible = jeuEnPlace && (seuil || relecture)
  const demarree = !gameId || (!seuil && !enAttente)

  const commencer = useCallback(() => {
    if (gameId) marquerVu(`regles:${gameId}`)
    setLancee(true)
    setRelecture(false)
  }, [gameId])

  const revoirLeDepart = useCallback(() => setRelecture(true), [])
  const marquerFini = useCallback(() => {
    setFinished(true)
    signalerAuCompagnon('finPartie')
  }, [])

  const enPartie = demarree && gameId !== null && !finished

  const requestExit = useCallback(
    (to) => {
      if (!enPartie) return true
      setExitTo(to)
      return false
    },
    [enPartie]
  )

  const guard = useMemo(() => ({ requestExit }), [requestExit])

  const confirmExit = useCallback(() => {
    const to = exitTo
    setExitTo(null)
    if (to) navigate(to)
  }, [exitTo, navigate])

  return (
    <ExitGuardContext.Provider value={guard}>
      <div className="app">
        <AppHeader />

        <main className="app__main">
          <div key={pathname} className="app__screen anim-apparait">
            <Outlet
              context={{
                paused: !demarree || departVisible || exitTo !== null,
                runKey: demarree ? 'play' : 'idle',
                onFinished: marquerFini,
                onRegles: revoirLeDepart,
              }}
            />
          </div>

          {departVisible && <GameStart jeu={jeu} reprise={lancee} onStart={commencer} />}

          {compagnonVisible && <Compagnon jeu={enPartie && !departVisible ? gameId : null} />}
        </main>

        <TabBar />

        {exitTo !== null && (
          <ExitGamePrompt onConfirm={confirmExit} onCancel={() => setExitTo(null)} />
        )}
      </div>
    </ExitGuardContext.Provider>
  )
}
