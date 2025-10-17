import { Container, Title, Text, Paper, Stack, Grid, Card } from '@mantine/core'
import {
  IconChartBar,
  IconAlertTriangle,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react'

export default function StatsPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Estadísticas
          </Title>
          <Text c="dimmed">
            Visualiza las estadísticas de incidentes en tu área
          </Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconAlertTriangle size={48} stroke={1.5} color="orange" />
                <Text size="xl" fw={700}>
                  0
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Incidentes Totales
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconMapPin size={48} stroke={1.5} color="blue" />
                <Text size="xl" fw={700}>
                  0
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  En tu Área
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconChartBar size={48} stroke={1.5} color="green" />
                <Text size="xl" fw={700}>
                  0%
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Resueltos
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconUsers size={48} stroke={1.5} color="purple" />
                <Text size="xl" fw={700}>
                  0
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Usuarios Activos
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg" py="xl">
            <IconChartBar size={64} stroke={1.5} color="gray" />
            <Text size="lg" fw={500} ta="center">
              Estadísticas Detalladas
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Las estadísticas detalladas estarán disponibles próximamente.
              Podrás visualizar gráficos, tendencias y análisis de los
              incidentes en tu comunidad.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
