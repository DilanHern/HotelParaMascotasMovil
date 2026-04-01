import { supabase } from "@/lib/supabase";

interface Pet {
  id: string;
  name: string;
  race: string;
  animal: string;
  birthdate: string;
  weight?: number;
  gender?: boolean;
  profile_picture_url?: string;
  pet_type_id?: number;
}

interface PetType {
  id: number;
  name: string;
}

interface CreatePetData {
  name: string;
  race: string;
  birthdate: string;
  pet_type_id: number;
  weight: number;
  gender: boolean;
  veterinarian_name?: string;
  veterinarian_cellphone?: string;
  special_care_needs?: string;
  profile_picture_url?: string;
}

export async function getPetTypes(): Promise<PetType[]> {
  const { data, error } = await supabase
    .from("pl_pettypes")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getUserPetsWithTypes(): Promise<Pet[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_pets")
    .select(`
      id,
      name,
      race,
      birthdate,
      weight,
      gender,
      profile_picture_url,
      pet_type:pet_type_id (
        name
      )
    `)
    .eq("owner_id", user.id);

  if (error) throw error;

  return (data || []).map((pet: any) => ({
    id: pet.id,
    name: pet.name,
    race: pet.race,
    animal: pet.pet_type?.name || "Desconocido",
    birthdate: pet.birthdate,
    weight: pet.weight,
    gender: pet.gender,
    profile_picture_url: pet.profile_picture_url,
    pet_type_id: pet.pet_type_id,
  }));
}

export async function createPet(petData: CreatePetData): Promise<Pet> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("pl_pets")
    .insert([
      {
        name: petData.name,
        race: petData.race,
        birthdate: petData.birthdate,
        pet_type_id: petData.pet_type_id,
        weight: petData.weight,
        gender: petData.gender,
        owner_id: user.id,
        veterinarian_name: petData.veterinarian_name,
        veterinarian_cellphone: petData.veterinarian_cellphone,
        special_care_needs: petData.special_care_needs,
        profile_picture_url: petData.profile_picture_url,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePet(petId: string): Promise<void> {
  const { error } = await supabase
    .from("pl_pets")
    .delete()
    .eq("id", petId);

  if (error) throw error;
}
