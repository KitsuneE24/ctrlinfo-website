import { useState } from 'react'
import Feed from './Feed'
import StartScreen from './StartScreen'
import PhoneFrame from './PhoneFrame'

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <PhoneFrame>
      {gameStarted ? (
        <Feed />
      ) : (
        <StartScreen onStart={() => setGameStarted(true)} />
      )}
    </PhoneFrame>
  )
}
