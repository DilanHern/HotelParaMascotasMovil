# Sistema de Notificaciones por Email

## ✅ Implementación Completada

Se ha implementado un sistema completo de notificaciones por email usando **Resend.com** y **Supabase Edge Functions**.

### Eventos Implementados

Ahora se envían notificaciones por email en los siguientes eventos:

| Evento | Trigger | Descripción |
|--------|---------|-------------|
| **USER_REGISTERED** | Registro de usuario | Email de bienvenida cuando se registra un nuevo usuario |
| **RESERVATION_CONFIRMED** | Creación de reserva | Confirmación de reserva con detalles (fechas, mascota, habitación) |
| **RESERVATION_MODIFIED** | Cambio de fechas | Notificación cuando se modifican las fechas de la reserva |
| **RESERVATION_DELETED** | Eliminación de reserva | Confirmación de cancelación de reserva |
| **LODGING_STARTED** | Check-in | Email cuando la mascota llega al hotel (status = 2) |
| **LODGING_ENDED** | Check-out | Email cuando finaliza el hospedaje (status = 3) |
| **PET_STATUS_UPDATE** | Actualización manual | Avisos sobre estado de la mascota |

## 🏗️ Arquitectura

### Componentes Principales

```
┌─── authService.ts
│    └─ Emite: USER_REGISTERED
│
├─── reservationsService.ts
│    ├─ Emite: RESERVATION_CONFIRMED (createReservation)
│    ├─ Emite: RESERVATION_MODIFIED (updateReservation - cambio de fechas)
│    ├─ Emite: LODGING_STARTED (updateReservation - status=2)
│    ├─ Emite: LODGING_ENDED (updateReservation - status=3)
│    └─ Emite: RESERVATION_DELETED (deleteReservation)
│
└─── Notification/
     ├─ eventEmitter.ts - Patrón Observer para eventos
     ├─ notificationService.ts - Maneja eventos y genera notificaciones DB
     ├─ emailService.ts - Envía a Edge Function
     ├─ databaseNotificationService.ts - Guarda en Pl_Notifications
     ├─ types.ts - Tipado de eventos
     └─ index.ts - Registro de listeners
```

### Flujo de Ejecución

```
1. Acción del usuario (registro, creación de reserva, etc.)
   ↓
2. Service emite evento INotificationEvent
   ↓
3. eventEmitter ejecuta listeners registrados
   ↓
4. notificationService.handleXX()
   ├─ Obtiene detalles del usuario y mascota de BD
   ├─ Construye contenido del email
   ├─ Guarda en tabla Pl_Notifications
   ├─ Envía vía emailService
   └─ emailService → Supabase Edge Function → Resend API
   ↓
5. Email llega a usuario
```

## 🔧 Configuración Requerida

### 1. Variables de Entorno (.env)

✅ Ya configuradas:
```env
EXPO_PUBLIC_SUPABASE_URL=https://emyoauwdvtjbslesbtav.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=https://emyoauwdvtjbslesbtav.supabase.co/functions/v1
```

### 2. Supabase Edge Function

La edge function `send-notification-email` debe estar deployada en Supabase con:
- **Nombre**: `send-notification-email`
- **Ubicación**: `/functions/send-notification-email.ts`
- **Variables de entorno en Supabase**:
  - `RESEND_API_KEY` - API key de Resend
  - `EMAIL_FROM` - Email sender (ej: noreply@hotelmascotasxyz.com)

### 3. Tablas Supabase Requeridas

```sql
-- Tabla de notificaciones (debe existir)
CREATE TABLE Pl_Notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Pl_Users(id),
  notification_type_id INT NOT NULL REFERENCES Pl_NotificationTypes(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tipos de notificaciones (debe existir)
CREATE TABLE Pl_NotificationTypes (
  id INT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Tipos requeridos (INSERT):
INSERT INTO Pl_NotificationTypes (id, name) VALUES
  (1, 'User-Registered'),
  (2, 'Reservation-Confirmed'),
  (3, 'Reservation-Modified'),
  (4, 'Lodging-Started'),
  (5, 'Lodging-Ended'),
  (6, 'Pet-Status-Update'),
  (7, 'Reservation-Deleted');
```

### 4. Tabla Pl_Users

Debe tener columna `email` accesible para obtener el correo del usuario:
```sql
ALTER TABLE Pl_Users ADD COLUMN email TEXT;
```

## 📝 Cómo Usar

### Inicialización Automática

Los listeners se registran automáticamente en `app/_layout.tsx`:
```typescript
useEffect(() => {
  registerAllListeners();
}, []);
```

### Emitir Evento Manual (Ejemplo)

Para avisos de estado de mascota:
```typescript
import { eventEmitter } from "@/src/Notification/eventEmitter";
import { INotificationEvent } from "@/src/Notification/types";

const event: INotificationEvent = {
  type: 'PET_STATUS_UPDATE',
  user_id: 'user-id',
  data: {
    title: 'Tu mascota se ve muy feliz',
    message: 'Max está jugando en el jardín y comió bien hoy',
  },
};

await eventEmitter.emit(event);
```

## 🧪 Testing

### Verificar Listeners Registrados

Revisa los logs cuando inicia la app:
```
[Notification] ✓ Todos los listeners registrados
[Notification] Listener registrado para evento: USER_REGISTERED
[Notification] Listener registrado para evento: RESERVATION_CONFIRMED
...
```

### Verificar Envío de Email

1. Crea una prueba en el servicio
2. Revisa logs:
   ```
   [reservationsService] Evento RESERVATION_CONFIRMED emitido para reserva: xxx
   [EmailService] Email enviado exitosamente a user@example.com
   ```

### Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "No se encontró email para usuario" | El usuario no tiene email en Pl_Users | Asegurar que auth.users tenga email |
| "RESEND_API_KEY no está configurada" | Variable no configurada en Supabase | Agregar en secretos de Edge Function |
| Email no se envía | Edge Function no deployada | Hacer `supabase functions deploy send-notification-email` |
| Error 404 en API | URL incorrecta en EXPO_PUBLIC_API_URL | Verificar URL base de Supabase |

## 📚 Archivos Modificados

- ✅ `src/Notification/notificationService.ts` - Agregado `handleReservationDeleted()`
- ✅ `src/Notification/index.ts` - Agregado listener `RESERVATION_DELETED`
- ✅ `src/Notification/types.ts` - Agregado tipo `RESERVATION_DELETED`
- ✅ `src/reservationsService.ts` - Agregados eventos de notificación
- ✅ `src/authService.ts` - Ya emite `USER_REGISTERED`
- ✅ `app/_layout.tsx` - Registro de listeners al iniciar
- ✅ `.env` - Agregado `EXPO_PUBLIC_API_URL`

## 🎯 Próximos Pasos (Opcional)

1. **Configurar plantillas HTML personalizadas** - Mejorar diseño de emails
2. **Agregar preferencias de notificación** - Permitir que usuarios desactiven ciertos emails
3. **Rate limiting** - Evitar spam de notificaciones
4. **Logs de notificaciones** - Crear tabla para auditoría
5. **Reintentos automáticos** - Si falla el envío en primer intento
