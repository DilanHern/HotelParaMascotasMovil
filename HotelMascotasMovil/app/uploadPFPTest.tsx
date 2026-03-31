import { uploadPetProfilePicture } from "@/src/petPFP";
import { getCurrentUser } from "@/src/authService";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface SelectedImage {
  uri: string;
  name: string;
  mimeType?: string;
}

export default function UploadPFPTestScreen() {
  const [ownerId, setOwnerId] = useState<string>("");
  const [petId, setPetId] = useState<string>("");
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [loading, setLoading] = useState(false);

  const canUpload = useMemo(() => {
    return !!ownerId.trim() && !!petId.trim() && !!image?.uri && !loading;
  }, [ownerId, petId, image, loading]);

  const loadCurrentUser = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        Alert.alert("Sesion", "No hay un usuario autenticado.");
        return;
      }
      setOwnerId(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a tu galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const pickedName = asset.fileName || `pet_image_${Date.now()}.jpg`;
    setImage({
      uri: asset.uri,
      name: pickedName,
      mimeType: asset.mimeType,
    });
  };

  const submitUpload = async () => {
    if (!image?.uri) {
      Alert.alert("Imagen", "Selecciona una imagen primero.");
      return;
    }

    setLoading(true);
    try {
      const result = await uploadPetProfilePicture({
        ownerId,
        petId,
        imageUri: image.uri,
        imageName: image.name,
        mimeType: image.mimeType,
      });

      Alert.alert(
        "Exito",
        `Imagen subida y perfil actualizado.\n\nPath: ${result.storagePath}\nURL: ${result.publicUrl}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado.";
      Alert.alert("Error al subir", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Prueba de Upload PFP Mascota</Text>

        <Pressable style={styles.secondaryButton} onPress={loadCurrentUser} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Obtener userId de sesion</Text>
        </Pressable>

        <TextInput
          style={styles.input}
          value={ownerId}
          onChangeText={setOwnerId}
          placeholder="ownerId"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          value={petId}
          onChangeText={setPetId}
          placeholder="petId"
          autoCapitalize="none"
        />

        <Pressable style={styles.secondaryButton} onPress={pickImage} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Seleccionar imagen</Text>
        </Pressable>

        {image?.uri ? (
          <>
            <Image source={{ uri: image.uri }} style={styles.preview} />
            <Text style={styles.imageName}>{image.name}</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>No hay imagen seleccionada.</Text>
        )}

        <Pressable
          style={[styles.primaryButton, !canUpload && styles.primaryButtonDisabled]}
          onPress={submitUpload}
          disabled={!canUpload}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Subir PFP</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe3ef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94a3b8",
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  imageName: {
    fontSize: 12,
    color: "#64748b",
  },
  placeholder: {
    fontSize: 13,
    color: "#64748b",
  },
});
