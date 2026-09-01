import { useSyncExternalStore } from 'react'
import { getPreferences, setPreference, subscribePreferences } from '../lib/preferences'

const CHOIX = [
  { valeur: 'auto', label: 'Automatique' },
  { valeur: 'visible', label: 'Toujours' },
  { valeur: 'caches', label: 'Jamais' },
]

/** Le réglage des libellés de la barre d'onglets, dans le profil. */
export default function DisplaySettings() {
  const { tabLabels } = useSyncExternalStore(subscribePreferences, getPreferences)

  return (
    <section className="card">
      <div className="card__body">
        <h2 className="card__title">Affichage</h2>
        <p className="card__text">
          Sur petit écran, les intitulés sous les icônes serrent la barre du
          bas. À toi de dire ce que tu préfères.
        </p>

        <fieldset className="reglage">
          <legend className="reglage__legende">Intitulés des onglets</legend>
          <div className="reglage__choix">
            {CHOIX.map(({ valeur, label }) => (
              <label key={valeur} className="reglage__option">
                <input
                  type="radio"
                  name="tab-labels"
                  value={valeur}
                  checked={tabLabels === valeur}
                  onChange={() => setPreference('tabLabels', valeur)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}
