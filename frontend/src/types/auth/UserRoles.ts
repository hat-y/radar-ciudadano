export const UserRoles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  JEFATURA: 'JEFATURA',
} as const

export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles]
