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
  console.log("Intentando eliminar pet:", petId);
  const { error } = await supabase
    .from("pl_pets")
    .delete()
    .eq("id", petId);

  if (error) {
    console.error("Error en DELETE:", error.code, error.message, error.details);
    throw error;
  }
  console.log("Pet eliminada exitosamente");
}

export async function getPetById(petId: string): Promise<Pet | null> {
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
    .eq("id", petId)
    .single();

  if (error) throw error;

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    race: data.race,
    animal: data.pet_type?.name || "Desconocido",
    birthdate: data.birthdate,
    weight: data.weight,
    gender: data.gender,
    profile_picture_url: data.profile_picture_url,
    pet_type_id: data.pet_type_id,
  };
}

export async function updatePet(petId: string, petData: Partial<CreatePetData>): Promise<Pet> {
  const updateData: any = {};

  if (petData.name !== undefined) updateData.name = petData.name;
  if (petData.race !== undefined) updateData.race = petData.race;
  if (petData.birthdate !== undefined) updateData.birthdate = petData.birthdate;
  if (petData.pet_type_id !== undefined) updateData.pet_type_id = petData.pet_type_id;
  if (petData.weight !== undefined) updateData.weight = petData.weight;
  if (petData.gender !== undefined) updateData.gender = petData.gender;
  if (petData.veterinarian_name !== undefined) updateData.veterinarian_name = petData.veterinarian_name;
  if (petData.veterinarian_cellphone !== undefined) updateData.veterinarian_cellphone = petData.veterinarian_cellphone;
  if (petData.special_care_needs !== undefined) updateData.special_care_needs = petData.special_care_needs;
  if (petData.profile_picture_url !== undefined) updateData.profile_picture_url = petData.profile_picture_url;

  const { data, error } = await supabase
    .from("pl_pets")
    .update(updateData)
    .eq("id", petId)
    .select()
    .single();

  if (error) throw error;
  return data;
}