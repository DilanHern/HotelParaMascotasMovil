import { supabase } from "@/lib/supabase";
import { eventEmitter } from "@/src/Notification/eventEmitter";
import { INotificationEvent } from "@/src/Notification/types";

// ========================
// TIPOS Y INTERFACES
// ========================

export interface ReservationStatus {
  id: number;
  name: string;
}

export interface LodgingType {
  id: number;
  type: string;
}

export interface Room {
  id: number;
  name: string;
}

export interface Reservation {
  id: string;
  pet_id: string;
  pet_name?: string;
  room_id?: number;
  room_name?: string;
  check_in: string;
  check_out: string;
  status_id: number;
  status_name?: string;
  lodging_type_id?: number;
  lodging_type?: string;
  created_at: string;
  owner_id?: string;
  owner_email?: string;
}

export interface CreateReservationData {
  pet_id: string;
  room_id?: number;
  check_in: string;
  check_out: string;
  lodging_type_id?: number;
}

export interface UpdateReservationData {
  room_id?: number;
  check_in?: string;
  check_out?: string;
  status_id?: number;
  lodging_type_id?: number;
}

// ========================
// ENUMS PARA ESTADOS
// ========================

export enum RESERVATION_STATUS {
  PENDING = 0,
  CONFIRMED = 1,
  LODGING = 2,
  COMPLETED = 3,
}

// ========================
// FUNCIONES DE CONSULTA
// ========================

/**
 * Obtiene todos los estados de reserva disponibles
 */
export async function getReservationStatuses(): Promise<ReservationStatus[]> {
  const { data, error } = await supabase
    .from("pl_reservationstatus")
    .select("id, name")
    .order("id");

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene todos los tipos de hospedaje disponibles
 */
export async function getLodgingTypes(): Promise<LodgingType[]> {
  const { data, error } = await supabase
    .from("pl_loggingtypes")
    .select("id, type")
    .order("type");

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene todas las habitaciones disponibles
 */
export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("pl_rooms")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene todas las reservas del usuario autenticado
 */
export async function getUserReservations(): Promise<Reservation[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_reservations")
    .select(`
      id,
      pet_id,
      room_id,
      check_in,
      check_out,
      status_id,
      lodging_type_id,
      created_at,
      pet:pet_id(name, owner_id),
      room:room_id(name),
      status:status_id(name),
      lodging_type:lodging_type_id(type)
    `)
    .eq("pet:pet_id.owner_id", user.id)
    .order("check_in", { ascending: false });

  if (error) throw error;

  return (data || []).map((res: any) => ({
    id: res.id,
    pet_id: res.pet_id,
    pet_name: res.pet?.name,
    room_id: res.room_id,
    room_name: res.room?.name,
    check_in: res.check_in,
    check_out: res.check_out,
    status_id: res.status_id,
    status_name: res.status?.name,
    lodging_type_id: res.lodging_type_id,
    lodging_type: res.lodging_type?.type,
    created_at: res.created_at,
    owner_id: res.pet?.owner_id,
  }));
}

/**
 * Obtiene una reserva específica por ID
 */
export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("pl_reservations")
    .select(`
      id,
      pet_id,
      room_id,
      check_in,
      check_out,
      status_id,
      lodging_type_id,
      created_at,
      pet:pet_id(name, owner_id),
      room:room_id(name),
      status:status_id(name),
      lodging_type:lodging_type_id(type)
    `)
    .eq("id", reservationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    pet_id: data.pet_id,
    pet_name: data.pet?.name,
    room_id: data.room_id,
    room_name: data.room?.name,
    check_in: data.check_in,
    check_out: data.check_out,
    status_id: data.status_id,
    status_name: data.status?.name,
    lodging_type_id: data.lodging_type_id,
    lodging_type: data.lodging_type?.type,
    created_at: data.created_at,
    owner_id: data.pet?.owner_id,
  };
}

/**
 * Obtiene todas las reservas de una mascota específica
 */
export async function getPetReservations(petId: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("pl_reservations")
    .select(`
      id,
      pet_id,
      room_id,
      check_in,
      check_out,
      status_id,
      lodging_type_id,
      created_at,
      pet:pet_id(name, owner_id),
      room:room_id(name),
      status:status_id(name),
      lodging_type:lodging_type_id(type)
    `)
    .eq("pet_id", petId)
    .order("check_in", { ascending: false });

  if (error) throw error;

  return (data || []).map((res: any) => ({
    id: res.id,
    pet_id: res.pet_id,
    pet_name: res.pet?.name,
    room_id: res.room_id,
    room_name: res.room?.name,
    check_in: res.check_in,
    check_out: res.check_out,
    status_id: res.status_id,
    status_name: res.status?.name,
    lodging_type_id: res.lodging_type_id,
    lodging_type: res.lodging_type?.type,
    created_at: res.created_at,
    owner_id: res.pet?.owner_id,
  }));
}

// ========================
// OPERACIONES CRUD
// ========================

/**
 * Crea una nueva reserva (estado inicial: PENDING = 0)
 *
 * @example
 * const reservation = await createReservation({
 *   pet_id: "pet-uuid",
 *   check_in: "2026-04-15T09:00:00Z",
 *   check_out: "2026-04-20T17:00:00Z",
 *   room_id: 1,
 *   lodging_type_id: 1
 * });
 */
export async function createReservation(
  reservationData: CreateReservationData
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("pl_reservations")
    .insert([
      {
        pet_id: reservationData.pet_id,
        room_id: reservationData.room_id || null,
        check_in: reservationData.check_in,
        check_out: reservationData.check_out,
        status_id: RESERVATION_STATUS.PENDING, // 0 = Pendiente
        lodging_type_id: reservationData.lodging_type_id || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Obtener detalles completos de la reserva creada
  const fullReservation = await getReservationById(data.id);

  if (fullReservation) {
    // No emitir evento aquí, se emite cuando se confirma
    console.log("[reservationService] Reserva creada en estado PENDING");
  }

  return fullReservation || data;
}

/**
 * Confirma una reserva (cambia estado de PENDING a CONFIRMED)
 * Emite evento RESERVATION_CONFIRMED
 *
 * @example
 * await confirmReservation("reservation-uuid");
 */
export async function confirmReservation(reservationId: string): Promise<Reservation> {
  // Obtener reserva actual
  const currentReservation = await getReservationById(reservationId);
  if (!currentReservation) throw new Error("Reserva no encontrada");

  // Actualizar estado a CONFIRMED (1)
  const { data, error } = await supabase
    .from("pl_reservations")
    .update({ status_id: RESERVATION_STATUS.CONFIRMED })
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw error;

  // Obtener detalles completos
  const fullReservation = await getReservationById(reservationId);

  // ========================
  // EMITIR EVENTO DE NOTIFICACIÓN
  // ========================
  if (fullReservation && currentReservation.owner_id) {
    try {
      const notificationEvent: INotificationEvent = {
        type: 'RESERVATION_CONFIRMED',
        user_id: currentReservation.owner_id,
        data: {
          reservation_id: reservationId,
          pet_id: fullReservation.pet_id,
          check_in: fullReservation.check_in,
          check_out: fullReservation.check_out,
          room_name: fullReservation.room_name || 'Habitación Especial',
          user_id: currentReservation.owner_id,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log('[reservationService] Evento RESERVATION_CONFIRMED emitido');
    } catch (notificationError) {
      console.error('[reservationService] Error en notificación:', notificationError);
    }
  }

  return fullReservation || data;
}

/**
 * Modifica una reserva existente (fechas, sala, tipo de hospedaje)
 * Emite evento RESERVATION_MODIFIED
 *
 * @example
 * await modifyReservation("reservation-uuid", {
 *   check_in: "2026-04-16T09:00:00Z",
 *   check_out: "2026-04-21T17:00:00Z"
 * });
 */
export async function modifyReservation(
  reservationId: string,
  updates: UpdateReservationData
): Promise<Reservation> {
  // Obtener reserva actual
  const currentReservation = await getReservationById(reservationId);
  if (!currentReservation) throw new Error("Reserva no encontrada");

  const updateData: any = {};

  if (updates.room_id !== undefined) updateData.room_id = updates.room_id;
  if (updates.check_in !== undefined) updateData.check_in = updates.check_in;
  if (updates.check_out !== undefined) updateData.check_out = updates.check_out;
  if (updates.lodging_type_id !== undefined) updateData.lodging_type_id = updates.lodging_type_id;

  const { data, error } = await supabase
    .from("pl_reservations")
    .update(updateData)
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw error;

  // Obtener detalles completos
  const fullReservation = await getReservationById(reservationId);

  // ========================
  // EMITIR EVENTO DE NOTIFICACIÓN
  // ========================
  if (fullReservation && currentReservation.owner_id) {
    try {
      const notificationEvent: INotificationEvent = {
        type: 'RESERVATION_MODIFIED',
        user_id: currentReservation.owner_id,
        data: {
          reservation_id: reservationId,
          pet_id: fullReservation.pet_id,
          new_check_in: updates.check_in || currentReservation.check_in,
          new_check_out: updates.check_out || currentReservation.check_out,
          user_id: currentReservation.owner_id,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log('[reservationService] Evento RESERVATION_MODIFIED emitido');
    } catch (notificationError) {
      console.error('[reservationService] Error en notificación:', notificationError);
    }
  }

  return fullReservation || data;
}

/**
 * Inicia el hospedaje (cambia estado de CONFIRMED a LODGING)
 * Emite evento LODGING_STARTED
 *
 * @example
 * await startLodging("reservation-uuid");
 */
export async function startLodging(reservationId: string): Promise<Reservation> {
  const currentReservation = await getReservationById(reservationId);
  if (!currentReservation) throw new Error("Reserva no encontrada");

  const { data, error } = await supabase
    .from("pl_reservations")
    .update({ status_id: RESERVATION_STATUS.LODGING })
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw error;

  const fullReservation = await getReservationById(reservationId);

  // EMITIR EVENTO
  if (fullReservation && currentReservation.owner_id) {
    try {
      const notificationEvent: INotificationEvent = {
        type: 'LODGING_STARTED',
        user_id: currentReservation.owner_id,
        data: {
          reservation_id: reservationId,
          pet_id: fullReservation.pet_id,
          user_id: currentReservation.owner_id,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log('[reservationService] Evento LODGING_STARTED emitido');
    } catch (notificationError) {
      console.error('[reservationService] Error en notificación:', notificationError);
    }
  }

  return fullReservation || data;
}

/**
 * Finaliza el hospedaje (cambia estado a COMPLETED)
 * Emite evento LODGING_ENDED
 *
 * @example
 * await endLodging("reservation-uuid");
 */
export async function endLodging(reservationId: string): Promise<Reservation> {
  const currentReservation = await getReservationById(reservationId);
  if (!currentReservation) throw new Error("Reserva no encontrada");

  const { data, error } = await supabase
    .from("pl_reservations")
    .update({ status_id: RESERVATION_STATUS.COMPLETED })
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw error;

  const fullReservation = await getReservationById(reservationId);

  // EMITIR EVENTO
  if (fullReservation && currentReservation.owner_id) {
    try {
      const notificationEvent: INotificationEvent = {
        type: 'LODGING_ENDED',
        user_id: currentReservation.owner_id,
        data: {
          reservation_id: reservationId,
          pet_id: fullReservation.pet_id,
          user_id: currentReservation.owner_id,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log('[reservationService] Evento LODGING_ENDED emitido');
    } catch (notificationError) {
      console.error('[reservationService] Error en notificación:', notificationError);
    }
  }

  return fullReservation || data;
}

/**
 * Cancela una reserva (puede ser útil para eliminarla)
 *
 * @example
 * await cancelReservation("reservation-uuid");
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  const { error } = await supabase
    .from("pl_reservations")
    .delete()
    .eq("id", reservationId);

  if (error) throw error;

  console.log("[reservationService] Reserva cancelada exitosamente");
}

/**
 * Obtiene las reservas activas (CONFIRMED o LODGING) del usuario
 */
export async function getActiveReservations(): Promise<Reservation[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_reservations")
    .select(`
      id,
      pet_id,
      room_id,
      check_in,
      check_out,
      status_id,
      lodging_type_id,
      created_at,
      pet:pet_id(name, owner_id),
      room:room_id(name),
      status:status_id(name),
      lodging_type:lodging_type_id(type)
    `)
    .eq("pet:pet_id.owner_id", user.id)
    .in("status_id", [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.LODGING])
    .order("check_in", { ascending: true });

  if (error) throw error;

  return (data || []).map((res: any) => ({
    id: res.id,
    pet_id: res.pet_id,
    pet_name: res.pet?.name,
    room_id: res.room_id,
    room_name: res.room?.name,
    check_in: res.check_in,
    check_out: res.check_out,
    status_id: res.status_id,
    status_name: res.status?.name,
    lodging_type_id: res.lodging_type_id,
    lodging_type: res.lodging_type?.type,
    created_at: res.created_at,
    owner_id: res.pet?.owner_id,
  }));
}

/**
 * Verifica si una sala está disponible en un rango de fechas
 */
export async function isRoomAvailable(
  roomId: number,
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): Promise<boolean> {
  let query = supabase
    .from("pl_reservations")
    .select("id")
    .eq("room_id", roomId)
    .in("status_id", [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.LODGING])
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (excludeReservationId) {
    query = query.neq("id", excludeReservationId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data?.length || 0) === 0;
}
