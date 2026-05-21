import Feed from './components/Feed'
import useDarkMode from './hooks/useDarkMode'

export default function App() {
  const [isDark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-zinc-950 flex justify-center">
      <div className="w-full max-w-sm md:max-w-md">
        <Feed isDark={isDark} toggleDark={toggleDark} />
      </div>
    </div>
  )
}
