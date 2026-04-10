import { INotificationEvent } from './types/notification';
import { notificationService } from './notificationService';
import { eventEmitter } from './eventEmitter';

// ========================
// EVENT LISTENERS
// ========================

// Listener para registrodemio de usuario
export const userRegisteredListener = async (event: INotificationEvent) => {
  if (event.type === 'USER_REGISTERED') {
    await notificationService.handleUserRegistered(event.userId, event.data);
  }
};

// Listener para confirmación de reserva
export const reservationConfirmedListener = async (event: INotificationEvent) => {
  if (event.type === 'RESERVATION_CONFIRMED') {
    await notificationService.handleReservationConfirmed(
      event.data.reservationId,
      event.data
    );
  }
};

// Listener para modificación de reserva
export const reservationModifiedListener = async (event: INotificationEvent) => {
  if (event.type === 'RESERVATION_MODIFIED') {
    await notificationService.handleReservationModified(event.data.reservationId, event.data);
  }
};

// Listener para inicio del hospedaje
export const lodgingStartedListener = async (event: INotificationEvent) => {
  if (event.type === 'LODGING_STARTED') {
    await notificationService.handleLodgingStarted(event.data.reservationId, event.data);
  }
};

// Listener para finalización del hospedaje
export const lodgingEndedListener = async (event: INotificationEvent) => {
  if (event.type === 'LODGING_ENDED') {
    await notificationService.handleLodgingEnded(event.data.reservationId, event.data);
  }
};

// Listener para avisos de estado de mascota
export const petStatusUpdateListener = async (event: INotificationEvent) => {
  if (event.type === 'PET_STATUS_UPDATE') {
    await notificationService.handlePetStatusUpdate(event.userId, event.data);
  }
};

/**
 * Registra todos los listeners del sistema de notificaciones
 */
export function registerAllListeners(): void {
  eventEmitter.on('USER_REGISTERED', userRegisteredListener);
  eventEmitter.on('RESERVATION_CONFIRMED', reservationConfirmedListener);
  eventEmitter.on('RESERVATION_MODIFIED', reservationModifiedListener);
  eventEmitter.on('LODGING_STARTED', lodgingStartedListener);
  eventEmitter.on('LODGING_ENDED', lodgingEndedListener);
  eventEmitter.on('PET_STATUS_UPDATE', petStatusUpdateListener);

  console.log('✓ Todos los listeners de notificación registrados');
}

/**
 * Desregistra todos los listeners del sistema de notificaciones
 */
export function unregisterAllListeners(): void {
  eventEmitter.off('USER_REGISTERED', userRegisteredListener);
  eventEmitter.off('RESERVATION_CONFIRMED', reservationConfirmedListener);
  eventEmitter.off('RESERVATION_MODIFIED', reservationModifiedListener);
  eventEmitter.off('LODGING_STARTED', lodgingStartedListener);
  eventEmitter.off('LODGING_ENDED', lodgingEndedListener);
  eventEmitter.off('PET_STATUS_UPDATE', petStatusUpdateListener);

  console.log('✓ Todos los listeners de notificación desregistrados');
}
