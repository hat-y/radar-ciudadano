// Modulos Externos
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// Modulos Internos
import { EmailException } from './email.exceptions';
import { EMAIL_SUBJECTS, EMAIL_ACTIONS } from './constants/email-constants';
import { ResendResponse } from './interfaces/resend-response.interface';
import { VERIFICATION_EMAIL_TEMPLATE } from './templates/verification-email.template';
import { PASSWORD_RESET_EMAIL_TEMPLATE } from './templates/password-reset-email.template';
import { INVITATION_EMAIL_TEMPLATE } from './templates/invitation-email.template';
import {
  ROLE_TRANSLATIONS,
  RoleName,
} from './constants/role-translations.constants';
import { REPORT_NOTIFICATION_TEMPLATE } from './templates/report-notification.template';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    const from = this.configService.getOrThrow<string>('EMAIL_FROM');

    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    role?: string,
    firstName?: string,
  ) {
    const verifyUrl = `${this.configService.getOrThrow<string>('FRONT')}/auth/verify-email/${token}`;
    const siteUrl = this.configService.getOrThrow<string>('FRONT');
    const aboutUsUrl = `${siteUrl}/about-us`;

    const html = this.buildTemplate(
      VERIFICATION_EMAIL_TEMPLATE,
      EMAIL_SUBJECTS.VERIFICATION,
      verifyUrl,
      EMAIL_ACTIONS.VERIFY_EMAIL,
      siteUrl,
      role,
      aboutUsUrl,
      firstName,
    );
    return this.sendEmail(to, EMAIL_SUBJECTS.VERIFICATION, html);
  }

  async sendPasswordResetEmail(to: string, token: string, firstName?: string) {
    const resetUrl = `${this.configService.getOrThrow<string>('FRONT')}/auth/reset-password/${token}`;
    const siteUrl = this.configService.getOrThrow<string>('FRONT');
    const aboutUsUrl = `${siteUrl}/about-us`;

    const html = this.buildTemplate(
      PASSWORD_RESET_EMAIL_TEMPLATE,
      EMAIL_SUBJECTS.PASSWORD_RESET,
      resetUrl,
      EMAIL_ACTIONS.RESET_PASSWORD,
      siteUrl,
      undefined,
      aboutUsUrl,
      firstName,
    );
    return this.sendEmail(to, EMAIL_SUBJECTS.PASSWORD_RESET, html);
  }

  async sendInvitationEmail(
    to: string,
    invitationLink: string,
    role: string,
    firstName?: string,
  ) {
    const translatedRole = ROLE_TRANSLATIONS[role as RoleName] || role;
    const subject = `Invitación de Conciencia para Unirte como ${translatedRole}`;
    const siteUrl = this.configService.getOrThrow<string>('FRONT');
    const aboutUsUrl = `${siteUrl}/about-us`;

    const html = this.buildTemplate(
      INVITATION_EMAIL_TEMPLATE,
      subject,
      invitationLink,
      EMAIL_ACTIONS.ACCEPT_INVITATION,
      siteUrl,
      role,
      aboutUsUrl,
      firstName,
    );
    return this.sendEmail(to, subject, html);
  }

  async sendMagicLink(
    to: string,
    magicLink: string,
    firstName?: string,
  ): Promise<void> {
    const appName =
      this.configService.get<string>('APP_NAME') || 'Radar Ciudadano';
    const subject = `Tu enlace de acceso a ${appName}`;
    const html = this.getMagicLinkTemplate(magicLink, appName, firstName);

    await this.sendEmail(to, subject, html);
  }

  private getMagicLinkTemplate(
    magicLink: string,
    appName: string,
    firstName?: string,
  ): string {
    const greeting = firstName ? `¡Hola ${firstName}!` : '¡Hola!';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .magic-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 16px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .magic-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          .instructions {
            background-color: #f8f9fa;
            border-left: 4px solid #2563eb;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
          }
          .expiry {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 15px;
          }
          .emoji {
            font-size: 40px;
            margin-bottom: 10px;
          }
          .alternative-link {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">✨</div>
            <h1>Acceso a ${appName}</h1>
            <p>${greeting}</p>
            <p>Haz clic en el botón para iniciar sesión automáticamente</p>
          </div>
          
          <div class="button-container">
            <a href="${magicLink}" class="magic-button">
              🚀 Iniciar Sesión
            </a>
          </div>
          
          <div class="expiry">
            ⏱️ Este enlace es válido por <strong>15 minutos</strong>
          </div>
          
          <div class="instructions">
            <strong>📋 ¿Cómo funciona?</strong>
            <ol style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Haz clic en el botón "Iniciar Sesión"</li>
              <li>Serás redirigido automáticamente</li>
              <li>¡Listo! Ya estarás dentro de ${appName}</li>
            </ol>
          </div>
          
          <div class="warning">
            <strong>Importante:</strong> Si no solicitaste este enlace, ignora este email. 
            Nunca compartas este enlace con nadie. Este enlace solo funcionará una vez.
          </div>
          
          <div class="alternative-link">
            <p><strong>¿El botón no funciona?</strong></p>
            <p>Copia y pega este enlace en tu navegador:</p>
            <p style="color: #2563eb;">${magicLink}</p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const response: ResendResponse = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });

      this.logger.debug(
        `Respuesta completa de Resend: ${JSON.stringify(response)}`,
      );

      if (response?.error) {
        this.logger.error(
          `Error al enviar email a ${to}: ${response.error.message || 'Error desconocido'}`,
        );
      }

      if (!response.data || !response.data.id) {
        this.logger.error(
          `Error al enviar email a ${to}: Respuesta inválida de la API de correo`,
        );
        throw new EmailException(subject, to);
      }

      this.logger.log(`Correo enviado a ${to} (ID: ${response.data.id})`);
      return response.data as { id: string };
    } catch (err) {
      this.logger.error(`Excepción al enviar email a ${to}: ${err.message}`);
      if (err instanceof EmailException) throw err;
      throw new EmailException(subject, to, err);
    }
  }

  private buildTemplate(
    templateString: string,
    title: string,
    url: string,
    action: string,
    siteUrl: string,
    role?: string,
    aboutUsUrl?: string,
    firstName?: string,
  ): string {
    let template = templateString
      .replace('TITLE_PLACEHOLDER', title)
      .replace(/URL_PLACEHOLDER/g, url)
      .replace('ACTION_PLACEHOLDER', action)
      .replace('URL_SITIO_PLACEHOLDER', siteUrl);

    if (role) {
      const translatedRole = ROLE_TRANSLATIONS[role as RoleName] || role;
      template = template.replace('ROLE_PLACEHOLDER', translatedRole);
    } else {
      template = template.replace(
        /<p[^>]*>Estimado\/a futuro\/a colaborador\/a,<\/p>\s*<p[^>]*>El equipo editorial de Conciencia se complace en invitarte a unirte a nuestra plataforma como: <strong>ROLE_PLACEHOLDER<\/strong><\/p>/,
        '',
      );
      template = template.replace(
        /<p[^>]*>Gracias por registrarte en Conciencia. Para activar tu cuenta como: <strong>ROLE_PLACEHOLDER<\/strong>, por favor verifica tu correo electrónico haciendo clic en el botón de abajo.<\/p>/,
        '',
      );
    }

    if (firstName) {
      template = template.replace('NAME_PLACEHOLDER', firstName);
    } else {
      template = template.replace(/¡Hola NAME_PLACEHOLDER!/, '¡Hola!');
      template = template.replace(/¡Hola NAME_PLACEHOLDER,/, '¡Hola,');
    }

    if (aboutUsUrl) {
      template = template.replace('ABOUT_US_URL_PLACEHOLDER', aboutUsUrl);
    } else {
      template = template.replace(
        /<a href="ABOUT_US_URL_PLACEHOLDER"[^>]*>- El equipo de Conciencia<\/a>/,
        '- El equipo de Conciencia',
      );
    }

    return template;
  }

  async sendReportNotification(
    to: string,
    reportData: {
      reportId: number;
      neighborhood: string;
      localidad: string;
      description: string;
      category: string;
      lat: number;
      lng: number;
      createdAt: Date;
    },
  ) {
    const siteUrl = this.configService.getOrThrow<string>('FRONT');
    const viewReportUrl = `${siteUrl}/reports/${reportData.reportId}`;
    const aboutUsUrl = `${siteUrl}/about-us`;

    const html = REPORT_NOTIFICATION_TEMPLATE(
      reportData,
      viewReportUrl,
      siteUrl,
      aboutUsUrl,
    );

    const subject = `🔔 Nuevo reporte en ${reportData.neighborhood}`;
    return this.sendEmail(to, subject, html);
  }
}
