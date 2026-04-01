import { supabase } from "@/lib/supabase";

interface Pet {
  id: string;
  name: string;
  race: string;
  birthdate: string;
  profile_picture_url?: string;
  weight?: number;
  pet_type_id?: number;
  gender?: boolean;
}

interface UserProfile {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  cellphone?: string;
}

export async function getUserPets(): Promise<Pet[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_pets")
    .select("id, name, race, birthdate, profile_picture_url, weight, pet_type_id, gender")
    .eq("owner_id", user.id);

  if (error) throw error;
  return data || [];
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_users")
    .select("id, firstname, lastname, email, cellphone")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getHomeData() {
  try {
    const [pets, profile] = await Promise.all([
      getUserPets(),
      getUserProfile(),
    ]);

    return {
      pets,
      profile,
    };
  } catch (error) {
    throw error;
  }
}
