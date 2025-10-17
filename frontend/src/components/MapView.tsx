import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Box, Text, Loader, Center } from '@mantine/core'
import 'leaflet/dist/leaflet.css'
import type { Incident } from '../types/incident'
import IncidentMarker from './IncidentMarker'

interface Props {
  incidents: Incident[]
  center?: [number, number]
  zoom?: number
  onIncidentClick?: (incident: Incident) => void
  userLocation?: { latitude: number; longitude: number } | null
}

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

export default function MapView({
  incidents,
  center = [19.4326, -99.1332], // Default: Mexico City
  zoom = 13,
  onIncidentClick,
  userLocation,
}: Props) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
    }
  }, [userLocation])

  useEffect(() => {
    // Simulate loading time for map initialization
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Box
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Center>
          <Loader size="lg" />
          <Text ml="md">Cargando mapa...</Text>
        </Center>
      </Box>
    )
  }

  return (
    <Box style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />

        {incidents.map((incident) => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
            onClick={onIncidentClick}
          />
        ))}
      </MapContainer>
    </Box>
  )
}
