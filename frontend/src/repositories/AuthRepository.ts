import axiosInstance from '../config/axios'
import type {
  LoginRequest,
  LoginResponse,
  VerifyLoginRequest,
} from '../types/auth'

export class AuthRepository {
  async requestLogin(credentials: LoginRequest): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      '/auth/request-login',
      credentials
    )
    return data
  }

  async verifyLogin(credentials: VerifyLoginRequest): Promise<LoginResponse> {
    const { data } = await axiosInstance.get<LoginResponse>(
      `/auth/verify-login?token=${credentials.token}`
    )
    return data
  }

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  }
}
