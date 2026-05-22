import { useState } from 'react'
import Feed from './components/Feed'
import StartScreen from './components/StartScreen'
import PhoneFrame from './components/PhoneFrame'

export default function App() {
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
