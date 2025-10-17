import { Box, Text } from '@mantine/core'

interface Props {
  lat?: number
  lng?: number
}

export default function MapView({ lat, lng }: Props) {
  return (
    <Box
      style={{
        height: '70vh',
        background: '#e6f7ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>
        Mapa (placeholder){' '}
        {lat ? `Lat: ${lat}, Lng: ${lng}` : 'Sin coordenadas'}
      </Text>
    </Box>
  )
}
