import { ActionIcon, Group, Box } from '@mantine/core'
import { IconHome, IconMapPin } from '@tabler/icons-react'

interface Props {
  onOpenMap?: () => void
}

export function BottomNav({ onOpenMap }: Props) {
  return (
    <Box
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 8,
        background: '#fff',
        borderTop: '1px solid #eee',
      }}
    >
      <Group justify="space-between">
        <ActionIcon variant="light" size="lg">
          <IconHome />
        </ActionIcon>
        <ActionIcon variant="light" size="lg" onClick={onOpenMap}>
          <IconMapPin />
        </ActionIcon>
      </Group>
    </Box>
  )
}
