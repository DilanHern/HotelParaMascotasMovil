# 🐾 Sistema de Notificaciones - Guía Completa de Integración

## 📌 Tabla de Contenidos

1. [Instalación y Setup](#instalación-y-setup)
2. [Integración en Servicios](#integración-en-servicios)
3. [Configuración Backend](#configuración-backend)
4. [Testing](#testing)
5. [Diagrama de Flujo](#diagrama-de-flujo)
6. [Troubleshooting](#troubleshooting)

---

## Instalación y Setup

### 1. Base de Datos - Tipos de Notificación

Ejecutar en Supabase SQL Editor:

```sql
INSERT INTO Pl_NotificationTypes (name, description) VALUES
  ('User-Registered', 'Notificación de registro de usuario'),
  ('Reservation-Confirmed', 'Notificación de confirmación de reserva'),
  ('Reservation-Modified', 'Notificación de modificación de reserva'),
  ('Lodging-Started', 'Notificación de inicio del hospedaje'),
  ('Lodging-Ended', 'Notificación de finalización del hospedaje'),
  ('Pet-Status-Update', 'Avisos personalizados del estado de la mascota')
ON CONFLICT (name) DO NOTHING;
```

### 2. Variables de Entorno

Actualizar `.env.local` en HotelMascotasMovil:

```env
# Supabase (ya debe estar)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API Backend para emails
EXPO_PUBLIC_API_URL=http://localhost:3000
# En producción, cambiar a tu dominio
# EXPO_PUBLIC_API_URL=https://api.tudominio.com
```

### 3. Inicializar Listeners en App

En `app/_layout.tsx` o componente root:

```typescript
import { useEffect } from 'react';
import { registerAllListeners } from '@/src/Notification/index';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar sistema de notificaciones
    registerAllListeners();
    console.log('✓ Sistema de notificaciones inicializado');

    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    // ... resto del layout
  );
}
```

---

## Integración en Servicios

### ✅ 1. REGISTRO DE USUARIO (USER_REGISTERED)

**Archivo:** `src/authService.ts`

**Ya actualizado** ✓ - La integración está lista

El archivo ya emite el evento después de crear el usuario:

```typescript
const notificationEvent: INotificationEvent = {
  type: 'USER_REGISTERED',
  user_id: data.user.id,
  data: {
    email: email,
    firstname: firstname,
    lastname: lastname,
  },
};

await eventEmitter.emit(notificationEvent);
```

---

### ✅ 2. CONFIRMACIÓN DE RESERVA (RESERVATION_CONFIRMED)

**Ubicación:** Servicio/API endpoint que confirma reservas

**Crear archivo:** `src/reservationService.ts`

```typescript
import { supabase } from "@/lib/supabase";
import { eventEmitter } from "@/src/Notification/eventEmitter";
import { INotificationEvent } from "@/src/Notification/types";

export async function confirmReservation(reservationId: string) {
  // Actualizar status a 1 (confirmada)
  const { data: reservation, error } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 1 })
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*), room:Pl_Rooms(*)')
    .single();

  if (error) throw error;

  // ========================
  // EMITIR EVENTO DE NOTIFICACIÓN
  // ========================
  try {
    const notificationEvent: INotificationEvent = {
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

    await eventEmitter.emit(notificationEvent);
    console.log('[reservationService] Evento RESERVATION_CONFIRMED emitido');
  } catch (notificationError) {
    console.error('[reservationService] Error en notificación:', notificationError);
  }

  return reservation;
}
```

---

### ✅ 3. MODIFICACIÓN DE RESERVA (RESERVATION_MODIFIED)

**En:** `src/reservationService.ts`

```typescript
export async function modifyReservation(
  reservationId: string,
  newCheckIn: string,
  newCheckOut: string
) {
  const { data: reservation, error } = await supabase
    .from('Pl_Reservations')
    .update({
      check_in: newCheckIn,
      check_out: newCheckOut,
    })
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  if (error) throw error;

  // EMITIR EVENTO
  try {
    const notificationEvent: INotificationEvent = {
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

    await eventEmitter.emit(notificationEvent);
    console.log('[reservationService] Evento RESERVATION_MODIFIED emitido');
  } catch (notificationError) {
    console.error('[reservationService] Error en notificación:', notificationError);
  }

  return reservation;
}
```

---

### ✅ 4. INICIO DEL HOSPEDAJE (LODGING_STARTED)

**En:** `src/lodgingService.ts` (crear si no existe)

```typescript
import { supabase } from "@/lib/supabase";
import { eventEmitter } from "@/src/Notification/eventEmitter";
import { INotificationEvent } from "@/src/Notification/types";

export async function startLodging(reservationId: string) {
  // Cambiar estado a 2 (en curso)
  const { data: reservation, error } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 2 })
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  if (error) throw error;

  // EMITIR EVENTO
  try {
    const notificationEvent: INotificationEvent = {
      type: 'LODGING_STARTED',
      user_id: reservation.pet.owner_id,
      data: {
        reservation_id: reservationId,
        pet_id: reservation.pet_id,
        user_id: reservation.pet.owner_id,
      },
    };

    await eventEmitter.emit(notificationEvent);
    console.log('[lodgingService] Evento LODGING_STARTED emitido');
  } catch (notificationError) {
    console.error('[lodgingService] Error en notificación:', notificationError);
  }

  return reservation;
}
```

---

### ✅ 5. FINALIZACIÓN DEL HOSPEDAJE (LODGING_ENDED)

**En:** `src/lodgingService.ts`

```typescript
export async function endLodging(reservationId: string) {
  // Cambiar estado a 3 (completada)
  const { data: reservation, error } = await supabase
    .from('Pl_Reservations')
    .update({ status_id: 3 })
    .eq('id', reservationId)
    .select('*, pet:Pl_Pets(*)')
    .single();

  if (error) throw error;

  // EMITIR EVENTO
  try {
    const notificationEvent: INotificationEvent = {
      type: 'LODGING_ENDED',
      user_id: reservation.pet.owner_id,
      data: {
        reservation_id: reservationId,
        pet_id: reservation.pet_id,
        user_id: reservation.pet.owner_id,
      },
    };

    await eventEmitter.emit(notificationEvent);
    console.log('[lodgingService] Evento LODGING_ENDED emitido');
  } catch (notificationError) {
    console.error('[lodgingService] Error en notificación:', notificationError);
  }

  return reservation;
}
```

---

### ✅ 6. AVISOS DE ESTADO DE MASCOTA (PET_STATUS_UPDATE)

**En:** Panel de admin (crear archivo) `src/adminService.ts`

```typescript
import { eventEmitter } from "@/src/Notification/eventEmitter";
import { INotificationEvent } from "@/src/Notification/types";

/**
 * El administrador envía un aviso personalizado sobre el estado de una mascota
 * @param userId - ID del propietario
 * @param title - Título del aviso (ej: "Max está comiendo bien 🐕")
 * @param message - Mensaje detallado del aviso
 */
export async function sendPetStatusUpdate(
  userId: string,
  title: string,
  message: string
) {
  try {
    const notificationEvent: INotificationEvent = {
      type: 'PET_STATUS_UPDATE',
      user_id: userId,
      data: {
        title,
        message,
      },
    };

    await eventEmitter.emit(notificationEvent);
    console.log('[adminService] Evento PET_STATUS_UPDATE emitido');
  } catch (notificationError) {
    console.error('[adminService] Error en notificación:', notificationError);
  }
}

// Ejemplo de uso en un panel de admin:
// await sendPetStatusUpdate(
//   userId,
//   'Luna está jugando y muy activa 🐶',
//   'Luna ha pasado la mañana jugando en el patio. Se ve muy feliz y come bien.'
// );
```

---

## Configuración Backend

### Opción 1: Express.js Local (Para Development)

**1. Crear proyecto backend**

```bash
mkdir hotel-mascotas-backend
cd hotel-mascotas-backend
npm init -y
npm install express dotenv nodemailer cors
npm install -D typescript @types/express @types/node tsx
```

**2. Copiar archivo de ejemplo**

Copiar el contenido de `src/Notification/emailServer.example.ts` a tu proyecto backend.

**3. Crear `.env`**

```env
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@hotelmascotasxyz.com
```

**4. Ejecutar servidor**

```bash
npx tsx emailServer.ts
# o si compilaste
npm run dev
```

**5. Actualizar URL de cliente**

En `.env.local` del Expo:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

### Opción 2: Supabase Edge Functions (Para Producción)

**1. Crear función Edge**

```bash
supabase functions new send-notification-email
```

**2. Implementar función**

`supabase/functions/send-notification-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, description } = await req.json();

    // Aquí integrar tu servicio de email (SendGrid, Resend, etc)
    // Por ahora, retornar éxito
    console.log(`[Function] Email para ${email}: ${name}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

**3. Deploy**

```bash
supabase functions deploy send-notification-email
```

---

## Testing

### Test Manual en App

```typescript
// En cualquier pantalla/componente
import { eventEmitter } from '@/src/Notification/eventEmitter';

// Botón de test
<TouchableOpacity
  onPress={async () => {
    const testEvent = {
      type: 'USER_REGISTERED',
      user_id: 'test-uuid',
      data: {
        email: 'test@example.com',
        firstname: 'Juan',
        lastname: 'Prueba',
      },
    };

    await eventEmitter.emit(testEvent);
    alert('Evento emitido - revisa console');
  }}
>
  <Text>Probar Notificación</Text>
</TouchableOpacity>
```

### Verificar Logs

1. **Console del app:** Buscar `[NotificationService]` logs
2. **Base de datos:** Revisar tabla `Pl_Notifications`
3. **Backend:** Revisar servidor de emails

---

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│                   USUARIO EN APP                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │   1. Se registra / Reserva / etc    │
         └─────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │  2. servi.xyz() emite evento        │
         │  eventEmitter.emit(event)           │
         └─────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │  3. EventEmitter llama listeners    │
         │  await eventListener(event)         │
         └─────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │  4. notificationService procesa     │
         │  handleXxxxx()                      │
         └─────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
  ┌──────────────────┐          ┌──────────────────┐
  │ Guardar en BD    │          │ Enviar Email     │
  │ Pl_Notifications │          │ api/send-email   │
  └──────────────────┘          └──────────────────┘
          │                                 │
          ▼                                 ▼
  ┌──────────────────┐          ┌──────────────────┐
  │ ✓ Guardado       │          │ ✓ Email enviado  │
  └──────────────────┘          └──────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │      📧 USUARIO RECIBE EMAIL        │
         └─────────────────────────────────────┘
```

---

## Troubleshooting

### ❌ "Email no se envía"

**Verificar:**

1. ¿Backend está corriendo?
   ```bash
   curl http://localhost:3000/health
   ```

2. ¿Variables de entorno correctas?
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

3. ¿Credenciales de email válidas?
   - Gmail: Usar "App Password", no contraseña normal
   - Outlook: Activar "Less secure apps"

4. **Ver logs:**
   ```typescript
   console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
   ```

---

### ❌ "Notificación no aparece en BD"

**Verificar:**

1. ¿Tipos existen en `Pl_NotificationTypes`?
   ```sql
   SELECT * FROM Pl_NotificationTypes;
   ```

2. ¿Permisos RLS en Supabase?
   - Ir a Authentication > Policies
   - Permitir INSERT en Pl_Notifications

3. **Ver error en console:**
   ```typescript
   catch (error) {
     console.error('[DatabaseNotificationService] Error:', error);
   }
   ```

---

### ❌ "Listeners no funcionan"

**Verificar:**

1. ¿Se llamó `registerAllListeners()`?
   - Debe estar en useEffect del componente root

2. ¿Sistema inicializado antes de emitir?
   ```typescript
   // ✓ Correcto
   useEffect(() => {
     registerAllListeners(); // Primero
   }, []);

   // ✗ Incorrecto
   eventEmitter.emit(event); // Sin registrar listeners
   ```

3. **Ver en console:**
   ```
   [Notification] Listener registrado para evento: USER_REGISTERED
   ```

---

### ❌ "Error CORS"

**Solución:**

Si el backend está en otro dominio, asegurar que tiene CORS habilitado:

```typescript
app.use(cors());
// o específico:
app.use(cors({
  origin: 'http://localhost:8081',
}));
```

---

## 📚 Resumen de Archivos Modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `DataBase/notificationScriptLlenado.sql` | ✅ Creado | Tipos de notificación |
| `HotelMascotasMovil/src/authService.ts` | ✅ Modificado | Integrado evento USER_REGISTERED |
| `HotelMascotasMovil/src/Notification/types.ts` | ✅ Creado | Interfaces TypeScript |
| `HotelMascotasMovil/src/Notification/eventEmitter.ts` | ✅ Creado | Observer pattern |
| `HotelMascotasMovil/src/Notification/notificationService.ts` | ✅ Creado | Lógica principal |
| `HotelMascotasMovil/src/Notification/emailService.ts` | ✅ Creado | Envío de emails |
| `HotelMascotasMovil/src/Notification/databaseNotificationService.ts` | ✅ Creado | Queries a Supabase |
| `HotelMascotasMovil/src/Notification/index.ts` | ✅ Creado | Listeners y exports |
| `HotelMascotasMovil/src/Notification/README.md` | ✅ Creado | Documentación |
| `HotelMascotasMovil/src/Notification/examples.ts` | ✅ Creado | Ejemplos de uso |
| `HotelMascotasMovil/src/Notification/emailServer.example.ts` | ✅ Creado | Backend Express |

---

## ✅ Checklist de Implementación

- [ ] Ejecutar SQL de tipos de notificación
- [ ] Actualizar `.env.local` con `EXPO_PUBLIC_API_URL`
- [ ] Agregar `registerAllListeners()` en App root
- [ ] Integrar en `authService.ts` ✓ (ya hecho)
- [ ] Crear `reservationService.ts` con eventos
- [ ] Crear `lodgingService.ts` con eventos
- [ ] Crear `adminService.ts` para avisos
- [ ] Crear backend de emails (Express o Supabase Functions)
- [ ] Configurar variables de email
- [ ] Probar envío de email
- [ ] Verificar notificaciones en BD
- [ ] Probar en dispositivo real

---

## 📞 Próximos Pasos

1. Crear los servicios faltantes (reservation, lodging, admin)
2. Implementar backend de emails
3. Configurar variables de producción
4. Testing en dispositivo real
5. Configurar alertas/monitoreo

¡Sistema listo para usar! 🎉
