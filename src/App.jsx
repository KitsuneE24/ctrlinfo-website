import { useState } from 'react'
import Feed from './components/Feed'
import StartScreen from './components/StartScreen'

export default function App() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return <StartScreen onStart={() => setGameStarted(true)} />
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex justify-center px-4">
      <div className="w-full max-w-sm">
        <Feed />
      </div>
    </div>
  )
}
