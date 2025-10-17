import type { IncidentCategory } from './IncidentCategory'

export interface Incident {
  id: string
  category: IncidentCategory
  description: string
  latitude: number
  longitude: number
  address?: string
  createdAt: string
  userId?: string
  isAnonymous: boolean
  status: 'ACTIVE' | 'RESOLVED' | 'UNVERIFIED'
}
