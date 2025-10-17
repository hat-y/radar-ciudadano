import { useState } from 'react'
import { Container, Paper, Title, Text, Box, Alert } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import ReportForm from '../components/ReportForm'
import { IncidentService } from '../services/IncidentService'
import type { CreateIncidentRequest } from '../types/incident'

export default function ReportIncidentPage() {
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const incidentService = new IncidentService()

  const handleSubmit = async (data: CreateIncidentRequest) => {
    await incidentService.createIncident(data)
    setSuccess(true)

    // Redirect to map after 2 seconds
    setTimeout(() => {
      navigate('/map')
    }, 2000)
  }

  const handleCancel = () => {
    navigate('/map')
  }

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Title order={2} mb="md">
          Reportar Incidente
        </Title>

        <Text c="dimmed" mb="xl">
          Tu reporte ayudará a mantener informada a la comunidad sobre
          incidentes de seguridad en tu área.
        </Text>

        {success ? (
          <Alert color="green" title="¡Reporte enviado!">
            Tu reporte ha sido enviado exitosamente. Redirigiendo al mapa...
          </Alert>
        ) : (
          <Box>
            <ReportForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </Box>
        )}
      </Paper>
    </Container>
  )
}
