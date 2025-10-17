import { NavLink } from 'react-router-dom'
import { Button, Stack, Divider, Text } from '@mantine/core'
import {
  IconMap,
  IconMessages,
  IconChartBar,
  IconLogout,
} from '@tabler/icons-react'
import { useAuthService } from '../hooks/useAuthService'

export function Sidebar() {
  const { logout, isAuthenticated, user } = useAuthService()

  return (
    <Stack justify="space-between" h="100%">
      <Stack gap="xs">
        <NavLink to="/map" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'light' : 'subtle'}
              leftSection={<IconMap size={18} />}
              fullWidth
              justify="flex-start"
            >
              Mapa
            </Button>
          )}
        </NavLink>

        <NavLink to="/chat" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'light' : 'subtle'}
              leftSection={<IconMessages size={18} />}
              fullWidth
              justify="flex-start"
            >
              Chat
            </Button>
          )}
        </NavLink>

        <NavLink to="/stats" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'light' : 'subtle'}
              leftSection={<IconChartBar size={18} />}
              fullWidth
              justify="flex-start"
            >
              Estadísticas
            </Button>
          )}
        </NavLink>
      </Stack>

      {isAuthenticated && (
        <Stack gap="xs">
          <Divider />
          <Text size="xs" c="dimmed" px="sm">
            {user?.email || 'Usuario'}
          </Text>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={18} />}
            onClick={logout}
            fullWidth
            justify="flex-start"
          >
            Cerrar Sesión
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
