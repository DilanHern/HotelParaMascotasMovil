import { DropdownSelect } from "@/components/DropdownSelect";
import { MobileHeader } from "@/components/MobileHeader";
import { supabase } from "@/lib/supabase";
import { uploadPetProfilePicture } from "@/src/petPFP";
import { getPetById, getPetTypes, updatePet } from "@/src/petsService";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Upload } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

interface DropdownOption {
	id: number;
	name: string;
}

interface SelectedImage {
	uri: string;
	name: string;
	mimeType?: string;
}

const generoOptions: DropdownOption[] = [
	{ id: 1, name: "Macho" },
	{ id: 2, name: "Hembra" },
];

export default function EditPet() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const petId = id as string;

	const [animalOptions, setAnimalOptions] = useState<DropdownOption[]>([]);
	const [loadingPetTypes, setLoadingPetTypes] = useState(true);

	// Estados para información de la mascota
	const [nombre, setNombre] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [tipoAnimalId, setTipoAnimalId] = useState<number | null>(null);
	const [generoId, setGeneroId] = useState<number | null>(null);
	const [raza, setRaza] = useState("");
	const [peso, setPeso] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [foto, setFoto] = useState<SelectedImage | null>(null);
	const [loading, setLoading] = useState(false);

	// Estados para contacto del veterinario
	const [veterinarioNombre, setVeterinarioNombre] = useState("");
	const [veterinarioTelefono, setVeterinarioTelefono] = useState("");
	const [cuidadosEspeciales, setCuidadosEspeciales] = useState("");
	const [vacunas, setVacunas] = useState("");
	const [condicionesMedicas, setCondicionesMedicas] = useState("");

	useEffect(() => {
		loadPetData();
	}, []);

	const loadPetData = async () => {
		try {
			setLoadingPetTypes(true);
			// Cargar tipos de animales
			const types = await getPetTypes();
			setAnimalOptions(types);

			// Cargar datos de la mascota
			if (petId) {
				const petData = await getPetById(petId);
				if (petData) {
					setNombre(petData.name);
					setFechaNacimiento(new Date(petData.birthdate));
					setTipoAnimalId(petData.pet_type_id || null);
					setRaza(petData.race);
					setPeso(petData.weight?.toString() || "");
					setDescripcion(petData.special_care_needs || "");

					// Buscar el género
					const genderIdValue = petData.gender === true ? 1 : petData.gender === false ? 2 : null;
					setGeneroId(genderIdValue);

					setVeterinarioNombre(petData.veterinarian_name || "");
					setVeterinarioTelefono(petData.veterinarian_cellphone || "");
					setCuidadosEspeciales(petData.special_care_needs || "");
					setCuidadosEspeciales(petData.special_care_needs || "");
					setVacunas(petData.vaccines || "");                          
					setCondicionesMedicas(petData.medical_conditions || "");     
				}
			}
		} catch (error) {
			console.error("Error loading pet data:", error);
			Alert.alert("Error", "No se pudo cargar la información de la mascota");
		} finally {
			setLoadingPetTypes(false);
		}
	};



	const pickImage = async () => {
		try {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Permiso denegado", "Se requiere acceso a la galería");
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.9,
			});

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0];
				setFoto({
					uri: asset.uri,
					name: asset.fileName || `pet_${Date.now()}.jpg`,
					mimeType: asset.mimeType,
				});
			}
		} catch (error: any) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "No se pudo seleccionar la imagen");
		}
	};

	const handleActualizar = async () => {
		if (!nombre || !fechaNacimiento || !tipoAnimalId || !generoId || !raza || !peso) {
			Alert.alert("Error", "Por favor completa todos los campos obligatorios");
			return;
		}

		const pesoNum = parseFloat(peso);
		if (isNaN(pesoNum) || pesoNum <= 0) {
			Alert.alert("Error", "El peso debe ser un número positivo");
			return;
		}

		if (veterinarioTelefono && veterinarioTelefono.length !== 8) {
			Alert.alert("Error", "El teléfono debe tener exactamente 8 dígitos");
			return;
		}

		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user?.id) {
				throw new Error("No se pudo obtener la información del usuario");
			}

			const genderBool = generoId === 1;

			// Subir imagen si existe
			if (foto) {
				try {
					await uploadPetProfilePicture({
						ownerId: user.id,
						petId: petId,
						imageUri: foto.uri,
						imageName: foto.name,
						mimeType: foto.mimeType,
					});
				} catch (imageError: any) {
					console.error("Error uploading image:", imageError);
					// Continuar aunque falle la imagen
				}
			}

			// Actualizar mascota
			await updatePet(petId, {
				name: nombre,
				race: raza,
				birthdate: fechaNacimiento.toISOString().split('T')[0],
				pet_type_id: tipoAnimalId,
				weight: pesoNum,
				gender: genderBool,
				veterinarian_name: veterinarioNombre || undefined,
				veterinarian_cellphone: veterinarioTelefono || undefined,
				special_care_needs: cuidadosEspeciales || undefined,
				vaccines: vacunas || undefined,                         
				medical_conditions: condicionesMedicas || undefined,
			});

			Alert.alert("Éxito", `Mascota ${nombre} actualizada correctamente`);
			router.back();
		} catch (error: any) {
			console.error("Error updating pet:", error);
			Alert.alert("Error", error.message || "No se pudo actualizar la mascota");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
			<MobileHeader title="Editar Mascota" showBack={true} backPath="/pets" />

			{loadingPetTypes ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6D4C41" />
					<Text style={styles.loadingText}>Cargando información...</Text>
				</View>
			) : (
				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Card de Información */}
					<View style={styles.card}>
						<Text style={styles.sectionTitle}>Información de la mascota</Text>

						{/* Nombre */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Nombre *</Text>
							<TextInput
								style={styles.input}
								value={nombre}
								onChangeText={setNombre}
								placeholderTextColor="#ccc"
								placeholder="Ej: Luffy"
								editable={!loading}
							/>
						</View>

						{/* Fecha de nacimiento */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Fecha de nacimiento *</Text>
							<TouchableOpacity
								style={styles.dateButton}
								onPress={() => setShowDatePicker(true)}
								disabled={loading}
							>
								<Text style={styles.dateButtonText}>
									{fechaNacimiento.toLocaleDateString()}
								</Text>
							</TouchableOpacity>
								<DateTimePickerModal
									isVisible={showDatePicker}
									mode="date"
									date={fechaNacimiento}
									onConfirm={(date: Date) => {
										setFechaNacimiento(date);
										setShowDatePicker(false);
									}}
									onCancel={() => setShowDatePicker(false)}
									maximumDate={new Date()}
									locale="es-ES"
								/>
						</View>

						{/* Tipo de animal */}
						<View style={styles.inputGroup}>
							<DropdownSelect
								label="Tipo de animal *"
								options={animalOptions}
								selectedId={tipoAnimalId}
								onSelect={(option) => setTipoAnimalId(Number(option.id))}
								placeholder="Selecciona"
							/>
						</View>

						{/* Género */}
						<View style={styles.inputGroup}>
							<DropdownSelect
								label="Género *"
								options={generoOptions}
								selectedId={generoId}
								onSelect={(option) => setGeneroId(Number(option.id))}
								placeholder="Selecciona"
							/>
						</View>

						{/* Raza */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Raza *</Text>
							<TextInput
								style={styles.input}
								value={raza}
								onChangeText={setRaza}
								placeholderTextColor="#ccc"
								placeholder="Ej: Persa"
								editable={!loading}
							/>
						</View>

						{/* Peso */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Peso (kg) *</Text>
							<TextInput
								style={styles.input}
								value={peso}
								onChangeText={setPeso}
								keyboardType="decimal-pad"
								placeholderTextColor="#ccc"
								placeholder="Ej: 4.5"
								editable={!loading}
							/>
						</View>

						{/* Descripción */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Descripción</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={descripcion}
								onChangeText={setDescripcion}
								placeholder="Características especiales de tu mascota"
								placeholderTextColor="#ccc"
								multiline
								numberOfLines={4}
								editable={!loading}
							/>
						</View>

						{/* Foto */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Foto (opcional)</Text>
							<TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
								<Upload color="#6b4226" size={24} />
								<Text style={styles.uploadButtonText}>Seleccionar imagen</Text>
							</TouchableOpacity>
							{foto && (
								<View style={styles.imagePreviewContainer}>
									<Image source={{ uri: foto.uri }} style={styles.imagePreview} />
									<Text style={styles.imageName}>{foto.name}</Text>
								</View>
							)}
						</View>

						{/* Cuidados especiales */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Cuidados especiales (opcional)</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={cuidadosEspeciales}
								onChangeText={setCuidadosEspeciales}
								placeholder="Comida especial, comportamiento, etc."
								placeholderTextColor="#ccc"
								multiline
								numberOfLines={4}
								editable={!loading}
							/>
						</View>

						{/* Vacunas */}
						<View style={styles.inputGroup}>
						<Text style={styles.label}>Vacunas (opcional)</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={vacunas}
							onChangeText={setVacunas}
							placeholder="Ej: Rabia, Parvovirus, etc."
							placeholderTextColor="#ccc"
							multiline
							numberOfLines={3}
							editable={!loading}
						/>
						</View>

						{/* Condiciones médicas */}
						<View style={styles.inputGroup}>
						<Text style={styles.label}>Condiciones médicas (opcional)</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={condicionesMedicas}
							onChangeText={setCondicionesMedicas}
							placeholder="Ej: Diabetes, alergias, etc."
							placeholderTextColor="#ccc"
							multiline
							numberOfLines={3}
							editable={!loading}
						/>
						</View>

						{/* Línea separadora */}
						<View style={styles.separator} />

						{/* Contacto del veterinario */}
						<Text style={[styles.sectionTitle, { marginTop: 20 }]}>
							Contacto del veterinario
						</Text>

						{/* Nombre veterinario */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Nombre</Text>
							<TextInput
								style={styles.input}
								value={veterinarioNombre}
								onChangeText={setVeterinarioNombre}
								placeholderTextColor="#ccc"
								placeholder="Nombre del veterinario"
								editable={!loading}
							/>
						</View>

						{/* Teléfono veterinario */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Teléfono</Text>
							<TextInput
								style={styles.input}
								value={veterinarioTelefono}
								onChangeText={(text) => {
									const numeros = text.replace(/[^0-9]/g, "");
									if (numeros.length <= 8) {
										setVeterinarioTelefono(numeros);
									}
								}}
								keyboardType="phone-pad"
								placeholderTextColor="#ccc"
								placeholder="12345678"
								maxLength={8}
								editable={!loading}
							/>
						</View>

						{/* Botón Actualizar */}
						<TouchableOpacity
							style={[styles.updateButton, loading && styles.updateButtonDisabled]}
							onPress={handleActualizar}
							disabled={loading}
						>
							<Text style={styles.updateButtonText}>
								{loading ? "Actualizando..." : "Actualizar Mascota"}
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff8e7",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6D4C41",
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	scrollContent: {
		paddingVertical: 16,
		paddingBottom: 24,
	},
	card: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#6b4226",
		marginBottom: 16,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#fff8e7",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: "#333",
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	textArea: {
		paddingTop: 10,
		textAlignVertical: "top",
	},
	dateButton: {
		backgroundColor: "#fff8e7",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	dateButtonText: {
		fontSize: 14,
		color: "#333",
	},
	datePickerModalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	datePickerModalContent: {
		backgroundColor: "#ffffff",
		paddingBottom: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	datePickerConfirmButton: {
		paddingVertical: 12,
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
	},
	datePickerConfirmButtonText: {
		color: "#6b4226",
		fontSize: 16,
		fontWeight: "600",
	},
	uploadButton: {
		backgroundColor: "#fff8e7",
		borderRadius: 8,
		paddingVertical: 16,
		paddingHorizontal: 12,
		alignItems: "center",
		gap: 8,
		borderWidth: 2,
		borderColor: "#6b4226",
	},
	uploadButtonText: {
		fontSize: 14,
		color: "#6b4226",
		fontWeight: "600",
	},
	separator: {
		height: 1,
		backgroundColor: "#e0e0e0",
		marginVertical: 12,
	},
	updateButton: {
		backgroundColor: "#6b4226",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	updateButtonDisabled: {
		backgroundColor: "#a1887f",
	},
	updateButtonText: {
		color: "#fff8e7",
		fontSize: 16,
		fontWeight: "700",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		color: "#d32f2f",
		fontWeight: "600",
	},
	imagePreviewContainer: {
		marginTop: 12,
		alignItems: "center",
	},
	imagePreview: {
		width: 150,
		height: 150,
		borderRadius: 8,
		backgroundColor: "#e0e0e0",
	},
	imageName: {
		fontSize: 12,
		color: "#64748b",
		marginTop: 8,
	},
});
