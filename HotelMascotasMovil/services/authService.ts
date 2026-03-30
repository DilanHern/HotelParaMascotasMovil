import { supabase } from "@/lib/supabase";

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
  const lastname = nombreParts.slice(1).join(" ") || ".";

  // Convertir género a boolean
  const genderBool = genero === "Masculino";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstname,
        lastname,
        cedula,
        cellphone: telefono,
        gender: genderBool,
        line1,
        line2,
        district_id: distritoId,
      },
    },
  });

  if (error) throw error;
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