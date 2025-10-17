import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { AuthService } from '../services/AuthServices'
import { AuthContext, type AuthContextType } from './AuthContext'
import type { AuthUser, LoginRequest } from '../types/auth'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authService] = useState(() => new AuthService())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const accessToken = authService.getCurrentAccessToken()
        if (accessToken && !authService.isAccessTokenExpired()) {
          const userData = authService.getCurrentUser()
          if (userData) {
            setUser(userData)
          } else {
            authService.clearTokens()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [authService])

  useEffect(() => {
    const handleForcedLogout = () => {
      console.log('Forced logout detected - clearing user state')
      setUser(null)
      setIsLoading(false)
    }

    const handleTokenExpired = () => {
      console.log('Token expired - clearing user state')
      setUser(null)
      setIsLoading(false)
    }

    window.addEventListener('auth:forceLogout', handleForcedLogout)
    window.addEventListener('auth:tokenExpired', handleTokenExpired)

    return () => {
      window.removeEventListener('auth:forceLogout', handleForcedLogout)
      window.removeEventListener('auth:tokenExpired', handleTokenExpired)
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<AuthUser> => {
    setIsLoading(true)
    try {
      // For email-only login, this is just a stub
      // The actual flow is: requestLogin -> verifyLogin
      // This method is kept for compatibility with AuthContext interface
      await authService.requestLogin(credentials)
      throw new Error('Please check your email for the login token')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: AuthContextType = {
    authService,
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
