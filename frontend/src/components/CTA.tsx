import { Container, Text, Button, Group } from '@mantine/core'
import classes from './CTA.module.css'
import { Link } from 'react-router-dom'

export function CTA() {
  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h2 className={classes.title}>
          Únete a la comunidad y haz de tu barrio un lugar más seguro
        </h2>

        <Text className={classes.description} c="dimmed">
          Regístrate para empezar a reportar incidentes, recibir alertas y
          colaborar con tus vecinos.
        </Text>

        <Group className={classes.controls} justify="center" mt={30}>
          <Button
            component={Link}
            to="/register"
            size="xl"
            className={classes.control}
          >
            Registrarse
          </Button>
          <Button
            component={Link}
            to="/map"
            size="xl"
            variant="default"
            className={classes.control}
          >
            Explorar el mapa
          </Button>
        </Group>
      </Container>
    </div>
  )
}
