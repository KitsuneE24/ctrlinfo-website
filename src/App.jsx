import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import FournisseurJeux from './state/FournisseurJeux'
import { PATHS } from './routes'
import HomeScreen from './screens/HomeScreen'
import FeedScreen from './screens/FeedScreen'
import ChatScreen from './screens/ChatScreen'
import LearnScreen, { ChapterScreen } from './screens/LearnScreen'
import ProfileScreen from './screens/ProfileScreen'

/**
 * Le contenu du jeu vient de l'API (ctrlinfo-app). Une seule chose vaut pour
 * toute l'application et est donc posée ici, au-dessus de la coque : la liste
 * des jeux, demandée une fois. Il y avait aussi l'identité du joueur ; il n'y a
 * plus de compte, et la progression est un magasin de module auquel les écrans
 * s'abonnent directement (`state/progression.js`) — aucun fournisseur à poser.
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
    <FournisseurJeux>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomeScreen />} />
          <Route path={PATHS.feed} element={<FeedScreen />} />
          <Route path={PATHS.chats} element={<ChatScreen />} />
          <Route path={`${PATHS.chats}/:slug`} element={<ChatScreen />} />
          <Route path={PATHS.resources} element={<LearnScreen />} />
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
  )
}
