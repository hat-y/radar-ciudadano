import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuthService = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuthService debe usarse dentro de un AuthProvider')
  return context
}
