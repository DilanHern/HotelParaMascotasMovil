# Servicio de Reservas - Guía Completa

## 📌 Descripción

Sistema completo de gestión de reservas con integración a notificaciones. Permite crear, leer, actualizar y eliminar reservas con cambios de estado automáticos y eventos de notificación.

---

## 📊 Estados de Reserva

| Estado | Valor | Descripción | Transición |
|--------|-------|-------------|-----------|
| **PENDING** | 0 | Reserva creada, sin confirmar | Inicial |
| **CONFIRMED** | 1 | Reserva confirmada por admin | PENDING → CONFIRMED |
| **LODGING** | 2 | Mascota en hotel | CONFIRMED → LODGING |
| **COMPLETED** | 3 | Hospedaje finalizado | LODGING → COMPLETED |

---

## 🚀 Uso Rápido

### Importar

```typescript
import {
  createReservation,
  confirmReservation,
  modifyReservation,
  startLodging,
  endLodging,
  getUserReservations,
  getActiveReservations,
  isRoomAvailable,
  RESERVATION_STATUS,
} from '@/src/reservationService';
```

### Crear Reserva

```typescript
const reservation = await createReservation({
  pet_id: 'pet-uuid',
  check_in: '2026-04-15T09:00:00Z',
  check_out: '2026-04-20T17:00:00Z',
  room_id: 1,
  lodging_type_id: 1,
});

// Estado: PENDING (0)
// No se emite notificación aún
```

### Confirmar Reserva

```typescript
const confirmed = await confirmReservation(reservation.id);

// Estado: CONFIRMED (1)
// 📧 Evento emitido: RESERVATION_CONFIRMED
// Usuario recibe email
```

### Modificar Reserva

```typescript
const modified = await modifyReservation(reservation.id, {
  check_in: '2026-04-16T10:00:00Z',
  check_out: '2026-04-21T16:00:00Z',
});

// 📧 Evento emitido: RESERVATION_MODIFIED
// Usuario recibe email con nuevas fechas
```

### Iniciar Hospedaje

```typescript
const lodging = await startLodging(reservation.id);

// Estado: LODGING (2)
// 📧 Evento emitido: LODGING_STARTED
// Usuario recibe: "Tu mascota llegó al hotel"
```

### Finalizar Hospedaje

```typescript
const completed = await endLodging(reservation.id);

// Estado: COMPLETED (3)
// 📧 Evento emitido: LODGING_ENDED
// Usuario recibe: "Mascota lista para recoger"
```

---

## 📚 Funciones Disponibles

### Consultas (Read)

#### `getUserReservations()`
Obtiene todas las reservas del usuario autenticado

```typescript
const MyRemote = await getUserReservations();
// Retorna: Reservation[]
```

#### `getReservationById(reservationId)`
Obtiene una reserva específica

```typescript
const reservation = await getReservationById('res-uuid');
// Retorna: Reservation | null
```

#### `getPetReservations(petId)`
Obtiene todas las reservas de una mascota

```typescript
const petReservations = await getPetReservations('pet-uuid');
// Retorna: Reservation[]
```

#### `getActiveReservations()`
Obtiene solo reservas CONFIRMED o LODGING

```typescript
const active = await getActiveReservations();
// Retorna: Reservation[]
```

#### `isRoomAvailable(roomId, checkIn, checkOut, excludeReservationId?)`
Verifica si una sala está disponible en un rango de fechas

```typescript
const available = await isRoomAvailable(
  1,
  '2026-04-15T09:00:00Z',
  '2026-04-20T17:00:00Z'
);
// Retorna: boolean
```

#### `getReservationStatuses()`
Obtiene todos los estados disponibles

```typescript
const statuses = await getReservationStatuses();
// Retorna: ReservationStatus[]
```

#### `getLodgingTypes()`
Obtiene todos los tipos de hospedaje

```typescript
const types = await getLodgingTypes();
// Retorna: LodgingType[]
```

#### `getRooms()`
Obtiene todas las habitaciones

```typescript
const rooms = await getRooms();
// Retorna: Room[]
```

### Crear (Create)

#### `createReservation(data)`
Crea una nueva reserva en estado PENDING

```typescript
const reservation = await createReservation({
  pet_id: 'pet-uuid',
  check_in: '2026-04-15T09:00:00Z',
  check_out: '2026-04-20T17:00:00Z',
  room_id: 1,
  lodging_type_id: 1,
});
```

### Actualizar (Update)

#### `confirmReservation(reservationId)` ✉️
Confirma una reserva (PENDING → CONFIRMED)
- Emite: `RESERVATION_CONFIRMED`

#### `modifyReservation(reservationId, updates)` ✉️
Modifica una reserva (fechas, sala, tipo)
- Emite: `RESERVATION_MODIFIED`

```typescript
await modifyReservation(id, {
  check_in: '2026-04-16T10:00:00Z',
  check_out: '2026-04-21T16:00:00Z',
  room_id: 2,
});
```

#### `startLodging(reservationId)` ✉️
Inicia el hospedaje (CONFIRMED → LODGING)
- Emite: `LODGING_STARTED`

#### `endLodging(reservationId)` ✉️
Finaliza el hospedaje (LODGING → COMPLETED)
- Emite: `LODGING_ENDED`

### Eliminar (Delete)

#### `cancelReservation(reservationId)`
Cancela/elimina una reserva

```typescript
await cancelReservation('res-uuid');
```

---

## 📱 Ejemplos en Componentes

### Lista de Reservas

```typescript
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getUserReservations, type Reservation } from '@/src/reservationService';

export function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

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

  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.pet_name}</Text>
          <Text>{item.check_in} → {item.check_out}</Text>
          <Text>Estado: {item.status_name}</Text>
          {item.room_name && <Text>Sala: {item.room_name}</Text>}
        </View>
      )}
      onRefresh={loadReservations}
      refreshing={loading}
    />
  );
}
```

### Crear Reserva

```typescript
import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { createReservation, isRoomAvailable } from '@/src/reservationService';

export function CreateReservationForm({ petId }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomId, setRoomId] = useState('1');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    try {
      setLoading(true);

      // Verificar disponibilidad
      const available = await isRoomAvailable(
        parseInt(roomId),
        checkIn,
        checkOut
      );

      if (!available) {
        Alert.alert('Error', 'La sala no está disponible en esas fechas');
        return;
      }

      const reservation = await createReservation({
        pet_id: petId,
        room_id: parseInt(roomId),
        check_in: checkIn,
        check_out: checkOut,
        lodging_type_id: 1,
      });

      Alert.alert('Éxito', 'Reserva creada. Pendiente de confirmación.');
      setCheckIn('');
      setCheckOut('');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ gap: 10, padding: 15 }}>
      <TextInput
        placeholder="Fecha entrada (ISO)"
        value={checkIn}
        onChangeText={setCheckIn}
        editable={!loading}
      />
      <TextInput
        placeholder="Fecha salida (ISO)"
        value={checkOut}
        onChangeText={setCheckOut}
        editable={!loading}
      />
      <TextInput
        placeholder="ID Sala"
        value={roomId}
        onChangeText={setRoomId}
        editable={!loading}
      />
      <Button
        title={loading ? 'Creando...' : 'Crear Reserva'}
        onPress={handleCreate}
        disabled={loading}
      />
    </View>
  );
}
```

### Confirmar Reserva

```typescript
import { Button, Alert } from 'react-native';
import { confirmReservation } from '@/src/reservationService';

export function ConfirmReservationButton({ reservationId, onSuccess }) {
  async function handleConfirm() {
    try {
      await confirmReservation(reservationId);
      Alert.alert('Éxito', 'Reserva confirmada. Email enviado.');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  return (
    <Button
      title="Confirmar Reserva"
      onPress={handleConfirm}
    />
  );
}
```

### Iniciar Hospedaje

```typescript
import { Button, Alert } from 'react-native';
import { startLodging } from '@/src/reservationService';

export function StartLodgingButton({ reservationId, onSuccess }) {
  async function handleStart() {
    try {
      await startLodging(reservationId);
      Alert.alert('Éxito', 'Hospedaje iniciado. Mascota registrada.');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  }

  return (
    <Button
      title="Iniciar Hospedaje"
      onPress={handleStart}
      color="#4CAF50"
    />
  );
}
```

---

## 🔗 Integración con Notificaciones

Cada acción que cambia el estado emite un evento automáticamente:

| Función | Evento Emitido | Cuando |
|---------|---|---|
| `confirmReservation()` | `RESERVATION_CONFIRMED` | Estado PENDING → CONFIRMED |
| `modifyReservation()` | `RESERVATION_MODIFIED` | Se actualiza cualquier campo |
| `startLodging()` | `LODGING_STARTED` | Estado CONFIRMED → LODGING |
| `endLodging()` | `LODGING_ENDED` | Estado LODGING → COMPLETED |

El usuario recibe automáticamente un email para cada evento.

---

## ⚠️ Errores Comunes

### Error: "No user logged in"
**Causa:** No hay usuario autenticado
**Solución:** Asegurar que el usuario está logueado antes de llamar funciones

```typescript
import { supabase } from '@/lib/supabase';

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Redirigir a login
}
```

### Error: "Reserva no encontrada"
**Causa:** El ID de la reserva no existe
**Solución:** Verificar que el ID es correcto

```typescript
const reservation = await getReservationById(id);
if (!reservation) {
  console.error('Reserva no existe');
}
```

### Error al emitir evento
**Causa:** Listeners no registrados
**Solución:** Asegurar que `registerAllListeners()` se llamó en App root

---

## 📋 Interfaz Reservation

```typescript
interface Reservation {
  id: string;
  pet_id: string;
  pet_name?: string;
  room_id?: number;
  room_name?: string;
  check_in: string; // ISO string
  check_out: string; // ISO string
  status_id: number; // 0, 1, 2, 3
  status_name?: string; // "Pendiente", "Confirmada", etc
  lodging_type_id?: number;
  lodging_type?: string;
  created_at: string;
  owner_id?: string;
  owner_email?: string;
}
```

---

## 🎯 Flujo Completo

```
1. Usuario selecciona mascota y fechas
   ↓
2. Verificar disponibilidad: isRoomAvailable()
   ↓
3. Crear reserva: createReservation()
   → Estado: PENDING (sin notificación)
   ↓
4. [Admin] Confirmar: confirmReservation()
   → Estado: CONFIRMED
   → 📧 Evento RESERVATION_CONFIRMED
   ↓
5. [Admin] Iniciar hospedaje: startLodging()
   → Estado: LODGING
   → 📧 Evento LODGING_STARTED
   ↓
6. [Opcional] Enviar avisos: sendPetStatusUpdate()
   → 📧 Evento PET_STATUS_UPDATE
   ↓
7. [Admin] Finalizar: endLodging()
   → Estado: COMPLETED
   → 📧 Evento LODGING_ENDED
   ↓
✅ Reserva completada, usuario recibe todos los emails
```

---

## 🔧 Testing

### Prueba Manual

```typescript
// En cualquier pantalla
import { createReservation, confirmReservation } from '@/src/reservationService';

async function testReservationFlow() {
  // 1. Crear
  const res = await createReservation({
    pet_id: 'test-pet-id',
    check_in: '2026-04-15T09:00:00Z',
    check_out: '2026-04-20T17:00:00Z',
    room_id: 1,
    lodging_type_id: 1,
  });
  console.log('✓ Creada:', res.id);

  // 2. Confirmar
  await confirmReservation(res.id);
  console.log('✓ Confirmada - revisa email');

  // 3. Ver en BD
  // SELECT * FROM Pl_Notifications WHERE user_id = ?
}

testReservationFlow();
```

---

## 📞 Soporte

Ver `reservationService.examples.ts` para más ejemplos.
