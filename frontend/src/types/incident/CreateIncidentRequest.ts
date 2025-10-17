import type { IncidentCategory } from './IncidentCategory'

export interface CreateIncidentRequest {
  category: IncidentCategory
  description: string
  latitude: number
  longitude: number
  address?: string
  isAnonymous?: boolean
}
