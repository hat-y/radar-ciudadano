import { Box, Text, Stack } from '@mantine/core'
import { IconMap } from '@tabler/icons-react'

export default function MapPage() {
  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Stack align="center" gap="lg">
        <IconMap size={64} stroke={1.5} color="gray" />
        <Text size="lg" fw={500} c="dimmed">
          Mapa de Incidentes
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={400}>
          Esta sección está lista para ser implementada
        </Text>
      </Stack>
    </Box>
  )
}
