import { Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Incident } from '../types/incident'
import { IncidentCategoryLabels } from '../types/incident'

interface Props {
  incident: Incident
  onClick?: (incident: Incident) => void
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    THEFT: '#FFA500',
    ROBBERY: '#FF0000',
    ASSAULT: '#8B0000',
    VANDALISM: '#FFD700',
    SUSPICIOUS_ACTIVITY: '#4682B4',
    VEHICLE_THEFT: '#FF4500',
    BURGLARY: '#DC143C',
    OTHER: '#808080',
  }
  return colors[category] || '#808080'
}

export default function IncidentMarker({ incident, onClick }: Props) {
  const iconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="40">
      <path d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z" 
            fill="${getCategoryColor(incident.category)}" 
            stroke="#fff" 
            stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="#fff"/>
    </svg>
  `)}`

  const customIcon = new Icon({
    iconUrl,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Marker
      position={[incident.latitude, incident.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick?.(incident),
      }}
    >
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
            {IncidentCategoryLabels[incident.category]}
          </h3>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            {incident.description}
          </p>
          {incident.address && (
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              📍 {incident.address}
            </p>
          )}
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
            🕒 {formatDate(incident.createdAt)}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
