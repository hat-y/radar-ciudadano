import axios from '../config/axios'
import type { Incident, CreateIncidentRequest } from '../types/incident'

export class IncidentRepository {
  private basePath = '/incidents'

  async getIncidents(params?: {
    latitude?: number
    longitude?: number
    radius?: number
  }): Promise<Incident[]> {
    const response = await axios.get<Incident[]>(this.basePath, { params })
    return response.data
  }

  async getIncidentById(id: string): Promise<Incident> {
    const response = await axios.get<Incident>(`${this.basePath}/${id}`)
    return response.data
  }

  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    const response = await axios.post<Incident>(this.basePath, data)
    return response.data
  }

  async getNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Incident[]> {
    const response = await axios.get<Incident[]>(`${this.basePath}/nearby`, {
      params: { latitude, longitude, radius: radiusKm },
    })
    return response.data
  }
}
