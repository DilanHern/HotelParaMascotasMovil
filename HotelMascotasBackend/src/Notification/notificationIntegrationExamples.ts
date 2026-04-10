import { eventEmitter } from './eventEmitter';
import { INotificationEvent } from './types/notification';

// ========================
// EJEMPLOS DE INTEGRACIÓN
// ========================

/**
 * EJEMPLO 1: Integración en authService.ts (Registro de Usuario)
 *
 * Lugar: Después de que se registra exitosamente en auth.users
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function registerUser(email: string, password: string, userData: any) {
 *   // ... código de registro existente ...
 *
 *   // Guardar usuario en pl_users
 *   const { data: user, error } = await supabase
 *     .from('pl_users')
 *     .insert({
 *       id: authUser.user.id,
 *       firstname: userData.firstname,
 *       lastname: userData.lastname,
 *       email,
 *       // ... otros campos ...
 *     })
 *     .select()
 *     .single();
 *
 *   // EMITIR EVENTO DE NOTIFICACIÓN
 *   const event: INotificationEvent = {
 *     type: 'USER_REGISTERED',
 *     userId: user.id,
 *     data: {
 *       email: user.email,
 *       firstname: user.firstname,
 *       lastname: user.lastname,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 *
 *   return user;
 * }
 */
export const userRegistrationExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En authService.ts - función registerUser()
async function registerUser(email: string, password: string, userData: any) {
  // ... código de registro en Supabase Auth ...

  // Después de crear el usuario en pl_users:
  const event: INotificationEvent = {
    type: 'USER_REGISTERED',
    userId: newUser.id,
    data: {
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
    },
  };

  await eventEmitter.emit(event);
}
`;

/**
 * EJEMPLO 2: Integración cuando se confirma una reserva
 *
 * Lugar: API endpoint que actualiza status de reserva de 0 → 1
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function confirmReservation(reservationId: string) {
 *   // ... código para actualizar status a 1 ...
 *
 *   // Obtener datos de la reserva
 *   const reservation = await databaseNotificationService.getReservationDetails(reservationId);
 *
 *   // EMITIR EVENTO
 *   const event: INotificationEvent = {
 *     type: 'RESERVATION_CONFIRMED',
 *     userId: reservation.pet.owner_id,
 *     data: {
 *       reservationId,
 *       petId: reservation.pet_id,
 *       checkIn: reservation.check_in,
 *       checkOut: reservation.check_out,
 *       roomName: reservation.room.name,
 *       userId: reservation.pet.owner_id,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 * }
 */
export const reservationConfirmedExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En reservationService.ts
async function confirmReservation(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 1 }) // 0=pending, 1=confirmed
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO DE NOTIFICACIÓN
  const event: INotificationEvent = {
    type: 'RESERVATION_CONFIRMED',
    userId: reservation.pet.owner_id,
    data: {
      reservationId,
      petId: reservation.pet_id,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      roomName: reservation.room?.name || 'Habitación Especial',
      userId: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);
}
`;

/**
 * EJEMPLO 3: Integración cuando se modifica una reserva
 *
 * Lugar: API endpoint de actualización de reserva
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function modifyReservation(
 *   reservationId: string,
 *   newCheckIn: string,
 *   newCheckOut: string
 * ) {
 *   const { data: reservation } = await supabase
 *     .from('Pl_Reservations')
 *     .update({
 *       check_in: newCheckIn,
 *       check_out: newCheckOut,
 *     })
 *     .eq('id', reservationId)
 *     .select('*, pet:Pl_Pets(*)')
 *     .single();
 *
 *   // EMITIR EVENTO
 *   const event: INotificationEvent = {
 *     type: 'RESERVATION_MODIFIED',
 *     userId: reservation.pet.owner_id,
 *     data: {
 *       reservationId,
 *       petId: reservation.pet_id,
 *       newCheckIn,
 *       newCheckOut,
 *       userId: reservation.pet.owner_id,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 * }
 */
export const reservationModifiedExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En reservationService.ts
async function modifyReservation(
  reservationId: string,
  newCheckIn: string,
  newCheckOut: string
) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({
      check_in: newCheckIn,
      check_out: newCheckOut,
    })
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO DE NOTIFICACIÓN
  const event: INotificationEvent = {
    type: 'RESERVATION_MODIFIED',
    userId: reservation.pet.owner_id,
    data: {
      reservationId,
      petId: reservation.pet_id,
      newCheckIn,
      newCheckOut,
      userId: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);
}
`;

/**
 * EJEMPLO 4: Integración cuando inicia el hospedaje
 *
 * Lugar: API endpoint que cambia status a 2 (en curso)
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function startLodging(reservationId: string) {
 *   const { data: reservation } = await supabase
 *     .from('Pl_Reservations')
 *     .update({ status_id: 2 }) // 2 = en curso/started
 *     .eq('id', reservationId)
 *     .select('*, pet:Pl_Pets(*)')
 *     .single();
 *
 *   // EMITIR EVENTO
 *   const event: INotificationEvent = {
 *     type: 'LODGING_STARTED',
 *     userId: reservation.pet.owner_id,
 *     data: {
 *       reservationId,
 *       petId: reservation.pet_id,
 *       userId: reservation.pet.owner_id,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 * }
 */
export const lodgingStartedExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En lodgingService.ts
async function startLodging(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 2 }) // 2 = en curso
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO DE NOTIFICACIÓN
  const event: INotificationEvent = {
    type: 'LODGING_STARTED',
    userId: reservation.pet.owner_id,
    data: {
      reservationId,
      petId: reservation.pet_id,
      userId: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);
}
`;

/**
 * EJEMPLO 5: Integración cuando finaliza el hospedaje
 *
 * Lugar: API endpoint que cambia status a 3 (completada)
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function endLodging(reservationId: string) {
 *   const { data: reservation } = await supabase
 *     .from('Pl_Reservations')
 *     .update({ status_id: 3 }) // 3 = completada
 *     .eq('id', reservationId)
 *     .select('*, pet:Pl_Pets(*)')
 *     .single();
 *
 *   // EMITIR EVENTO
 *   const event: INotificationEvent = {
 *     type: 'LODGING_ENDED',
 *     userId: reservation.pet.owner_id,
 *     data: {
 *       reservationId,
 *       petId: reservation.pet_id,
 *       userId: reservation.pet.owner_id,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 * }
 */
export const lodgingEndedExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En lodgingService.ts
async function endLodging(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 3 }) // 3 = completada
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO DE NOTIFICACIÓN
  const event: INotificationEvent = {
    type: 'LODGING_ENDED',
    userId: reservation.pet.owner_id,
    data: {
      reservationId,
      petId: reservation.pet_id,
      userId: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);
}
`;

/**
 * EJEMPLO 6: Integración para avisos de estado de mascota
 *
 * Lugar: Panel de administrador donde se envían avisos personalizados
 *
 * @example
 * import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';
 *
 * export async function sendPetStatusUpdate(
 *   userId: string,
 *   title: string,
 *   message: string
 * ) {
 *   // EMITIR EVENTO
 *   const event: INotificationEvent = {
 *     type: 'PET_STATUS_UPDATE',
 *     userId,
 *     data: {
 *       title,
 *       message,
 *     },
 *   };
 *   await eventEmitter.emit(event);
 * }
 */
export const petStatusUpdateExample = `
import { eventEmitter, INotificationEvent } from '../Notification/notificationSystemInit';

// En adminService.ts o petStatusService.ts
async function sendPetStatusUpdate(
  userId: string,
  title: string,
  message: string
) {
  // EMITIR EVENTO DE NOTIFICACIÓN
  const event: INotificationEvent = {
    type: 'PET_STATUS_UPDATE',
    userId,
    data: {
      title,
      message,
    },
  };

  await eventEmitter.emit(event);
}

// Uso:
// await sendPetStatusUpdate(
//   userId,
//   'Max está comiendo bien 🐕',
//   'Max ha comido su almuerzo completo hoy. Se ve feliz y activo.'
// );
`;

/**
 * INICIALIZACIÓN EN MAIN.TS
 */
export const mainInitializationExample = `
import express from 'express';
import { initializeNotificationSystem, destroyNotificationSystem } from './Notification/notificationSystemInit';

const app = express();

async function startServer() {
  try {
    // Inicializar sistema de notificaciones
    await initializeNotificationSystem();

    // ... resto de la configuración de Express ...

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(\`Servidor ejecutándose en puerto \${PORT}\`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await destroyNotificationSystem();
  process.exit(0);
});

startServer();
`;
