import { AuthRepository } from '../repositories/AuthRepository'
import { SecureTokenStorage } from '../utils/SecureTokenStorage'
import type {
  LoginRequest,
  AuthUser,
  VerifyLoginRequest,
} from '../types/auth'

export class AuthService {
  private repo = new AuthRepository()

  async requestLogin(credentials: LoginRequest): Promise<{ message: string }> {
    return await this.repo.requestLogin(credentials)
  }

  async verifyLogin(credentials: VerifyLoginRequest): Promise<AuthUser> {
    const { user, accessToken } = await this.repo.verifyLogin(credentials)
    SecureTokenStorage.setAccessToken(accessToken)
    this.setCurrentUser(user)
    return user
  }

  async logout(): Promise<void> {
    let apiError: Error | null = null

    try {
      await this.repo.logout()
    } catch (error) {
      apiError =
        error instanceof Error ? error : new Error('Logout API call failed')
      console.warn('Logout API call failed:', error)
    } finally {
      SecureTokenStorage.clearTokens()
      this.clearCurrentUser()
    }

    if (apiError) {
      throw apiError
    }
  }

  getCurrentAccessToken(): string | null {
    return SecureTokenStorage.getAccessToken()
  }

  isAccessTokenExpired(): boolean {
    const token = SecureTokenStorage.getAccessToken()
    return token ? SecureTokenStorage.isTokenExpired(token) : true
  }

  clearTokens(): void {
    SecureTokenStorage.clearTokens()
    this.clearCurrentUser()
  }

  getCurrentUser(): AuthUser | null {
    const userData = localStorage.getItem('currentUser')
    return userData ? JSON.parse(userData) : null
  }

  private setCurrentUser(user: AuthUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  private clearCurrentUser(): void {
    localStorage.removeItem('currentUser')
  }
}
