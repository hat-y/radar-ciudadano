interface ReportNotificationData {
  reportId: number;
  neighborhood: string;
  localidad: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  createdAt: Date;
}

export const REPORT_NOTIFICATION_TEMPLATE = (
  data: ReportNotificationData,
  viewReportUrl: string,
  siteUrl: string,
  aboutUsUrl: string,
): string => {
  const mapUrl = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
  const formattedDate = new Date(data.createdAt).toLocaleString('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Reporte en ${data.neighborhood}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  
  <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🔔 Nuevo Reporte en Tu Barrio</h1>
    </div>

    <!-- Alert Badge -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-weight: 600;">
        📍 ${data.neighborhood}, ${data.localidad}
      </p>
    </div>

    <!-- Report Details -->
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
      <h2 style="color: #1f2937; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Detalles del Reporte</h2>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #6b7280;">Categoría:</strong>
        <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 14px; margin-left: 8px;">
          ${data.category}
        </span>
      </div>

      <div style="margin-bottom: 12px;">
        <strong style="color: #6b7280;">Descripción:</strong>
        <p style="margin: 8px 0 0 0; color: #1f2937; background-color: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
          ${data.description}
        </p>
      </div>

      <div style="margin-bottom: 12px;">
        <strong style="color: #6b7280;">Ubicación:</strong>
        <p style="margin: 8px 0 0 0;">
          <a href="${mapUrl}" style="color: #2563eb; text-decoration: none;">
            📍 Ver en Google Maps
          </a>
          <br>
          <span style="font-size: 13px; color: #6b7280;">
            Coordenadas: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}
          </span>
        </p>
      </div>

      <div style="margin-bottom: 0;">
        <strong style="color: #6b7280;">Fecha:</strong>
        <span style="color: #1f2937;">${formattedDate}</span>
      </div>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${viewReportUrl}" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
        Ver Reporte Completo
      </a>
    </div>

    <!-- Info Box -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        💡 <strong>Tip:</strong> Puedes ayudar confirmando si este problema también te afecta o agregando más información.
      </p>
    </div>

    <!-- Divider -->
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

    <!-- Footer -->
    <div style="text-align: center; font-size: 13px; color: #6b7280;">
      <p style="margin-bottom: 10px;">
        Estás recibiendo este email porque te suscribiste a notificaciones para <strong>${data.neighborhood}</strong>.
      </p>
      <p style="margin-bottom: 15px;">
        <a href="${siteUrl}/settings/notifications" style="color: #2563eb; text-decoration: none;">
          Administrar mis suscripciones
        </a>
      </p>
      <p style="margin-bottom: 15px;">
        <a href="${aboutUsUrl}" style="color: #6b7280; text-decoration: none;">Acerca de Radar Ciudadano</a>
        |
        <a href="${siteUrl}/contact" style="color: #6b7280; text-decoration: none;">Contacto</a>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} Radar Ciudadano. Todos los derechos reservados.
      </p>
    </div>

  </div>

</body>
</html>
  `;
};
