import { createContext } from 'react'
import { AuthService } from '../services/AuthServices'
import type { AuthUser } from '../types/auth'

export interface AuthContextType {
  authService: AuthService
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: { email: string }) => Promise<AuthUser>
  logout: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)
