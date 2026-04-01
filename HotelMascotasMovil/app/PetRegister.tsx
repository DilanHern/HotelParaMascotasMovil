import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Switch,
	Alert,
	Modal,
	Image,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MobileHeader } from "@/components/MobileHeader";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Upload } from "lucide-react-native";
import { DropdownSelect } from "@/components/DropdownSelect";
import * as ImagePicker from "expo-image-picker";
import { getPetTypes, createPet } from "@/src/petsService";

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

export default function PetRegister() {
	const router = useRouter();
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

	useEffect(() => {
		loadPetTypes();
	}, []);

	const loadPetTypes = async () => {
		try {
			const types = await getPetTypes();
			setAnimalOptions(types);
		} catch (error) {
			console.error("Error loading pet types:", error);
			Alert.alert("Error", "No se pudieron cargar los tipos de mascota");
		} finally {
			setLoadingPetTypes(false);
		}
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		if (selectedDate) {
			setFechaNacimiento(selectedDate);
		}
	};

	const pickImage = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Permiso requerido", "Debes permitir acceso a tu galería.");
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
		setFoto({
			uri: asset.uri,
			name: pickedName,
			mimeType: asset.mimeType,
		});
	};

	const getTipoAnimal = () => animalOptions.find(o => o.id === tipoAnimalId)?.name || "";
	const getGenero = () => generoOptions.find(o => o.id === generoId)?.name || "";

	const handleGuardar = async () => {
		// Validaciones básicas
		if (!nombre || !fechaNacimiento || !tipoAnimalId || !generoId || !raza || !peso || !veterinarioNombre || !veterinarioTelefono) {
			Alert.alert("Error", "Por favor completa todos los campos obligatorios");
			return;
		}

		// Validar peso
		const pesoNum = parseFloat(peso);
		if (isNaN(pesoNum) || pesoNum <= 0) {
			Alert.alert("Error", "El peso debe ser un número positivo");
			return;
		}

		// Validar teléfono
		if (veterinarioTelefono.length !== 8) {
			Alert.alert("Error", "El teléfono debe tener exactamente 8 dígitos");
			return;
		}

		setLoading(true);
		try {
			// Convertir generoId a boolean (1 = true/Macho, 2 = false/Hembra)
			const genderBool = generoId === 1;

			await createPet({
				name: nombre,
				race: raza,
				birthdate: fechaNacimiento.toISOString().split('T')[0],
				pet_type_id: tipoAnimalId,
				weight: pesoNum,
				gender: genderBool,
				veterinarian_name: veterinarioNombre,
				veterinarian_cellphone: veterinarioTelefono,
				special_care_needs: cuidadosEspeciales || undefined,
				profile_picture_url: foto?.uri || undefined,
			});

			Alert.alert("Éxito", "Mascota registrada correctamente");
			router.replace("/pets" as any);
		} catch (error: any) {
			console.error("Error creating pet:", error);
			Alert.alert("Error", error.message || "No se pudo registrar la mascota");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
			<MobileHeader title="Registrar Mascota" showBack={true} backPath="/pets" />

			{loadingPetTypes ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6D4C41" />
					<Text style={styles.loadingText}>Cargando formulario...</Text>
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
						>
							<Text style={styles.dateButtonText}>
								{fechaNacimiento.toLocaleDateString()}
							</Text>
						</TouchableOpacity>
						<Modal
							transparent={true}
							animationType="fade"
							visible={showDatePicker}
							onRequestClose={() => setShowDatePicker(false)}
						>
							<View style={styles.datePickerModalOverlay}>
								<View style={styles.datePickerModalContent}>
									<DateTimePicker
										value={fechaNacimiento}
										mode="date"
										display="spinner"
										onChange={handleDateChange}
										textColor="#333"
										maximumDate={new Date()}
									/>
									<TouchableOpacity
										style={styles.datePickerConfirmButton}
										onPress={() => setShowDatePicker(false)}
									>
										<Text style={styles.datePickerConfirmButtonText}>Confirmar</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Modal>
					</View>

					{/* Tipo de animal */}
					<View style={styles.inputGroup}>
						<DropdownSelect
							label="Tipo de animal *"
							options={animalOptions}
							selectedId={tipoAnimalId}
							onSelect={(option) => setTipoAnimalId(option.id)}
							placeholder="Selecciona"
						/>
					</View>

					{/* Género */}
					<View style={styles.inputGroup}>
						<DropdownSelect
							label="Género *"
							options={generoOptions}
							selectedId={generoId}
							onSelect={(option) => setGeneroId(option.id)}
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
						{foto?.uri && (
							<>
								<Image source={{ uri: foto.uri }} style={styles.imagePreview} />
								<Text style={styles.imageName}>{foto.name}</Text>
							</>
						)}
					</View>

					{/* Línea separadora */}
					<View style={styles.separator} />

					{/* Contacto del veterinario */}
					<Text style={[styles.sectionTitle, { marginTop: 20 }]}>
						Contacto del veterinario
					</Text>

					{/* Nombre veterinario */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Nombre *</Text>
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
						<Text style={styles.label}>Teléfono *</Text>
						<TextInput
							style={styles.input}
							value={veterinarioTelefono}
							onChangeText={(text) => {
								// Solo permitir números
								const numeros = text.replace(/[^0-9]/g, "");
								// Limitar a 8 dígitos
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

					{/* Botón Guardar */}
					<TouchableOpacity
						style={[styles.saveButton, loading && styles.saveButtonDisabled]}
						onPress={handleGuardar}
						disabled={loading}
					>
						<Text style={styles.saveButtonText}>
							{loading ? "Guardando..." : "Guardar Mascota"}
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
	toggleGroup: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	separator: {
		height: 1,
		backgroundColor: "#e0e0e0",
		marginVertical: 12,
	},
	saveButton: {
		backgroundColor: "#6b4226",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	saveButtonText: {
		color: "#fff8e7",
		fontSize: 16,
		fontWeight: "700",
	},
	saveButtonDisabled: {
		backgroundColor: "#a1887f",
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
	imagePreview: {
		width: "100%",
		height: 180,
		borderRadius: 8,
		marginTop: 12,
		backgroundColor: "#f0f0f0",
	},
	imageName: {
		fontSize: 12,
		color: "#666",
		marginTop: 8,
	},
});