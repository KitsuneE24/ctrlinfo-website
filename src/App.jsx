import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import FournisseurJeux from './state/FournisseurJeux'
import { PATHS } from './routes'
import HomeScreen from './screens/HomeScreen'
import FeedScreen from './screens/FeedScreen'
import ChatScreen from './screens/ChatScreen'
import LearnScreen, { ChapterScreen } from './screens/LearnScreen'
import ProfileScreen from './screens/ProfileScreen'
import LegalScreen from './screens/LegalScreen'

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
          <Route path={PATHS.legal} element={<LegalScreen />} />
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Route>
      </Routes>
    </FournisseurJeux>
  )
}
