export type IncidentCategory =
  | 'THEFT'
  | 'ROBBERY'
  | 'ASSAULT'
  | 'VANDALISM'
  | 'SUSPICIOUS_ACTIVITY'
  | 'VEHICLE_THEFT'
  | 'BURGLARY'
  | 'OTHER'

export const INCIDENT_CATEGORIES = {
  THEFT: 'THEFT',
  ROBBERY: 'ROBBERY',
  ASSAULT: 'ASSAULT',
  VANDALISM: 'VANDALISM',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  VEHICLE_THEFT: 'VEHICLE_THEFT',
  BURGLARY: 'BURGLARY',
  OTHER: 'OTHER',
} as const

export const IncidentCategoryLabels: Record<IncidentCategory, string> = {
  THEFT: 'Robo',
  ROBBERY: 'Asalto con violencia',
  ASSAULT: 'Agresión',
  VANDALISM: 'Vandalismo',
  SUSPICIOUS_ACTIVITY: 'Actividad sospechosa',
  VEHICLE_THEFT: 'Robo de vehículo',
  BURGLARY: 'Allanamiento',
  OTHER: 'Otro',
}
