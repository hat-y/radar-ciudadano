export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  message: string
  success: boolean
}
