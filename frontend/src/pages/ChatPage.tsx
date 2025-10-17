import { Container, Title, Text, Paper, Stack } from '@mantine/core'
import { IconMessages } from '@tabler/icons-react'

export default function ChatPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Chat Comunitario
          </Title>
          <Text c="dimmed">Comunícate con otros usuarios en tu área</Text>
        </div>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg" py="xl">
            <IconMessages size={64} stroke={1.5} color="gray" />
            <Text size="lg" fw={500} ta="center">
              Chat Comunitario
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Esta función estará disponible próximamente. Podrás comunicarte
              con otros usuarios de tu área para compartir información sobre
              incidentes en tiempo real.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
