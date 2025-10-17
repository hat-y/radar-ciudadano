import axios from 'axios'
import { SecureTokenStorage } from '../utils/SecureTokenStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = SecureTokenStorage.getAccessToken()
    if (token && !SecureTokenStorage.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed - forcing logout')
      SecureTokenStorage.clearTokens()
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
export { API_URL }
