import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, Paper, Text, Loader, Alert, Stack } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react'
import { AuthService } from '../services/AuthServices'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setError('No se encontró el token de verificación')
        return
      }

      try {
        const authService = new AuthService()
        await authService.verifyLogin({ token })
        setStatus('success')

        // Redirect to map after 2 seconds
        setTimeout(() => {
          navigate('/map')
        }, 2000)
      } catch (err) {
        setStatus('error')
        setError(
          err instanceof Error
            ? err.message
            : 'Error al verificar el token. El enlace puede haber expirado.'
        )
      }
    }

    verifyToken()
  }, [searchParams, navigate])

  return (
    <Container size="sm" py="xl" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack align="center" gap="lg">
          {status === 'verifying' && (
            <>
              <Loader size="xl" />
              <Text size="lg" fw={500}>
                Verificando tu correo electrónico...
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Por favor espera mientras confirmamos tu identidad
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <IconCircleCheck size={64} color="green" />
              <Text size="xl" fw={700} c="green">
                ¡Verificación exitosa!
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Tu correo ha sido verificado correctamente. Redirigiendo al
                mapa...
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <IconAlertCircle size={64} color="red" />
              <Text size="xl" fw={700} c="red">
                Error de verificación
              </Text>
              <Alert
                color="red"
                title="No se pudo verificar tu correo"
                w="100%"
              >
                {error ||
                  'Ocurrió un error al verificar tu correo electrónico.'}
              </Alert>
              <Text size="sm" c="dimmed" ta="center">
                Por favor, intenta solicitar un nuevo enlace de inicio de
                sesión.
              </Text>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
