import { Button, Container, Text, Title, Group, Divider } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import classes from './Hero.module.css'
import { SearchBar } from './SearchBar'

export function Hero() {
  const navigate = useNavigate()

  const openMapAtUserLocation = () => {
    if (!navigator.geolocation) return alert('Geolocalización no disponible')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        navigate(`/map?lat=${lat}&lng=${lng}`)
      },
      () => alert('No se pudo obtener ubicación')
    )
  }

  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Radar{' '}
              <Text component="span" inherit>
                Ciudadano
              </Text>
            </Title>

            <Text className={classes.description} mt={30}>
              Explora el mapa de la ciudad de Formosa y reporta incidencias de
              forma simple y colaborativa. Contribuye al bienestar de tu
              comunidad.
            </Text>

            <Group mt={40} className={classes.controls}>
              <Button
                size="md"
                className={classes.control}
                onClick={openMapAtUserLocation}
              >
                Abrir en mi ubicación
              </Button>
              <Divider label="o" labelPosition="center" />
              <div style={{ flex: 1 }}>
                <SearchBar
                  placeholder="Buscar en Formosa (ej. barrio o calle)"
                  size="md"
                  radius="xs"
                  onSearch={(value: string) =>
                    navigate(`/map?q=${encodeURIComponent(value)}`)
                  }
                />
              </div>
            </Group>
          </div>
        </div>
      </Container>
    </div>
  )
}
