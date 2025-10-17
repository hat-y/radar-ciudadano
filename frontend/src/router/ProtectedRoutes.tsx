import { Navigate } from 'react-router-dom'
import { useAuthService } from '../hooks/useAuthService'
import ReportIncidentPage from '../pages/ReportIncidentPage'

export function ProtectedRoutes() {
  const { isAuthenticated } = useAuthService()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <ReportIncidentPage />
}
