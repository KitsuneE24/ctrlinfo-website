import { useState } from 'react'
import { Check } from 'lucide-react'
import { THEMES, ecrireInterets, lireInterets } from '../lib/interests'

/**
 * Le choix des sujets qu'on veut voir passer en premier.
 *
 * Il ne filtre pas le fil, il l'ordonne : le serveur met devant ce qui
 * correspond, puis complète avec le reste. Un fil qui ne montrerait que ce
 * qu'on a coché serait la bulle même qu'on cherche à faire reconnaître.
 *
 * Rien n'est enregistré sur le joueur : le choix vit dans son navigateur, et
 * vaut donc aussi en mode invité.
 */
export default function InterestPicker() {
  const [choisis, setChoisis] = useState(lireInterets)

  function basculer(id) {
    const suivant = choisis.includes(id)
      ? choisis.filter((theme) => theme !== id)
      : [...choisis, id]
    setChoisis(suivant)
    ecrireInterets(suivant)
  }

  return (
    <section className="card interests">
      <div className="card__body">
        <h2 className="card__title">Ce qui t'intéresse</h2>
        <p className="card__text">
          Ces sujets passeront en premier dans ton fil. Il continuera d'en
          montrer d'autres&nbsp;: c'est justement en sortant de ses habitudes
          qu'on apprend à reconnaître les codes des autres.
        </p>

        <ul className="interests__liste">
          {THEMES.map((theme) => {
            const actif = choisis.includes(theme.id)
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  onClick={() => basculer(theme.id)}
                  aria-pressed={actif}
                  className={`interests__puce${actif ? ' interests__puce--actif' : ''}`}
                >
                  {actif && <Check size={14} strokeWidth={2.6} />}
                  {theme.label}
                </button>
              </li>
            )
          })}
        </ul>

        {choisis.length === 0 && (
          <p className="card__note">
            Aucun sujet choisi&nbsp;: ton fil reste celui de tout le monde.
          </p>
        )}
      </div>
    </section>
  )
}
