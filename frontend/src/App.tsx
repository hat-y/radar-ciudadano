import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import ChatPage from './pages/ChatPage'
import StatsPage from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import { theme } from './theme'
import { ProtectedRoutes } from './router/ProtectedRoutes'
import { AppLayout } from './layout/AppLayout'

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/verify" element={<VerifyEmailPage />} />

          {/* Routes with AppLayout (sidebar) */}
          <Route element={<AppLayout />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>

          {/* Protected route for reporting */}
          <Route path="/report" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
