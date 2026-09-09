/**
 * Connexion et inscription : deux onglets, et le formulaire juste dessous.
 *
 *   ┌─────────────────────────────────┐
 *   │ [Se connecter] Créer un compte  │
 *   │                                 │
 *   │   les champs de l'onglet actif  │
 *   └─────────────────────────────────┘
 *
 * Les deux portes et le formulaire sont dans la **même colonne** : ce qui va
 * ensemble se lit ensemble. La version précédente posait le décor sous la
 * porte active et le formulaire à côté — on ne savait plus lequel des deux
 * boutons commandait les champs qu'on avait sous les yeux.
 *
 * Aucun fond animé ici : cet écran demande une saisie, et l'onglet actif doit
 * se voir du premier coup d'œil. Le métal en fusion reste sur les bandeaux de
 * l'accueil et des ressources, où il ne concurrence aucun bouton.
 */
export default function AuthPanels({ mode, onMode, children }) {
  const inscrire = mode === 'inscription'

  return (
    <div className="auth">
      <div role="tablist" aria-label="Connexion ou inscription" className="auth__onglets">
        <button
          type="button"
          role="tab"
          aria-selected={!inscrire}
          onClick={() => onMode('connexion')}
          className={`auth__onglet${!inscrire ? ' auth__onglet--actif' : ''}`}
        >
          Se connecter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inscrire}
          onClick={() => onMode('inscription')}
          className={`auth__onglet${inscrire ? ' auth__onglet--actif' : ''}`}
        >
          Créer un compte
        </button>
      </div>

      {children}
    </div>
  )
}
