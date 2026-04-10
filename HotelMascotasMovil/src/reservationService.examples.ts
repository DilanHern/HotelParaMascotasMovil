/**
 * EJEMPLOS DE USO - RESERVATION SERVICE
 *
 * Este archivo muestra cómo usar el servicio de reservas en componentes
 */

import {
  createReservation,
  confirmReservation,
  modifyReservation,
  startLodging,
  endLodging,
  cancelReservation,
  getUserReservations,
  getReservationById,
  getPetReservations,
  getActiveReservations,
  isRoomAvailable,
  getReservationStatuses,
  getLodgingTypes,
  getRooms,
  RESERVATION_STATUS,
  type Reservation,
  type CreateReservationData,
} from '@/src/reservationService';

// ========================
// EJEMPLO 1: CREAR RESERVA
// ========================

export async function exampleCreateReservation() {
  try {
    // Datos de la reserva a crear
    const reservationData: CreateReservationData = {
      pet_id: 'pet-uuid-here',
      room_id: 1,
      check_in: '2026-04-15T09:00:00Z',
      check_out: '2026-04-20T17:00:00Z',
      lodging_type_id: 1,
    };

    // Crear reserva
    const reservation = await createReservation(reservationData);

    console.log('✓ Reserva creada:', reservation.id);
    console.log('Estado:', RESERVATION_STATUS.PENDING, '(Pendiente)');

    return reservation;
  } catch (error) {
    console.error('Error creando reserva:', error);
  }
}

// ========================
// EJEMPLO 2: CONFIRMAR RESERVA
// ========================

export async function exampleConfirmReservation() {
  try {
    const reservationId = 'reservation-uuid-here';

    // Confirmar reserva (emite evento RESERVATION_CONFIRMED)
    const confirmed = await confirmReservation(reservationId);

    console.log('✓ Reserva confirmada');
    console.log('Estado:', RESERVATION_STATUS.CONFIRMED, '(Confirmada)');
    console.log('📧 Evento de notificación emitido');

    return confirmed;
  } catch (error) {
    console.error('Error confirmando reserva:', error);
  }
}

// ========================
// EJEMPLO 3: MODIFICAR RESERVA
// ========================

export async function exampleModifyReservation() {
  try {
    const reservationId = 'reservation-uuid-here';

    // Modificar fechas
    const modified = await modifyReservation(reservationId, {
      check_in: '2026-04-16T10:00:00Z',
      check_out: '2026-04-22T16:00:00Z',
      room_id: 2, // Cambiar de habitación
    });

    console.log('✓ Reserva modificada');
    console.log('Nuevas fechas:', modified.check_in, '-', modified.check_out);
    console.log('📧 Evento de notificación emitido');

    return modified;
  } catch (error) {
    console.error('Error modificando reserva:', error);
  }
}

// ========================
// EJEMPLO 4: INICIAR HOSPEDAJE
// ========================

export async function exampleStartLodging() {
  try {
    const reservationId = 'reservation-uuid-here';

    // Cambiar estado a LODGING (mascota llegó al hotel)
    const lodging = await startLodging(reservationId);

    console.log('✓ Hospedaje iniciado');
    console.log('Estado:', RESERVATION_STATUS.LODGING, '(En curso)');
    console.log('📧 Evento LODGING_STARTED emitido');

    return lodging;
  } catch (error) {
    console.error('Error iniciando hospedaje:', error);
  }
}

// ========================
// EJEMPLO 5: FINALIZAR HOSPEDAJE
// ========================

export async function exampleEndLodging() {
  try {
    const reservationId = 'reservation-uuid-here';

    // Cambiar estado a COMPLETED (hospedaje finalizado)
    const completed = await endLodging(reservationId);

    console.log('✓ Hospedaje finalizado');
    console.log('Estado:', RESERVATION_STATUS.COMPLETED, '(Completada)');
    console.log('📧 Evento LODGING_ENDED emitido');

    return completed;
  } catch (error) {
    console.error('Error finalizando hospedaje:', error);
  }
}

// ========================
// EJEMPLO 6: OBTENER RESERVAS DEL USUARIO
// ========================

export async function exampleGetUserReservations() {
  try {
    // Obtener todas las reservas del usuario autenticado
    const reservations = await getUserReservations();

    console.log('Total de reservas:', reservations.length);
    reservations.forEach(res => {
      console.log(`- ${res.pet_name}: ${res.check_in} - ${res.check_out} (${res.status_name})`);
    });

    return reservations;
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
  }
}

// ========================
// EJEMPLO 7: OBTENER RESERVAS ACTIVAS
// ========================

export async function exampleGetActiveReservations() {
  try {
    // Obtener solo reservas CONFIRMED o LODGING
    const active = await getActiveReservations();

    console.log('Reservas activas:', active.length);
    active.forEach(res => {
      console.log(`- ${res.pet_name}: ${res.status_name}`);
    });

    return active;
  } catch (error) {
    console.error('Error obteniendo reservas activas:', error);
  }
}

// ========================
// EJEMPLO 8: VERIFICAR DISPONIBILIDAD DE SALA
// ========================

export async function exampleCheckRoomAvailability() {
  try {
    const roomId = 1;
    const checkIn = '2026-04-15T09:00:00Z';
    const checkOut = '2026-04-20T17:00:00Z';

    // Verificar si la sala está disponible
    const available = await isRoomAvailable(roomId, checkIn, checkOut);

    if (available) {
      console.log('✓ Sala está disponible');
    } else {
      console.log('✗ Sala no está disponible en esas fechas');
    }

    return available;
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
  }
}

// ========================
// EJEMPLO 9: OBTENER UNA RESERVA ESPECÍFICA
// ========================

export async function exampleGetReservationById() {
  try {
    const reservationId = 'reservation-uuid-here';

    const reservation = await getReservationById(reservationId);

    if (reservation) {
      console.log('Reserva encontrada:');
      console.log('- Mascota:', reservation.pet_name);
      console.log('- Entrada:', reservation.check_in);
      console.log('- Salida:', reservation.check_out);
      console.log('- Estado:', reservation.status_name);
    } else {
      console.log('Reserva no encontrada');
    }

    return reservation;
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
  }
}

// ========================
// EJEMPLO 10: OBTENER RESERVAS DE UNA MASCOTA
// ========================

export async function exampleGetPetReservations() {
  try {
    const petId = 'pet-uuid-here';

    // Obtener todas las reservas de una mascota
    const petReservations = await getPetReservations(petId);

    console.log(`Total de reservas para mascota:`, petReservations.length);
    petReservations.forEach(res => {
      console.log(`- ${res.check_in} a ${res.check_out}: ${res.status_name}`);
    });

    return petReservations;
  } catch (error) {
    console.error('Error obteniendo reservas de mascota:', error);
  }
}

// ========================
// EJEMPLO 11: EN UN COMPONENTE - LISTA DE RESERVAS
// ========================

export const ExampleReservationListComponent = `
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getUserReservations, type Reservation } from '@/src/reservationService';

export function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await getUserReservations();
        setReservations(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  if (loading) return <Text>Cargando...</Text>;

  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text>{item.pet_name}</Text>
          <Text>{item.check_in} - {item.check_out}</Text>
          <Text>{item.status_name}</Text>
        </View>
      )}
    />
  );
}
`;

// ========================
// EJEMPLO 12: EN UN COMPONENTE - CREAR RESERVA
// ========================

export const ExampleCreateReservationComponent = `
import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import {
  createReservation,
  isRoomAvailable,
  type CreateReservationData,
} from '@/src/reservationService';

export function CreateReservationForm() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreateReservation() {
    try {
      setLoading(true);

      // Verificar disponibilidad
      const available = await isRoomAvailable(1, checkIn, checkOut);
      if (!available) {
        Alert.alert('Error', 'La sala no está disponible en esas fechas');
        return;
      }

      const reservationData: CreateReservationData = {
        pet_id: 'selected-pet-id',
        room_id: 1,
        check_in: checkIn,
        check_out: checkOut,
        lodging_type_id: 1,
      };

      const reservation = await createReservation(reservationData);
      Alert.alert('Éxito', 'Reserva creada exitosamente');

      // Limpiar formulario
      setCheckIn('');
      setCheckOut('');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <TextInput
        placeholder="Fecha entrada"
        value={checkIn}
        onChangeText={setCheckIn}
      />
      <TextInput
        placeholder="Fecha salida"
        value={checkOut}
        onChangeText={setCheckOut}
      />
      <Button
        title={loading ? 'Creando...' : 'Crear Reserva'}
        onPress={handleCreateReservation}
        disabled={loading}
      />
    </View>
  );
}
`;

// ========================
// EJEMPLO 13: TRANSICIÓN DE ESTADOS
// ========================

export const StateTransitionFlow = `
FLUJO COMPLETO DE UNA RESERVA:

1. CREAR RESERVA
   createReservation(data)
   → Estado: PENDING (0)
   → Sin notificación

2. CONFIRMAR RESERVA
   confirmReservation(id)
   → Estado: CONFIRMED (1)
   → 📧 Evento: RESERVATION_CONFIRMED
   → Usuario recibe email de confirmación

3. MODIFICAR RESERVA (Opcional)
   modifyReservation(id, newDates)
   → Estado: Se mantiene CONFIRMED
   → 📧 Evento: RESERVATION_MODIFIED
   → Usuario recibe email con cambios

4. INICIAR HOSPEDAJE
   startLodging(id)
   → Estado: LODGING (2)
   → 📧 Evento: LODGING_STARTED
   → Usuario recibe email: "Tu mascota llegó"

5. AVISOS DIARIOS (Opcional)
   sendPetStatusUpdate(userId, title, message)
   → Estado: Se mantiene LODGING
   → 📧 Evento: PET_STATUS_UPDATE
   → Usuario recibe updates sobre su mascota

6. FINALIZAR HOSPEDAJE
   endLodging(id)
   → Estado: COMPLETED (3)
   → 📧 Evento: LODGING_ENDED
   → Usuario recibe email: "Mascota lista para recoger"
`;
