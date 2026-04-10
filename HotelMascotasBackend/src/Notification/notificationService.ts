import { INotification, INotificationEvent } from './types/notification';
import { databaseNotificationService } from './services/databaseNotificationService';
import { emailService } from './services/emailService';

// ========================
// NOTIFICATION SERVICE (ORQUESTADOR)
// ========================

class NotificationService {
  async handleUserRegistered(userId: string, userData: any): Promise<void> {
    try {
      const email = userData.email;
      const name = `${userData.firstname} ${userData.lastname}`;

      // Obtener tipo de notificación
      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'User-Registered'
      );

      // Crear notificación personalizada
      const notification: INotification = {
        userId,
        notificationTypeId,
        name: 'Bienvenido al Hotel para Mascotas',
        description: `Hola ${name}, tu cuenta ha sido creada exitosamente. ¡Estamos listos para cuidar a tus mascotas!`,
      };

      // Guardar en BD
      await databaseNotificationService.saveNotification(notification);

      // Enviar email
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación USER_REGISTERED enviada a ${email}`);
    } catch (error) {
      console.error('Error en handleUserRegistered:', error);
    }
  }

  async handleReservationConfirmed(
    reservationId: string,
    reservationData: any
  ): Promise<void> {
    try {
      const userId = reservationData.userId;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.petId
      );
      const petName = petDetails?.name || 'Tu mascota';
      const roomName = reservationData.roomName || 'una habitación especial';
      const checkInDate = new Date(reservationData.checkIn).toLocaleDateString('es-ES');
      const checkOutDate = new Date(reservationData.checkOut).toLocaleDateString('es-ES');

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Reservation-Confirmed'
      );

      const notification: INotification = {
        userId,
        notificationTypeId,
        name: 'Reserva Confirmada',
        description: `¡Excelente! Tu reserva para ${petName} en ${roomName} ha sido confirmada. Fecha de entrada: ${checkInDate}, Fecha de salida: ${checkOutDate}. ¡Nos vemos pronto!`,
      };

      await databaseNotificationService.saveNotification(notification);
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación RESERVATION_CONFIRMED enviada a ${email}`);
    } catch (error) {
      console.error('Error en handleReservationConfirmed:', error);
    }
  }

  async handleReservationModified(
    reservationId: string,
    reservationData: any
  ): Promise<void> {
    try {
      const userId = reservationData.userId;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.petId
      );
      const petName = petDetails?.name || 'Tu mascota';
      const newCheckInDate = new Date(reservationData.newCheckIn).toLocaleDateString(
        'es-ES'
      );
      const newCheckOutDate = new Date(reservationData.newCheckOut).toLocaleDateString(
        'es-ES'
      );

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Reservation-Modified'
      );

      const notification: INotification = {
        userId,
        notificationTypeId,
        name: 'Reserva Modificada',
        description: `Tu reserva para ${petName} ha sido modificada. Las nuevas fechas son: entrada ${newCheckInDate}, salida ${newCheckOutDate}. Por favor confirma estos cambios.`,
      };

      await databaseNotificationService.saveNotification(notification);
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación RESERVATION_MODIFIED enviada a ${email}`);
    } catch (error) {
      console.error('Error en handleReservationModified:', error);
    }
  }

  async handleLodgingStarted(reservationId: string, reservationData: any): Promise<void> {
    try {
      const userId = reservationData.userId;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.petId
      );
      const petName = petDetails?.name || 'Tu mascota';

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Lodging-Started'
      );

      const notification: INotification = {
        userId,
        notificationTypeId,
        name: 'Hospedaje Iniciado',
        description: `¡${petName} ha llegado al Hotel para Mascotas! Nuestro equipo está cuidando a tu mascota. Recibirás actualizaciones diarias sobre su estado.`,
      };

      await databaseNotificationService.saveNotification(notification);
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación LODGING_STARTED enviada a ${email}`);
    } catch (error) {
      console.error('Error en handleLodgingStarted:', error);
    }
  }

  async handleLodgingEnded(reservationId: string, reservationData: any): Promise<void> {
    try {
      const userId = reservationData.userId;
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`No se encontró email para usuario ${userId}`);
        return;
      }

      const petDetails = await databaseNotificationService.getPetDetails(
        reservationData.petId
      );
      const petName = petDetails?.name || 'Tu mascota';

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Lodging-Ended'
      );

      const notification: INotification = {
        userId,
        notificationTypeId,
        name: 'Hospedaje Finalizado',
        description: `El hospedaje de ${petName} ha finalizado. Tu mascota está lista para ser recogida. Esperamos hayas sido satisfecho con nuestro servicio.`,
      };

      await databaseNotificationService.saveNotification(notification);
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación LODGING_ENDED enviada a ${email}`);
    } catch (error) {
      console.error('Error en handleLodgingEnded:', error);
    }
  }

  async handlePetStatusUpdate(userId: string, updateData: any): Promise<void> {
    try {
      const email = await databaseNotificationService.getUserEmail(userId);

      if (!email) {
        console.warn(`No se encontró email para usuario ${userId}`);
        return;
      }

      const notificationTypeId = await databaseNotificationService.getNotificationTypeId(
        'Pet-Status-Update'
      );

      const notification: INotification = {
        userId,
        notificationTypeId,
        name: updateData.title || 'Actualización de Estado',
        description:
          updateData.message ||
          'Hemos recibido una actualización sobre el estado de tu mascota.',
      };

      await databaseNotificationService.saveNotification(notification);
      await emailService.sendNotification(email, notification.name, notification.description);

      console.log(`✓ Notificación PET_STATUS_UPDATE enviada a ${email}`);
    } catch (error) {
      console.error('Error en handlePetStatusUpdate:', error);
    }
  }
}

export const notificationService = new NotificationService();
