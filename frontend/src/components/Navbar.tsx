import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Text,
  ScrollArea,
} from '@mantine/core'
import { useDisclosure, useHeadroom } from '@mantine/hooks'
import classes from './Navbar.module.css'
import { Link } from 'react-router-dom'

export function Navbar() {
  const pinned = useHeadroom({ fixedAt: 120 })

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false)

  return (
    <Box>
      <Box style={{ height: '90px' }} />

      <header
        className={classes.header}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transform: `translate3d(0, ${pinned ? 0 : '-100%'}, 0)`,
          transition: 'transform 400ms ease',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group
          justify="space-around"
          h="100%"
          gap={'xl'}
          wrap="nowrap"
          className={classes.responsiveGroup}
        >
          <Text fz="lg" fw={500} className={classes.logo}>
            RADAR CIUDADANO
          </Text>
          <Group gap="sm" visibleFrom="lg">
            <Button
              size="lg"
              className={classes.menuItem}
              component={Link}
              to="/login"
            >
              Ingresar
            </Button>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="lg"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          <Link to="/" className={classes.logo}>
            Radar Ciudadano
          </Link>
        }
        hiddenFrom="lg"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button
              radius="xs"
              className={classes.menuItem}
              component={Link}
              to="/login"
              onClick={closeDrawer}
            >
              Ingresar
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  )
}
