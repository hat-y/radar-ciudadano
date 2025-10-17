import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { theme } from './theme';
import { ProtectedRoutes } from './router/ProtectedRoutes';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}
