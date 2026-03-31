import { supabase } from "@/lib/supabase";

const PET_PROFILE_BUCKET = "pet-profile-pictures";
const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg"]);

export interface PetProfileImageInput {
  ownerId: string;
  petId: string;
  imageUri: string;
  imageName?: string;
  mimeType?: string;
}

interface UploadPetProfilePictureResult {
  storagePath: string;
  publicUrl: string;
}

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

function extractExtension(input: PetProfileImageInput): string {
  const fromName = input.imageName?.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName;
  }

  const fromMime = input.mimeType?.toLowerCase();
  if (fromMime === "image/png") return "png";
  if (fromMime === "image/jpeg" || fromMime === "image/jpg") return "jpg";

  const fromUri = input.imageUri.split("?")[0].split(".").pop()?.toLowerCase();
  if (fromUri && ALLOWED_EXTENSIONS.has(fromUri)) {
    return fromUri;
  }

  throw new Error("Solo se permiten imagenes PNG, JPG o JPEG.");
}

export async function uploadPetProfilePicture(
  input: PetProfileImageInput
): Promise<UploadPetProfilePictureResult> {
  const { ownerId, petId, imageUri } = input;

  if (!ownerId?.trim()) {
    throw new Error("ownerId es requerido.");
  }
  if (!petId?.trim()) {
    throw new Error("petId es requerido.");
  }
  if (!imageUri?.trim()) {
    throw new Error("imageUri es requerido.");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(`Error obteniendo usuario autenticado: ${authError.message}`);
  }
  if (!user?.id || user.id !== ownerId) {
    throw new Error("ownerId no coincide con el usuario autenticado.");
  }

  const extension = extractExtension(input);
  const randomInt = Math.floor(Math.random() * 1_000_000);
  const baseName = sanitizeFileName(
    input.imageName?.replace(/\.[^/.]+$/, "") || `pet_${petId}`
  );
  const fileName = `${baseName}.${extension}`;
  const storagePath = `${ownerId}/${petId}/${randomInt}/${fileName}`;

  const fileResponse = await fetch(imageUri);
  if (!fileResponse.ok) {
    throw new Error("No se pudo leer el archivo de imagen desde el dispositivo.");
  }
  const fileArrayBuffer = await fileResponse.arrayBuffer();

  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  const { error: uploadError } = await supabase.storage
    .from(PET_PROFILE_BUCKET)
    .upload(storagePath, fileArrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen al bucket: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PET_PROFILE_BUCKET)
    .getPublicUrl(storagePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("No se pudo construir la URL publica de la imagen.");
  }

  const { error: updateError } = await supabase
    .from("pl_pets")
    .update({ profile_picture_url: publicUrlData.publicUrl })
    .eq("id", petId)
    .eq("owner_id", ownerId);

  if (updateError) {
    throw new Error(`Error al actualizar profile_picture_url: ${updateError.message}`);
  }

  return {
    storagePath,
    publicUrl: publicUrlData.publicUrl,
  };
}
