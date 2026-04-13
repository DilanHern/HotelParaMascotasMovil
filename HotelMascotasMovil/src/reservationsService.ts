import { supabase } from "@/lib/supabase";
import { eventEmitter } from "./Notification/eventEmitter";
import { INotificationEvent } from "./Notification/types";

function toIsoTimestamp(dateOnly: string, time: "start" | "end" = "start") {
  // dateOnly expected: YYYY-MM-DD
  // pl_reservations.check_in/check_out are timestamp (without timezone).
  // Avoid timezone drift by sending local-like timestamps without Z.
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // If the requested start date is today, use the current local time
  // so the timestamp isn't earlier than now (which would violate check_in_not_past).
  const today = new Date();
  const todayYmd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  if (time === "start") {
    if (dateOnly === todayYmd) {
      // Add small buffer (2 minutes) to current time to ensure timestamp is safely in the future
      const now = new Date(Date.now() + 2 * 60 * 1000);
      const h = pad(now.getHours());
      const m = pad(now.getMinutes());
      const s = pad(now.getSeconds());
      return `${dateOnly}T${h}:${m}:${s}`;
    }
    return `${dateOnly}T00:00:00`;
  }

  return `${dateOnly}T23:59:59`;
}

function toDateOnly(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function parseDateOnlyLocal(dateOnly: string) {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
}

async function getLodgingTypeId(lodgingType: "Estándar" | "Especial") {
  const { data, error } = await supabase
    .from("pl_lodgingtypes")
    .select("id, type")
    .order("id");

  if (error) throw error;
  const rows = data || [];
  const target = lodgingType
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const byName = rows.find((r: any) => {
    const val = String(r.type || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return val === target;
  });
  if (byName?.id) return byName.id;
  if (rows[0]?.id) return rows[0].id;
  throw new Error("No hay tipos de hospedaje configurados en pl_lodgingtypes");
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function linkReservationServices(
  reservationId: string,
  selectedServices: string[],
) {
  if (!selectedServices.length) return;

  const { data: allServices, error: servicesError } = await supabase
    .from("pl_services")
    .select("id, name");

  if (servicesError) throw servicesError;

  const selectedSet = new Set(selectedServices.map(normalizeText));
  const matchedIds = (allServices || [])
    .filter((s: any) => selectedSet.has(normalizeText(String(s.name || ""))))
    .map((s: any) => s.id);

  if (!matchedIds.length) return;

  const payload = matchedIds.map((serviceId: number) => ({
    reservation_id: reservationId,
    service_id: serviceId,
  }));

  const { error: linkError } = await supabase
    .from("pl_reservationservices")
    .insert(payload);

  if (linkError) throw linkError;
}

async function getPendingStatusId() {
  const { data, error } = await supabase
    .from("pl_reservationstatus")
    .select("id, name")
    .order("id");

  if (error) throw error;
  const rows = data || [];
  const byName = rows.find((r: any) =>
    String(r.name || "")
      .toLowerCase()
      .includes("pend"),
  );
  if (byName?.id) return byName.id;
  if (rows[0]?.id) return rows[0].id;
  throw new Error(
    "No hay estados de reserva configurados en pl_reservationstatus",
  );
}

export interface Reservation {
  id: string;
  pet_id: string;
  pet_name?: string;
  room_id: string;
  room_name?: string;
  check_in_date: string;
  check_out_date: string;
  lodging_type: "Estándar" | "Especial";
  status: 1 | 2 | 3 | 4 | 5;
  special_services?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateReservationData {
  pet_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  lodging_type: "Estándar" | "Especial";
  special_services?: string[];
}

export interface UpdateReservationData {
  pet_id?: string;
  room_id?: string;
  check_in_date?: string;
  check_out_date?: string;
  lodging_type?: "Estándar" | "Especial";
  status?: 1 | 2 | 3 | 4 | 5;
  special_services?: string[];
}

export async function getSpecialServices(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("pl_services")
      .select("name")
      .order("name");

    if (error) throw error;
    return (data || []).map((s: any) => String(s.name));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

// Get all reservations for the current user
export async function getUserReservations(): Promise<Reservation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  try {
    const { data, error } = await supabase
      .from("pl_reservations")
      .select(
        `
        *,
        pet:pl_pets(name),
        room:pl_rooms(name),
        lodging_type:pl_lodgingtypes(type),
        status:pl_reservationstatus(name)
      `,
      )
      .order("check_in", { ascending: false });

    if (error) throw error;

    // Obtener servicios para cada reserva si es tipo Especial
    const reservationsWithServices = await Promise.all(
      (data || []).map(async (res: any) => {
        let special_services: string[] = [];

        // Si es lodging_type_id 2 (Especial), obtener los servicios
        if (res.lodging_type_id === 2) {
          try {
            const { data: services } = await supabase
              .from("pl_reservationservices")
              .select("service:pl_services(name)")
              .eq("reservation_id", res.id);

            special_services = (services || [])
              .map((s: any) => s.service?.name)
              .filter(Boolean);
          } catch (err) {
            console.error(
              "Error fetching services for reservation:",
              res.id,
              err,
            );
          }
        }

        // Mapear status_id (1-5) directamente
        const statusId = res.status_id || 1;
        const lodgingTypeName =
          res.lodging_type?.type ||
          (res.lodging_type_id === 2 ? "Especial" : "Estándar");

        return {
          id: res.id,
          pet_id: res.pet_id,
          pet_name: res.pet?.name || res.pet_name || "Mascota",
          room_id: String(res.room_id),
          room_name: res.room?.name || res.room_name || "Habitación",
          check_in_date: toDateOnly(res.check_in ?? res.check_in_date),
          check_out_date: toDateOnly(res.check_out ?? res.check_out_date),
          lodging_type: lodgingTypeName,
          status: statusId,
          special_services: special_services,
          created_at: res.created_at,
          updated_at: res.updated_at,
        };
      }),
    );

    return reservationsWithServices;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
}

// Create a new reservation
export async function createReservation(
  reservationData: CreateReservationData,
): Promise<Reservation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  // Validate dates
  const checkInDate = parseDateOnlyLocal(reservationData.check_in_date);
  const checkOutDate = parseDateOnlyLocal(reservationData.check_out_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new Error("La fecha de ingreso no puede ser antes de hoy");
  }

  if (checkOutDate <= checkInDate) {
    throw new Error(
      "La fecha de salida debe ser después de la fecha de ingreso",
    );
  }

  const [lodgingTypeId, pendingStatusId] = await Promise.all([
    getLodgingTypeId(reservationData.lodging_type),
    getPendingStatusId(),
  ]);

  const { data, error } = await supabase
    .from("pl_reservations")
    .insert([
      {
        pet_id: reservationData.pet_id,
        room_id: reservationData.room_id,
        check_in: toIsoTimestamp(reservationData.check_in_date, "start"),
        check_out: toIsoTimestamp(reservationData.check_out_date, "end"),
        lodging_type_id: lodgingTypeId,
        status_id: pendingStatusId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (
    reservationData.lodging_type === "Especial" &&
    reservationData.special_services?.length
  ) {
    await linkReservationServices(data.id, reservationData.special_services);
  }

  // ========================
  // EMIT RESERVATION_CONFIRMED NOTIFICATION
  // ========================
  try {
    const notificationEvent: INotificationEvent = {
      type: "RESERVATION_CONFIRMED",
      user_id: user.id,
      data: {
        email: user.email,
        reservation_id: data.id,
        user_id: user.id,
        pet_id: data.pet_id,
        room_name: reservationData.room_id,
        check_in: data.check_in ?? data.check_in_date,
        check_out: data.check_out ?? data.check_out_date,
      },
    };

    await eventEmitter.emit(notificationEvent);
    console.log(
      "[reservationsService] Evento RESERVATION_CONFIRMED emitido para reserva:",
      data.id,
    );
  } catch (notificationError) {
    console.error(
      "[reservationsService] Error emitiendo notificación RESERVATION_CONFIRMED:",
      notificationError,
    );
    // No fallar la creación de reserva por error en notificación
  }

  return {
    id: data.id,
    pet_id: data.pet_id,
    room_id: String(data.room_id),
    check_in_date: toDateOnly(data.check_in ?? data.check_in_date),
    check_out_date: toDateOnly(data.check_out ?? data.check_out_date),
    lodging_type: reservationData.lodging_type,
    status: 1,
    special_services: reservationData.special_services || [],
  };
}

// Update a reservation
export async function updateReservation(
  reservationId: string,
  updateData: UpdateReservationData,
): Promise<Reservation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  // Fetch current reservation to detect changes
  const { data: currentRes, error: fetchError } = await supabase
    .from("pl_reservations")
    .select()
    .eq("id", reservationId)
    .single();

  if (fetchError) throw fetchError;

  const updateBody: any = {};
  let dateChanged = false;
  let statusChanged = false;
  let oldStatus: number | undefined;
  let newStatus: number | undefined;

  if (updateData.pet_id !== undefined) updateBody.pet_id = updateData.pet_id;
  if (updateData.room_id !== undefined) updateBody.room_id = updateData.room_id;
  if (updateData.check_in_date !== undefined) {
    updateBody.check_in = toIsoTimestamp(updateData.check_in_date, "start");
    dateChanged = true;
  }
  if (updateData.check_out_date !== undefined) {
    updateBody.check_out = toIsoTimestamp(updateData.check_out_date, "end");
    dateChanged = true;
  }
  if (updateData.lodging_type !== undefined) {
    updateBody.lodging_type_id = await getLodgingTypeId(
      updateData.lodging_type,
    );
  }
  if (updateData.status !== undefined) {
    // Status ya viene como 1-5 de la BD
    updateBody.status_id = updateData.status;
    statusChanged = true;
    oldStatus = currentRes.status_id;
    newStatus = updateData.status;
  }

  const { data, error } = await supabase
    .from("pl_reservations")
    .update(updateBody)
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw error;

  // ========================
  // EMIT NOTIFICATION EVENTS BASED ON CHANGES
  // ========================
  try {
    // Emit RESERVATION_MODIFIED if dates changed
    if (dateChanged) {
      const notificationEvent: INotificationEvent = {
        type: "RESERVATION_MODIFIED",
        user_id: user.id,
        data: {
          email: user.email,
          reservation_id: reservationId,
          user_id: user.id,
          pet_id: data.pet_id,
          room_name: data.room_id,
          new_check_in: data.check_in ?? data.check_in_date,
          new_check_out: data.check_out ?? data.check_out_date,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log(
        "[reservationsService] Evento RESERVATION_MODIFIED emitido para reserva:",
        reservationId,
      );
    }

    // Emit LODGING_STARTED if status changed to 3 (En curso)
    if (statusChanged && newStatus === 3) {
      const notificationEvent: INotificationEvent = {
        type: "LODGING_STARTED",
        user_id: user.id,
        data: {
          email: user.email,
          reservation_id: reservationId,
          user_id: user.id,
          pet_id: data.pet_id,
          room_name: data.room_id,
          check_in: data.check_in ?? data.check_in_date,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log(
        "[reservationsService] Evento LODGING_STARTED emitido para reserva:",
        reservationId,
      );
    }

    // Emit LODGING_ENDED if status changed to 4 (Completada)
    if (statusChanged && newStatus === 4) {
      const notificationEvent: INotificationEvent = {
        type: "LODGING_ENDED",
        user_id: user.id,
        data: {
          email: user.email,
          reservation_id: reservationId,
          user_id: user.id,
          pet_id: data.pet_id,
          room_name: data.room_id,
          check_out: data.check_out ?? data.check_out_date,
        },
      };

      await eventEmitter.emit(notificationEvent);
      console.log(
        "[reservationsService] Evento LODGING_ENDED emitido para reserva:",
        reservationId,
      );
    }
  } catch (notificationError) {
    console.error(
      "[reservationsService] Error emitiendo notificación:",
      notificationError,
    );
    // No fallar la actualización de reserva por error en notificación
  }

  return {
    id: data.id,
    pet_id: data.pet_id,
    room_id: String(data.room_id),
    check_in_date: toDateOnly(data.check_in ?? data.check_in_date),
    check_out_date: toDateOnly(data.check_out ?? data.check_out_date),
    lodging_type: updateData.lodging_type ?? "Estándar",
    status: (data.status_id || 1) as 1 | 2 | 3 | 4 | 5,
    special_services: data.special_services || [],
  };
}

// Delete a reservation
export async function deleteReservation(reservationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  // Fetch reservation details before deleting
  const { data: reservation, error: fetchError } = await supabase
    .from("pl_reservations")
    .select()
    .eq("id", reservationId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("pl_reservations")
    .delete()
    .eq("id", reservationId);

  if (error) throw error;

  // ========================
  // EMIT RESERVATION_DELETED NOTIFICATION
  // ========================
  try {
    const notificationEvent: INotificationEvent = {
      type: "RESERVATION_DELETED",
      user_id: user.id,
      data: {
        email: user.email,
        reservation_id: reservationId,
        user_id: user.id,
        pet_id: reservation.pet_id,
        room_id: reservation.room_id,
      },
    };

    await eventEmitter.emit(notificationEvent);
    console.log(
      "[reservationsService] Evento RESERVATION_DELETED emitido para reserva:",
      reservationId,
    );
  } catch (notificationError) {
    console.error(
      "[reservationsService] Error emitiendo notificación RESERVATION_DELETED:",
      notificationError,
    );
    // No fallar la eliminación de reserva por error en notificación
  }
}

// Get available rooms - Mock implementation
export async function getAvailableRooms(
  checkInDate: string,
  checkOutDate: string,
  lodgingType: "Estándar" | "Especial",
): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc("get_available_rooms", {
      p_check_in: toIsoTimestamp(checkInDate, "start"),
      p_check_out: toIsoTimestamp(checkOutDate, "end"),
      p_lodging_type: lodgingType,
    });

    if (error) throw error;
    return (data || []).map((r: any) => ({ id: String(r.id), name: r.name }));
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

// Get user's pets for the reservation form
export async function getUserPets(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  try {
    const { data, error } = await supabase
      .from("pl_pets")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("name");

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching pets:", error);
    return [];
  }
}

// Check if a pet has active reservations
export async function hasActivePetReservations(
  petId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("pl_reservations")
      .select("id, status_id")
      .eq("pet_id", petId)
      .in("status_id", [1, 2, 3]); // 1=Pendiente, 2=Confirmada, 3=En curso

    if (error) throw error;

    return (data || []).length > 0;
  } catch (error) {
    console.error("Error checking active reservations:", error);
    return false;
  }
}
