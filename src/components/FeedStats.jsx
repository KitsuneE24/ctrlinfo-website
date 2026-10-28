import { HelpCircle } from 'lucide-react'
import Countdown from './Countdown'
import { useSyncExternalStore } from 'react'
import FondMolten from './ui/FondMolten'
import Kiwi from './ui/Kiwi'

const BUREAU = '(min-width: 1024px)'
const abonnerBureau = (rappel) => {
  const requete = window.matchMedia(BUREAU)
  requete.addEventListener('change', rappel)
  return () => requete.removeEventListener('change', rappel)
}

function useBureau() {
  return useSyncExternalStore(abonnerBureau, () => window.matchMedia(BUREAU).matches, () => false)
}

export default function FeedStats({
  currentLevel,
  levelDoneCount,
  levelTotal,
  timerKey,
  timerActive,
  timerSecondes,
  onTimerComplete,
  onRegles,
}) {
  const bureau = useBureau()
  const enCours = Math.min(levelDoneCount + 1, levelTotal)

  return (
    <section className="fil-etat" aria-label="État de la partie">
      <div className="fil-etat__barre">
        {bureau && <FondMolten className="fil-etat__molten" />}

        <button
          type="button"
          onClick={onRegles}
          aria-label="Règles du jeu"
          title="Règles du jeu"
          className="bouton-rond fil-etat__regles"
        >
          <HelpCircle size={20} strokeWidth={2} />
        </button>

        <div className="fil-etat__avancement">
          <p className="fil-etat__niveau">
            <span className="etiquette">Niveau {currentLevel}</span>
            <span className="fil-etat__compte">
              {enCours} / {levelTotal}
            </span>
          </p>
          <div
            role="img"
            aria-label={`Publication ${enCours} sur ${levelTotal}`}
            className="fil-etat__segments"
          >
            {Array.from({ length: levelTotal }, (_, i) => (
              <span
                key={i}
                className={`fil-etat__segment${
                  i < levelDoneCount ? ' fil-etat__segment--fait' : ''
                }${i === levelDoneCount ? ' fil-etat__segment--en-cours' : ''}`}
              />
            ))}
          </div>
        </div>

        {timerSecondes ? (
          <div className="fil-etat__chrono">
            <Countdown
              key={timerKey}
              active={timerActive}
              secondes={timerSecondes}
              onComplete={onTimerComplete}
            />
          </div>
        ) : null}
      </div>

      <div className="papier fil-etat__conseil">
        <span className="papier__ruban" />
        <Kiwi taille={44} />
        <p>Lisez jusqu'au bout avant de cliquer.</p>
      </div>
    </section>
  )
}
