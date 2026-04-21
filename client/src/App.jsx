import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Popular from './pages/Popular'
import Explore from './pages/Explore'
import SpacePage from './pages/SpacePage'
import PostPage from './pages/PostPage'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateSpace from './pages/CreateSpace'
import SpaceSettings from './pages/SpaceSettings'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="popular" element={<Popular />} />
          <Route path="explore" element={<Explore />} />
          <Route path="s/:spaceId" element={<SpacePage />} />
          <Route path="s/:spaceId/post/:postId" element={<PostPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="create-space" element={<CreateSpace />} />
          <Route path="s/:spaceId/settings" element={<SpaceSettings />} />
          <Route path="u/:username" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
