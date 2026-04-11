import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  cellphone: string;
  cedula: string;
  gender: number; // 0 = Masculino, 1 = Femenino, 2 = Otro
  line1: string;
  line2: string;
  district_id: number;
}

interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  cedula?: string;
  cellphone?: string;
  gender?: number;
  line1?: string;
  line2?: string;
  district_id?: number;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userData: UpdateUserData): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const updateData: any = {};

  if (userData.firstname !== undefined) updateData.firstname = userData.firstname;
  if (userData.lastname !== undefined) updateData.lastname = userData.lastname;
  if (userData.cedula !== undefined) updateData.cedula = userData.cedula;
  if (userData.cellphone !== undefined) updateData.cellphone = userData.cellphone;
  if (userData.gender !== undefined) updateData.gender = userData.gender;
  if (userData.line1 !== undefined) updateData.line1 = userData.line1;
  if (userData.line2 !== undefined) updateData.line2 = userData.line2;
  if (userData.district_id !== undefined) updateData.district_id = userData.district_id;

  console.log("UpdateData enviado a Supabase:", updateData);
  console.log("User ID:", user.id);

  const { data, error } = await supabase
    .from("pl_users")
    .update(updateData)
    .eq("id", user.id)
    .select();



  if (error) throw error;

  // Si data es null o vacío, aún así consideramos éxito pero retornamos datos parciales
  if (!data || data.length === 0) {
    console.log("Update sin retorno de datos, fetching perfil actualizado...");
    // Fetch el perfil actualizado
    return await getUserProfile() as UserProfile;
  }

  return data[0];
}

// Obtener datos geograficos
export async function getLocationByDistrictId(districtId: number) {
  const { data, error } = await supabase
    .from("pl_districts")
    .select(`
      id,
      name,
      canton_id,
      pl_cantons (
        id,
        name,
        province_id,
        pl_provinces (
          id,
          name
        )
      )
    `)
    .eq("id", districtId)
    .single();

  if (error) throw error;
  return data;
}