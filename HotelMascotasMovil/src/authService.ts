import { supabase } from "@/lib/supabase";
import { eventEmitter } from "./Notification/eventEmitter";
import { INotificationEvent } from "./Notification/types";

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  cedula: string;
  telefono: string;
  genero: string;
  line1: string;
  line2: string;
  distritoId: number;
}

export async function registerUser(formData: RegisterData) {
  const { nombre, email, password, cedula, telefono, genero, line1, line2, distritoId } = formData;

  // Separar nombre en firstname y lastname
  const nombreParts = nombre.trim().split(" ");
  const firstname = nombreParts[0];
  const lastname = nombreParts.slice(1).join(" ") || nombreParts[0];

  // Convertir género a entero
  const genderInt = genero === "Masculino" ? 0 : genero === "Femenino" ? 1 : 2;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstname,
        lastname,
        cedula,
        cellphone: telefono,
        gender: genderInt,
        line1,
        line2,
        district_id: distritoId,
      },
    },
  });

  if (error) throw error;

  // ========================
  // EMITIR EVENTO DE NOTIFICACIÓN
  // ========================
  if (data.user) {
    try {
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
      console.log('[authService] Evento USER_REGISTERED emitido');
    } catch (notificationError) {
      console.error('[authService] Error emitiendo notificación:', notificationError);
      // No fallar el registro por error en notificación
    }
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Enviar OTP al email
export async function sendPasswordResetOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: undefined, // ← esto fuerza OTP en lugar de magic link
    },
  });
  if (error) throw error;
}

// Verificar OTP e iniciar sesión
export async function verifyOtp(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
}

// Cambiar contraseña (ya autenticado con OTP)
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}