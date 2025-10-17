import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeighborhoodSubscription } from '../users/entities/neighborhood-subscription.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NeighborhoodSubscription)
    private readonly subscriptionRepo: Repository<NeighborhoodSubscription>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Notifica a todos los usuarios suscritos a un barrio sobre un nuevo reporte
   */
  async notifyNeighborhoodSubscribers(report: any) {
    if (!report.neighborhoodName) {
      this.logger.warn(
        `Report ${report.id} has no neighborhood, skipping notifications`,
      );
      return;
    }

    try {
      // Buscar todos los usuarios suscritos a este barrio con notificaciones de email activas
      const subscriptions = await this.subscriptionRepo.find({
        where: {
          neighborhoodName: report.neighborhoodName,
          emailNotifications: true,
        },
        relations: ['user'],
      });

      if (subscriptions.length === 0) {
        this.logger.log(
          `No subscribers for neighborhood: ${report.neighborhoodName}`,
        );
        return;
      }

      this.logger.log(
        `Notifying ${subscriptions.length} subscribers about report ${report.id} in ${report.neighborhoodName}`,
      );

      // Enviar emails en paralelo
      const emailPromises = subscriptions.map((sub) =>
        this.sendReportNotification(sub.user.email, report).catch((error) => {
          this.logger.error(
            `Failed to send email to ${sub.user.email}:`,
            error,
          );
          return null;
        }),
      );

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;

      this.logger.log(
        `Sent ${successful}/${subscriptions.length} notification emails`,
      );
    } catch (error) {
      this.logger.error('Error notifying subscribers:', error);
    }
  }

  /**
   * Envía email de notificación a un suscriptor
   */
  private async sendReportNotification(email: string, report: any) {
    return this.emailService.sendReportNotification(email, {
      reportId: report.id,
      neighborhood: report.neighborhoodName,
      localidad: report.localidad || 'Formosa',
      description: report.description,
      category: report.category || 'General',
      lat: report.lat,
      lng: report.lng,
      createdAt: report.createdAt,
    });
  }
}
