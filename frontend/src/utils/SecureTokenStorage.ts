export class SecureTokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'

  private static encrypt(value: string): string {
    return btoa(value)
  }

  private static decrypt(value: string): string {
    try {
      return atob(value)
    } catch {
      return ''
    }
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, this.encrypt(token))
  }

  static getAccessToken(): string | null {
    const encrypted = localStorage.getItem(this.ACCESS_TOKEN_KEY)
    return encrypted ? this.decrypt(encrypted) : null
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp < Date.now() / 1000
    } catch {
      return true
    }
  }
}
