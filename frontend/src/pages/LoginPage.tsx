import { useState } from 'react'
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Alert,
  Box,
} from '@mantine/core'
import { IconMail, IconCircleCheck } from '@tabler/icons-react'
import { AuthService } from '../services/AuthServices'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    setLoading(true)
    setError('')

    try {
      const authService = new AuthService()
      await authService.requestLogin({ email })
      setEmailSent(true)
    } catch {
      setError('Error al enviar el correo. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="xs" py="xl" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} mb="md" ta="center">
          Ingresar
        </Title>

        {!emailSent ? (
          <Box component="form" onSubmit={handleRequestToken}>
            <Stack gap="md">
              <Text size="sm" c="dimmed" ta="center">
                Ingresa tu correo electrónico y te enviaremos un enlace para
                iniciar sesión
              </Text>

              {error && (
                <Alert color="red" title="Error">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Correo electrónico"
                placeholder="tu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<IconMail size={16} />}
                required
                size="md"
              />

              <Button type="submit" fullWidth size="md" loading={loading}>
                Enviar enlace de acceso
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack align="center" gap="lg">
            <IconCircleCheck size={64} color="green" />
            <Text size="lg" fw={500} ta="center">
              ¡Correo enviado!
            </Text>
            <Alert color="green" w="100%">
              Hemos enviado un enlace de inicio de sesión a{' '}
              <strong>{email}</strong>
            </Alert>
            <Text size="sm" c="dimmed" ta="center">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace
              para acceder a tu cuenta.
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Si no recibes el correo en unos minutos, verifica tu carpeta de
              spam o correo no deseado.
            </Text>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
