import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Select,
  Textarea,
  TextInput,
  Stack,
  Text,
  Alert,
  Group,
  Checkbox,
} from '@mantine/core'
import type { CreateIncidentRequest, IncidentCategory } from '../types/incident'
import { INCIDENT_CATEGORIES, IncidentCategoryLabels } from '../types/incident'
import { GeolocationService } from '../services/GeolocationService'

interface Props {
  onSubmit: (data: CreateIncidentRequest) => Promise<void>
  onCancel?: () => void
}

export default function ReportForm({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<IncidentCategory | ''>('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    // Get user's current location when component mounts
    const geoService = new GeolocationService()
    const getLocation = async () => {
      try {
        const coords = await geoService.getCurrentPosition()
        setLatitude(coords.latitude)
        setLongitude(coords.longitude)
        setLocationError(null)
      } catch {
        setLocationError(
          'No se pudo obtener tu ubicación. Por favor, habilita la geolocalización.'
        )
      }
    }
    getLocation()
  }, [])

  const handleSubmit = async () => {
    if (!category) {
      setError('Por favor selecciona una categoría')
      return
    }
    if (!description.trim()) {
      setError('Por favor ingresa una descripción')
      return
    }
    if (latitude === null || longitude === null) {
      setError('No se pudo obtener tu ubicación. Intenta nuevamente.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        category,
        description: description.trim(),
        latitude,
        longitude,
        address: address.trim() || undefined,
        isAnonymous,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al enviar el reporte'
      )
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = Object.values(INCIDENT_CATEGORIES).map((cat) => ({
    value: cat,
    label: IncidentCategoryLabels[cat as IncidentCategory],
  }))

  return (
    <Box>
      <Stack gap="md">
        {locationError && (
          <Alert color="red" title="Error de ubicación">
            {locationError}
          </Alert>
        )}

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {latitude && longitude && (
          <Text size="sm" c="dimmed">
            📍 Ubicación detectada: {latitude.toFixed(6)},{' '}
            {longitude.toFixed(6)}
          </Text>
        )}

        <Select
          label="Categoría del incidente"
          placeholder="Selecciona una categoría"
          data={categoryOptions}
          value={category}
          onChange={(value) => setCategory(value as IncidentCategory)}
          required
        />

        <Textarea
          label="Descripción"
          placeholder="Describe lo que sucedió..."
          minRows={4}
          maxRows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <TextInput
          label="Dirección (opcional)"
          placeholder="Ej: Calle 123, Colonia Centro"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Checkbox
          label="Reportar de forma anónima"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.currentTarget.checked)}
        />

        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!latitude || !longitude}
          >
            Enviar Reporte
          </Button>
        </Group>
      </Stack>
    </Box>
  )
}
