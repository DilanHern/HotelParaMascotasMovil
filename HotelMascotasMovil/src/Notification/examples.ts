import { eventEmitter, INotificationEvent } from './eventEmitter';

// ========================
// EJEMPLOS DE INTEGRACIÓN
// ========================

/**
 * EJEMPLO 1: Registro de Usuario
 * Ubicación: src/authService.ts - función registerUser()
 * Cuándo: Después de crear el usuario en Pl_Users
 */
export const example1_userRegistration = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function registerUser(formData: RegisterData) {
  // ... código de registro existente ...

  // Después de crear en Pl_Users:
  const newUser = { id: userUUID, email, firstname, lastname };

  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'USER_REGISTERED',
    user_id: newUser.id,
    data: {
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
    },
  };

  await eventEmitter.emit(event);

  return newUser;
}
`;

/**
 * EJEMPLO 2: Confirmación de Reserva (cambio de estado 0→1)
 * Ubicación: Endpoint API o servicio que confirma reservas
 * Cuándo: Después de actualizar status_id a 1
 */
export const example2_reservationConfirmed = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function confirmReservation(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 1 }) // 0=pending, 1=confirmed
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*), room:Pl_Rooms(*)')
    .single();

  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'RESERVATION_CONFIRMED',
    user_id: reservation.pet.owner_id,
    data: {
      reservation_id: reservationId,
      pet_id: reservation.pet_id,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      room_name: reservation.room?.name || 'Habitación Especial',
      user_id: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);

  return reservation;
}
`;

/**
 * EJEMPLO 3: Modificación de Reserva
 * Ubicación: Servicio de actualización de reservas
 * Cuándo: Después de actualizar check_in o check_out
 */
export const example3_reservationModified = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function modifyReservation(
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

  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'RESERVATION_MODIFIED',
    user_id: reservation.pet.owner_id,
    data: {
      reservation_id: reservationId,
      pet_id: reservation.pet_id,
      new_check_in: newCheckIn,
      new_check_out: newCheckOut,
      user_id: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);

  return reservation;
}
`;

/**
 * EJEMPLO 4: Inicio del Hospedaje (status_id → 2)
 * Ubicación: Servicio del hotel cuando reciben la mascota
 * Cuándo: Después de actualizar status_id a 2 (en curso)
 */
export const example4_lodgingStarted = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function startLodging(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 2 }) // 2 = en curso/hospedaje iniciado
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'LODGING_STARTED',
    user_id: reservation.pet.owner_id,
    data: {
      reservation_id: reservationId,
      pet_id: reservation.pet_id,
      user_id: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);

  return reservation;
}
`;

/**
 * EJEMPLO 5: Finalización del Hospedaje (status_id → 3)
 * Ubicación: Servicio del hotel cuando entregan la mascota
 * Cuándo: Después de actualizar status_id a 3 (completada)
 */
export const example5_lodgingEnded = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function endLodging(reservationId: string) {
  const { data: reservation } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 3 }) // 3 = completada
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'LODGING_ENDED',
    user_id: reservation.pet.owner_id,
    data: {
      reservation_id: reservationId,
      pet_id: reservation.pet_id,
      user_id: reservation.pet.owner_id,
    },
  };

  await eventEmitter.emit(event);

  return reservation;
}
`;

/**
 * EJEMPLO 6: Avisos Personalizados de Estado de Mascota
 * Ubicación: Panel de administrador
 * Cuándo: El admin envía un aviso personalizado
 */
export const example6_petStatusUpdate = `
import { eventEmitter, INotificationEvent } from './Notification';

export async function sendPetStatusUpdate(
  userId: string,
  title: string,
  message: string
) {
  // EMITIR EVENTO
  const event: INotificationEvent = {
    type: 'PET_STATUS_UPDATE',
    user_id: userId,
    data: {
      title,
      message,
    },
  };

  await eventEmitter.emit(event);
}

// Ejemplos de uso:
// await sendPetStatusUpdate(
//   userId,
//   'Max está comiendo bien 🐕',
//   'Max ha comido todo su almuerzo y se ve muy feliz y activo.'
// );

// await sendPetStatusUpdate(
//   userId,
//   'Actualización médica',
//   'Luna tomó sus medicinas correctamente. El vet dice que se ve muy bien.'
// );
`;

/**
 * EJEMPLO 7: Inicialización en app principal
 * Ubicación: App.tsx o en el componente root
 */
export const example7_initialization = `
import { useEffect } from 'react';
import { registerAllListeners } from './Notification/index';

export default function App() {
  useEffect(() => {
    // Inicializar sistema de notificaciones
    registerAllListeners();

    console.log('Sistema de notificaciones inicializado');

    return () => {
      // Cleanup si es necesario
      // unregisterAllListeners();
    };
  }, []);

  return (
    // ... resto de tu app
  );
}
`;
