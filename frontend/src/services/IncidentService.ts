import { IncidentRepository } from '../repositories/IncidentRepository'
import type { Incident, CreateIncidentRequest } from '../types/incident'

export class IncidentService {
  private repo = new IncidentRepository()

  async getIncidents(): Promise<Incident[]> {
    return await this.repo.getIncidents()
  }

  async getIncidentById(id: string): Promise<Incident> {
    return await this.repo.getIncidentById(id)
  }

  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    return await this.repo.createIncident(data)
  }

  async getNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Incident[]> {
    return await this.repo.getNearbyIncidents(latitude, longitude, radiusKm)
  }
}
