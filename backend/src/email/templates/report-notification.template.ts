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
  <title>Alerta de Seguridad - ${data.neighborhood}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e3a8a; max-width: 650px; margin: 0 auto; padding: 0; background-color: #e0e7ff;">
  
  <!-- Outer Container -->
  <div style="background-color: #e0e7ff; padding: 20px;">
    
    <!-- Main Card -->
    <div style="background-color: #ffffff; border: 2px solid #1e40af; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
      
      <!-- Header with Blue Background -->
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 25px 30px; border-bottom: 3px solid #1e3a8a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
                RADAR CIUDADANO
              </h1>
              <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 13px; font-weight: 500;">
                Sistema de Monitoreo de Seguridad
              </p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="background-color: #dc2626; color: white; padding: 8px 16px; border-radius: 3px; font-weight: 700; font-size: 12px; display: inline-block; letter-spacing: 0.5px;">
                NUEVO REPORTE
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Content Area -->
      <div style="padding: 30px;">
        
        <!-- Alert Banner -->
        <div style="background-color: #1e40af; border-left: 5px solid #dc2626; padding: 18px 20px; margin-bottom: 25px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 15px;">
                <div style="background-color: #dc2626; color: white; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; font-weight: bold;">
                  ⚠
                </div>
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; color: #ffffff; font-weight: 600; font-size: 16px;">
                  INCIDENTE REPORTADO
                </p>
                <p style="margin: 3px 0 0 0; color: #bfdbfe; font-size: 14px;">
                  ${data.neighborhood}, ${data.localidad}
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Report Details Box -->
        <div style="border: 2px solid #dbeafe; border-radius: 4px; margin-bottom: 25px; overflow: hidden;">
          
          <!-- Section Header -->
          <div style="background-color: #1e40af; padding: 12px 20px; border-bottom: 2px solid #1e3a8a;">
            <h2 style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 600; letter-spacing: 0.3px;">
              INFORMACIÓN DEL REPORTE
            </h2>
          </div>

          <!-- Details Content -->
          <div style="padding: 20px; background-color: #f8fafc;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                  <strong style="color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Categoría:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1; text-align: right;">
                  <span style="background-color: #1e40af; color: white; padding: 5px 14px; border-radius: 2px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">
                    ${data.category}
                  </span>
                </td>
              </tr>
            </table>

            <div style="margin-bottom: 15px;">
              <strong style="color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Descripción:</strong>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #1e40af; padding: 15px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                ${data.description}
              </div>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                  <strong style="color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Ubicación:</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1; text-align: right;">
                  <a href="${mapUrl}" style="color: #1e40af; text-decoration: none; font-weight: 600; font-size: 13px;">
                    ▸ VER EN MAPA
                  </a>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0;">
                  <span style="font-size: 12px; color: #475569;">
                    Coordenadas: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}
                  </span>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 10px 0;">
                  <strong style="color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora:</strong>
                </td>
                <td style="padding: 10px 0; text-align: right;">
                  <span style="color: #1e3a8a; font-weight: 600; font-size: 14px;">${formattedDate}</span>
                </td>
              </tr>
            </table>

          </div>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${viewReportUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 3px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.3); border: 2px solid #1e3a8a;">
            ACCEDER AL REPORTE COMPLETO
          </a>
        </div>

        <!-- Security Notice -->
        <div style="background-color: #eff6ff; border: 1px solid #1e40af; border-radius: 3px; padding: 18px; margin-bottom: 25px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; width: 30px;">
                <div style="color: #1e40af; font-size: 20px; font-weight: bold;">ℹ</div>
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.5;">
                  <strong>Importante:</strong> Este reporte ha sido registrado en el sistema de monitoreo. 
                  Puede proporcionar información adicional o confirmar la situación a través de la plataforma.
                </p>
              </td>
            </tr>
          </table>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; border-top: 2px solid #cbd5e1; padding: 25px 30px;">
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569; text-align: center; line-height: 1.5;">
          Usted está recibiendo esta notificación porque se encuentra suscrito a las alertas de seguridad de <strong>${data.neighborhood}</strong>.
        </p>
        <p style="margin: 0 0 15px 0; text-align: center;">
          <a href="${siteUrl}/settings/notifications" style="color: #1e40af; text-decoration: none; font-size: 12px; font-weight: 600;">
            Administrar Suscripciones
          </a>
        </p>
        <div style="border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 15px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">
            <a href="${aboutUsUrl}" style="color: #64748b; text-decoration: none; margin: 0 10px;">Acerca de Radar Ciudadano</a>
            |
            <a href="${siteUrl}/contact" style="color: #64748b; text-decoration: none; margin: 0 10px;">Contacto</a>
          </p>
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">
            © ${new Date().getFullYear()} Radar Ciudadano. Sistema de Monitoreo de Seguridad. Todos los derechos reservados.
          </p>
        </div>
      </div>

    </div>

  </div>

</body>
</html>
  `;
};
