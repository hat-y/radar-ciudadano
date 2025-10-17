import { AppShell, Burger, Group, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuthService } from '../hooks/useAuthService'
import { BottomNav } from '../components'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthService()
  const [opened, { toggle }] = useDisclosure()

  if (isLoading) {
    return <Skeleton height="100vh" />
  }

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>LOGO</div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <MediaQuery smallerThan="sm" styles={{ width: '100%' }}>
        <BottomNav />
      </MediaQuery>
    </AppShell>
  )
}
