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

/** Règles déjà lues pour ce jeu : on n'ouvre plus l'écran de départ. */
const reglesLues = (gameId) => Boolean(gameId) && dejaVu(`regles:${gameId}`)

/** Le jeu qui commence à cette adresse. La boîte de réception n'en est pas un. */
const gameOfPath = (path) => {
  if (path === PATHS.feed) return 'feed'
  if (path.startsWith(`${PATHS.chats}/`)) return 'chat'
  return null
}

/**
 * Coque de l'application : en-tête, écran de la route en cours, barre
 * d'onglets.
 *
 * C'est aussi le seuil des jeux, et il tient en un écran : **l'écran de
 * départ**. Il dit la règle, la durée, ce qu'on va faire, et où la progression
 * est gardée. C'est le seul endroit où les règles sont dites : les répéter dans
 * un tutoriel revenait à ne les lire nulle part.
 *
 * Rien ne barre l'entrée d'un jeu : il n'y a ni compte ni inscription.
 *
 * Le même écran se rouvre en cours de partie par le bouton de l'en-tête. Il
 * annonce alors « Reprendre », et la partie n'est pas relancée : elle est
 * seulement mise en pause le temps de la relecture.
 */
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

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans son seuil.
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

  // Sans la description du jeu, on ne sait rien annoncer : on laisse passer, et
  // l'écran affichera sa propre erreur de chargement.
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

  // La sortie n'est retenue que pendant une partie en cours : une fois jouée
  // jusqu'au bout, il n'y a plus rien à perdre et la question serait de trop.
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

  // La progression est déjà écrite à chaque décision : il ne reste qu'à partir.
  const confirmExit = useCallback(() => {
    const to = exitTo
    setExitTo(null)
    if (to) navigate(to)
  }, [exitTo, navigate])

  return (
    <ExitGuardContext.Provider value={guard}>
      <div className="app">
        <AppHeader />

        <div className="app__main">
          {/* La clé relance le fondu à chaque changement d'écran. */}
          <div key={pathname} className="app__screen anim-apparait">
            {/* `runKey` ne change qu'au premier départ : rouvrir les règles met en pause. */}
            <Outlet
              context={{
                paused: !demarree || departVisible,
                runKey: demarree ? 'play' : 'idle',
                onFinished: marquerFini,
                onRegles: revoirLeDepart,
              }}
            />
          </div>

          {departVisible && <GameStart jeu={jeu} reprise={lancee} onStart={commencer} />}

          {compagnonVisible && <Compagnon enJeu={enPartie && !departVisible} />}
        </div>

        <TabBar />

        {exitTo !== null && (
          <ExitGamePrompt onConfirm={confirmExit} onCancel={() => setExitTo(null)} />
        )}
      </div>
    </ExitGuardContext.Provider>
  )
}
