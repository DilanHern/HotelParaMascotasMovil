# Sistema de Notificaciones - Hotel para Mascotas

## 📋 Descripción General

Sistema completo de notificaciones con patrón **Observer** que maneja 6 eventos principales del hotel para mascotas:

1. **USER_REGISTERED** - Registro de usuario
2. **RESERVATION_CONFIRMED** - Confirmación de reserva (estado 0→1)
3. **RESERVATION_MODIFIED** - Modificación de reservas
4. **LODGING_STARTED** - Inicio del hospedaje (estado 2)
5. **LODGING_ENDED** - Finalización del hospedaje (estado 3)
6. **PET_STATUS_UPDATE** - Avisos personalizados de estado de mascota

Las notificaciones se envían vía **email** y se guardan en la base de datos.

---

## 🏗️ Estructura

```
src/Notification/
├── types.ts                      # Interfaces TypeScript
├── eventEmitter.ts               # Patrón Observer (Event Bus)
├── emailService.ts               # Servicio de envío de emails
├── databaseNotificationService.ts # Servicio de BD (Supabase)
├── notificationService.ts        # Orquestador principal
├── index.ts                      # Listeners y exports
├── examples.ts                   # Ejemplos de integración
└── README.md                     # Esta documentación
```

---

## 🚀 Inicio Rápido

### 1. Registrar listeners (una sola vez al iniciar la app)

```typescript
import { registerAllListeners } from './Notification/index';

// En App.tsx o root component
useEffect(() => {
  registerAllListeners();
}, []);
```

### 2. Emitir eventos desde tus servicios

**Ejemplo: Al registrar un usuario**

```typescript
import { eventEmitter } from './Notification/eventEmitter';

async function registerUser(userData) {
  // ... datos del usuario ...

  const event = {
    type: 'USER_REGISTERED',
    user_id: userData.id,
    data: {
      email: userData.email,
      firstname: userData.firstname,
      lastname: userData.lastname,
    },
  };

  await eventEmitter.emit(event);
}
```

---

## 📧 Eventos y Uso

### 1. USER_REGISTERED

**Cuándo:** Usuario se registra exitosamente

```typescript
const event = {
  type: 'USER_REGISTERED',
  user_id: userId,
  data: {
    email: 'usuario@email.com',
    firstname: 'Juan',
    lastname: 'Pérez',
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Mensaje de bienvenida personalizado

---

### 2. RESERVATION_CONFIRMED

**Cuándo:** Reserva cambió de estado 0 (pendiente) → 1 (confirmada)

```typescript
const event = {
  type: 'RESERVATION_CONFIRMED',
  user_id: ownerId,
  data: {
    reservation_id: reservationId,
    pet_id: petId,
    check_in: '2026-04-15T08:00:00Z',
    check_out: '2026-04-20T18:00:00Z',
    room_name: 'Suite Premium',
    user_id: ownerId,
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Confirmación con fechas de entrada/salida

---

### 3. RESERVATION_MODIFIED

**Cuándo:** Se actualizan fechas de una reserva

```typescript
const event = {
  type: 'RESERVATION_MODIFIED',
  user_id: ownerId,
  data: {
    reservation_id: reservationId,
    pet_id: petId,
    new_check_in: '2026-04-16T08:00:00Z',
    new_check_out: '2026-04-21T18:00:00Z',
    user_id: ownerId,
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Alerta con las nuevas fechas

---

### 4. LODGING_STARTED

**Cuándo:** Hospedaje inicia (estado 2)

```typescript
const event = {
  type: 'LODGING_STARTED',
  user_id: ownerId,
  data: {
    reservation_id: reservationId,
    pet_id: petId,
    user_id: ownerId,
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Confirmación que mascota llegó al hotel

---

### 5. LODGING_ENDED

**Cuándo:** Hospedaje finaliza (estado 3)

```typescript
const event = {
  type: 'LODGING_ENDED',
  user_id: ownerId,
  data: {
    reservation_id: reservationId,
    pet_id: petId,
    user_id: ownerId,
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Mascota lista para recoger

---

### 6. PET_STATUS_UPDATE

**Cuándo:** Admin envía aviso personalizado

```typescript
const event = {
  type: 'PET_STATUS_UPDATE',
  user_id: ownerId,
  data: {
    title: 'Max está comiendo bien 🐕',
    message:
      'Max ha comido todo su almuerzo. Se ve muy feliz y activo hoy.',
  },
};

await eventEmitter.emit(event);
```

**Email generado:** Aviso personalizado del estado

---

## ⚙️ Configuración

### Variables de Entorno

Crear o actualizar `.env.local`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here

# API Backend (para envío de emails)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Base de Datos

Los tipos de notificación deben existir en `Pl_NotificationTypes`:

```sql
INSERT INTO Pl_NotificationTypes (name, description) VALUES
  ('User-Registered', 'Notificación de registro de usuario'),
  ('Reservation-Confirmed', 'Notificación de confirmación de reserva'),
  ('Reservation-Modified', 'Notificación de modificación de reserva'),
  ('Lodging-Started', 'Notificación de inicio del hospedaje'),
  ('Lodging-Ended', 'Notificación de finalización del hospedaje'),
  ('Pet-Status-Update', 'Avisos personalizados del estado de la mascota');
```

---

## 📝 Base de Datos

### Tablas Utilizadas

**Pl_Notifications**
- `id` - UUID (generado automáticamente)
- `user_id` - UUID (referencia a Pl_Users)
- `notification_type_id` - INT (referencia a Pl_NotificationTypes)
- `name` - TEXT (ej: "Reserva Confirmada")
- `description` - TEXT (mensaje personalizado)
- `date` - TIMESTAMP (generado automáticamente)

**Pl_NotificationTypes**
- `id` - INT (auto-incremento)
- `name` - TEXT UNIQUE (ej: "User-Registered")
- `description` - TEXT

---

## 🔄 Flujo Completo

```
1. Usuario ejecuta una acción
   ↓
2. Servicio emite evento: eventEmitter.emit(event)
   ↓
3. EventEmitter llama a todos los listeners registrados
   ↓
4. NotificationService procesa el evento
   ↓
5. Guardar notificación en BD
   ↓
6. Enviar email via API backend
   ↓
7. Email llega a usuario ✅
```

---

## 🧪 Testing

### Prueba Manual

```typescript
import { eventEmitter } from './Notification/eventEmitter';
import { registerAllListeners } from './Notification/index';

// 1. Registrar listeners
registerAllListeners();

// 2. Emitir evento de prueba
const testEvent = {
  type: 'USER_REGISTERED',
  user_id: 'test-user-id',
  data: {
    email: 'test@example.com',
    firstname: 'Juan',
    lastname: 'Prueba',
  },
};

await eventEmitter.emit(testEvent);

// Revisar console.log y base de datos
```

---

## 🐛 Solución de Problemas

### Email no se envía

1. Verificar `EXPO_PUBLIC_API_URL` en `.env.local`
2. Verificar que el backend está corriendo
3. Ver logs en console del navegador/app

### Notificación no se guarda en BD

1. Verificar variables de Supabase
2. Verificar que `Pl_NotificationTypes` tiene los tipos correctos
3. Revisar permisos de RLS en Supabase

### Listeners no registrados

1. Llamar `registerAllListeners()` en useEffect
2. Verificar que está en el root/principal component

---

## 📚 Archivo de Ejemplos

Ver `examples.ts` para ejemplos completos de integración en:
- `authService.ts` (USER_REGISTERED)
- Servicio de reservas (RESERVATION_CONFIRMED, RESERVATION_MODIFIED)
- Servicio de hospedaje (LODGING_STARTED, LODGING_ENDED)
- Panel de admin (PET_STATUS_UPDATE)

---

## ✨ Características

✅ Patrón **Observer** - Desacoplamiento total  
✅ **Async/await** - No bloqueante  
✅ **Manejo de errores** - Try-catch centralizado  
✅ **Logging** - Seguimiento de eventos  
✅ **TypeScript** - Type-safe  
✅ **Escalable** - Fácil agregar nuevos eventos  
✅ **Email personalizado** - Template HTML professional

---

## 🔐 Seguridad

- Los emails se validan y escapan (XSS protection)
- Las queries a BD usan prepared statements (SQL injection protection)
- Verificar permisos RLS en Supabase

---

## 📞 Soporte

Para preguntas sobre integración, revisa `examples.ts` o consulta la memoria del proyecto.
