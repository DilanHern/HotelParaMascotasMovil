import { INotification, INotificationEvent } from './types';
import { databaseNotificationService } from './databaseNotificationService';
import { emailService } from './emailService';

// ========================
// NOTIFICATION SERVICE (ORQUESTADOR)
// ========================

class NotificationService {
  async handleUserRegistered(userId: string, userData: any): Promise<void> {
    try {
      const email = userData.email;
      const name = `${userData.firstname} ${userData.lastname}`;

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'User-Registered'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Bienvenido al Hotel para Mascotas',
        description: `Hola ${name}, tu cuenta ha sido creada exitosamente. ¡Estamos listos para cuidar a tus mascotas!`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ USER_REGISTERED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleUserRegistered:', error);
    }
  }

  async handleReservationConfirmed(
    reservationId: string,
    reservationData: any
  ): Promise<void> {
    try {
      const userId = reservationData.user_id;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.pet_id
      );
      const petName = petDetails?.name || 'Tu mascota';
      const roomName = reservationData.room_name || 'una habitación especial';
      const checkInDate = new Date(reservationData.check_in).toLocaleDateString('es-ES');
      const checkOutDate = new Date(reservationData.check_out).toLocaleDateString('es-ES');

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Reservation-Created'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Reserva Creada',
        description: `¡Excelente! Tu reserva para ${petName} en ${roomName} ha sido creada, pronto sera confirmada. Entrada: ${checkInDate}, Salida: ${checkOutDate}. ¡Nos vemos pronto!`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ RESERVATION_CREATED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleReservationConfirmed:', error);
    }
  }

  async handleReservationModified(
    reservationId: string,
    reservationData: any
  ): Promise<void> {
    try {
      const userId = reservationData.user_id;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.pet_id
      );
      const petName = petDetails?.name || 'Tu mascota';
      const newCheckInDate = new Date(reservationData.new_check_in).toLocaleDateString('es-ES');
      const newCheckOutDate = new Date(reservationData.new_check_out).toLocaleDateString(
        'es-ES'
      );

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Reservation-Modified'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Reserva Modificada',
        description: `Tu reserva para ${petName} ha sido modificada. Nuevas fechas: entrada ${newCheckInDate}, salida ${newCheckOutDate}. Confirma estos cambios.`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ RESERVATION_MODIFIED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleReservationModified:', error);
    }
  }

  async handleLodgingStarted(reservationId: string, reservationData: any): Promise<void> {
    try {
      const userId = reservationData.user_id;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.pet_id
      );
      const petName = petDetails?.name || 'Tu mascota';

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Lodging-Started'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Hospedaje Iniciado',
        description: `¡${petName} ha llegado al Hotel para Mascotas! Nuestro equipo está cuidando a tu mascota. Recibirás actualizaciones sobre su estado.`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ LODGING_STARTED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleLodgingStarted:', error);
    }
  }

  async handleLodgingEnded(reservationId: string, reservationData: any): Promise<void> {
    try {
      const userId = reservationData.user_id;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.pet_id
      );
      const petName = petDetails?.name || 'Tu mascota';

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Lodging-Ended'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Hospedaje Finalizado',
        description: `El hospedaje de ${petName} ha finalizado. Tu mascota está lista para ser recogida. Gracias por confiar en nosotros.`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ LODGING_ENDED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleLodgingEnded:', error);
    }
  }

  async handlePetStatusUpdate(userId: string, updateData: any): Promise<void> {
    try {
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Pet-Status-Update'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: updateData.title || 'Actualización de Estado',
        description:
          updateData.message ||
          'Hemos recibido una actualización sobre el estado de tu mascota.',
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ PET_STATUS_UPDATE enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handlePetStatusUpdate:', error);
    }
  }

  async handleReservationDeleted(
    reservationId: string,
    reservationData: any
  ): Promise<void> {
    try {
      const userId = reservationData.user_id;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`[NotificationService] No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.pet_id
      );
      const petName = petDetails?.name || 'Tu mascota';

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Reservation-Deleted'
      );

      const notification: INotification = {
        user_id: userId,
        notification_type_id: notificationTypeId,
        name: 'Reserva Cancelada',
        description: `Tu reserva para ${petName} ha sido cancelada. Si tienes dudas, contáctanos.`,
      };

      await databaseNotificationService.saveNotification(notification);

      try {
        await emailService.sendNotification(email, notification.name, notification.description);
      } catch (emailError) {
        console.warn(`[NotificationService] ⚠️ Error al enviar email a ${email}, pero la notificación se guardó en BD:`, emailError);
      }

      console.log(`[NotificationService] ✓ RESERVATION_DELETED enviada a ${email}`);
    } catch (error) {
      console.error('[NotificationService] Error en handleReservationDeleted:', error);
    }
  }
}

export const notificationService = new NotificationService();
