import { AuthUser } from './AuthUser'

export interface LoginResponse {
  user: AuthUser
  accessToken: string
}
