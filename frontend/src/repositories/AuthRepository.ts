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
    const { data } = await axiosInstance.post<LoginResponse>(
      '/auth/verify-login',
      credentials
    )
    return data
  }

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  }
}
