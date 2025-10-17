import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  rem,
  useMantineTheme,
} from '@mantine/core'
import {
  IconMap2,
  IconBellRinging,
  IconAlertTriangle,
  IconReport,
} from '@tabler/icons-react'
import classes from './Features.module.css'

const mockdata = [
  {
    title: 'Reporta incidentes',
    description:
      'Crea reportes de incidentes en tiempo real, ayudando a mantener a tu comunidad informada y segura.',
    icon: IconReport,
  },
  {
    title: 'Visualiza el mapa',
    description:
      'Explora un mapa interactivo con todos los incidentes reportados por la comunidad.',
    icon: IconMap2,
  },
  {
    title: 'Zonas de peligro',
    description:
      'Identifica las zonas con mayor recurrencia de incidentes para tomar precauciones.',
    icon: IconAlertTriangle,
  },
  {
    title: 'Notificaciones',
    description:
      'Recibe notificaciones sobre nuevos incidentes en las zonas que te interesan.',
    icon: IconBellRinging,
  },
]

export function Features() {
  const theme = useMantineTheme()
  const features = mockdata.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
    >
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]}
      />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ))

  return (
    <Container size="lg" py="xl">
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Una herramienta para una comunidad más segura
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Descubre cómo Radar Ciudadano te puede ayudar a estar más seguro y
        conectado con tu comunidad.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  )
}
