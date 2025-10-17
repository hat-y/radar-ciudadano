import { Box, Card, Text, Badge, Stack, Group } from '@mantine/core'
import type { Incident } from '../types/incident'
import { IncidentCategoryLabels } from '../types/incident'

interface Props {
  incidents: Incident[]
  onIncidentClick?: (incident: Incident) => void
}

export default function IncidentList({ incidents, onIncidentClick }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      THEFT: 'orange',
      ROBBERY: 'red',
      ASSAULT: 'red.9',
      VANDALISM: 'yellow',
      SUSPICIOUS_ACTIVITY: 'blue',
      VEHICLE_THEFT: 'orange.8',
      BURGLARY: 'red.7',
      OTHER: 'gray',
    }
    return colors[category] || 'gray'
  }

  if (incidents.length === 0) {
    return (
      <Box p="md">
        <Text c="dimmed" ta="center">
          No hay incidentes reportados en esta área
        </Text>
      </Box>
    )
  }

  return (
    <Stack gap="sm" p="sm">
      {incidents.map((incident) => (
        <Card
          key={incident.id}
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{ cursor: onIncidentClick ? 'pointer' : 'default' }}
          onClick={() => onIncidentClick?.(incident)}
        >
          <Group justify="space-between" mb="xs">
            <Badge color={getCategoryColor(incident.category)} variant="light">
              {IncidentCategoryLabels[incident.category]}
            </Badge>
            <Text size="xs" c="dimmed">
              {formatDate(incident.createdAt)}
            </Text>
          </Group>

          <Text size="sm" mb="xs">
            {incident.description}
          </Text>

          {incident.address && (
            <Text size="xs" c="dimmed">
              📍 {incident.address}
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  )
}
