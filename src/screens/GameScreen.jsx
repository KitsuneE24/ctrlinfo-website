import { useState } from 'react'
import Feed from '../components/Feed'
import GameStart from '../components/GameStart'

// Onglet « Jouer » : page de lancement avec les consignes, puis le fil.
export default function GameScreen() {
  const [started, setStarted] = useState(false)

  if (!started) return <GameStart onStart={() => setStarted(true)} />
  return <Feed />
}
