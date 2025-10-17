import type { UserRoles } from './UserRoles'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  isEmailVerified: boolean
  roles: UserRoles[]
}
