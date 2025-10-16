export const VERIFICATION_EMAIL_TEMPLATE = `
<div style="text-align: center; font-family:sans-serif; margin:0;padding:0; background-color: #FFFFFF;">
  <table width="600" bgcolor="#1E3A5F" style="background-color: #1E3A5F; margin: 0 auto; padding: 20px 0;">
    <tr>
        <td align="center">
            <a href="URL_SITIO_PLACEHOLDER" style="text-decoration: none; font-size: 24px; font-weight: bold; font-family: Arial, sans-serif;">
                <span style="color: #FFFFFF;">CON</span><span style="color: #6EBABF;">CIENCIA</span>
            </a>
        </td>
    </tr>
  </table>
  <div style="padding:20px; border-radius:20px;">
    <h2 style="color: #333333; margin-bottom: 20px;">TITLE_PLACEHOLDER</h2>
    <p style="color: #333333; margin-bottom: 15px;">¡Hola NAME_PLACEHOLDER!</p>
    <p style="color: #333333; margin-bottom: 15px;">Gracias por registrarte en Conciencia. Para activar tu cuenta como: <strong>ROLE_PLACEHOLDER</strong>, por favor verifica tu correo electrónico haciendo clic en el botón de abajo.</p>
    <p style="margin-bottom:30px; color: #333333;">Haz clic en el botón para verificar tu cuenta:</p>
    <div style="margin-bottom:10px">
      <a href="URL_PLACEHOLDER" style="
          background-color: #2F74A6;
          color: #fff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;">ACTION_PLACEHOLDER</a>
    </div>
    <p style="color: #666666; font-size: 0.8em; margin-top: 10px;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
    <p style="color: #666666; font-size: 0.8em; margin-bottom: 5px;"><a href="URL_PLACEHOLDER" style="color: #666666; text-decoration: underline;">URL_PLACEHOLDER</a></p>
    <p style="color: #E8603C; font-size: 0.9em; margin-bottom: 30px;">Este enlace expira en 24 horas. Por tu seguridad, no compartas este enlace.</p>
    <p style="color: #333333;">Si no solicitaste esta acción, ignora este correo.</p>
    <p style="margin-top: 20px;"><a href="ABOUT_US_URL_PLACEHOLDER" style="color: #1E3A5F; text-decoration: underline;">- El equipo de Conciencia</a></p>
  </div>
  <div style="background-color: #F0F0F0; padding: 15px 0; font-size: 0.8em; color: #666666;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Conciencia. Todos los derechos reservados.</p>
    <p style="margin: 5px 0 0;">Contacto: info@conciencia.studio | <a href="#" style="color: #666666; text-decoration: underline;">Política de Privacidad</a></p>
  </div>
</div>`;
