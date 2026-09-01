import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import FournisseurCompte from './state/FournisseurCompte'
import FournisseurJeux from './state/FournisseurJeux'
import { PATHS } from './routes'
import HomeScreen from './screens/HomeScreen'
import FeedScreen from './screens/FeedScreen'
import ChatScreen from './screens/ChatScreen'
import LearnScreen, { ChapterScreen } from './screens/LearnScreen'
import SourcesScreen from './screens/SourcesScreen'
import ProfileScreen from './screens/ProfileScreen'

/**
 * Le contenu du jeu vient de l'API (ctrlinfo-app). Deux choses valent pour
 * toute l'application et sont donc posées ici, au-dessus de la coque : la
 * liste des jeux, demandée une fois, et l'identité du joueur.
 *
 * Vient ensuite la table des adresses. Toutes les routes passent par la même
 * coque — en-tête, barre d'onglets, bouton des sources — qui les accueille
 * dans son `<Outlet />`.
 *
 * Deux écrans lisent un morceau de l'adresse plutôt qu'un état interne : une
 * conversation et un thème sont désormais des pages à part entière, qu'on peut
 * partager et retrouver après un rechargement.
 */
export default function App() {
  return (
    <FournisseurCompte>
      <FournisseurJeux>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomeScreen />} />
            <Route path={PATHS.feed} element={<FeedScreen />} />
            <Route path={PATHS.chats} element={<ChatScreen />} />
            <Route path={`${PATHS.chats}/:slug`} element={<ChatScreen />} />
            <Route path={PATHS.resources} element={<LearnScreen />} />
            <Route path={PATHS.verify} element={<SourcesScreen />} />
            <Route
              path={`${PATHS.resources}/comprendre/:slug`}
              element={<ChapterScreen />}
            />
            <Route path={PATHS.profile} element={<ProfileScreen />} />
            {/* Une adresse inconnue ramène à l'accueil sans laisser de trace
                dans l'historique : le bouton « précédent » n'y revient pas. */}
            <Route path="*" element={<Navigate to={PATHS.home} replace />} />
          </Route>
        </Routes>
      </FournisseurJeux>
    </FournisseurCompte>
  )
}
