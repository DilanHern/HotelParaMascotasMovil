	import React, { useState, useEffect } from "react";
	import {
		StyleSheet,
		Text,
		View,
		TextInput,
		TouchableOpacity,
		ScrollView,
		Alert,
		ActivityIndicator,
	} from "react-native";
	import { useRouter } from "expo-router";
	import { MobileHeader } from "@/components/MobileHeader";
	import { DropdownSelect } from "@/components/DropdownSelect";
	import {
		provinces,
		getCantonsByProvince,
		getDistrictsByCanton,
	} from "@/utils/geographicData";
	import { getUserProfile, updateUserProfile, getLocationByDistrictId} from "@/src/userService";

	export default function EditProfile() {
		const router = useRouter();

		// Estados del usuario
		const [nombre, setNombre] = useState("");
		const [apellido, setApellido] = useState("");
		const [email, setEmail] = useState("");
		const [cedula, setCedula] = useState("");
		const [telefono, setTelefono] = useState("");
		const [genero, setGenero] = useState("Masculino");
		const [pais] = useState("Costa Rica");
		const [provinciaId, setProvinciaId] = useState<number | null>(null);
		const [cantonId, setCantonId] = useState<number | null>(null);
		const [distritoId, setDistritoId] = useState<number | null>(null);
		const [line1, setLine1] = useState("");
		const [line2, setLine2] = useState("");
		const [loading, setLoading] = useState(false);
		const [loadingProfile, setLoadingProfile] = useState(true);

		useEffect(() => {
			loadUserProfile();
		}, []);

		const loadUserProfile = async () => {
			try {
				setLoadingProfile(true);
				const profile = await getUserProfile();

				if (profile) {
					setNombre(profile.firstname || "");
					setApellido(profile.lastname || "");
					setEmail(profile.email || "");
					setCedula(profile.cedula || "");
					setTelefono(profile.cellphone || "");

					// Mapear gender
					if (profile.gender === 0) {
					setGenero("Masculino");
					} else if (profile.gender === 1) {
					setGenero("Femenino");
					} else {
					setGenero("Otro");
	}

					setLine1(profile.line1 || "");
					setLine2(profile.line2 || "");
					
					if (profile.district_id) {
						setDistritoId(profile.district_id);
						try {
							const location = await getLocationByDistrictId(profile.district_id);
							if (location) {
							const canton = location.pl_cantons as any;
							const province = canton?.pl_provinces as any;
							setCantonId(canton?.id || null);
							setProvinciaId(province?.id || null);
							}
						} catch (err) {
							console.error("Error cargando ubicación:", err);
						}
						}
				}
			} catch (error) {
				console.error("Error loading profile:", error);
				Alert.alert("Error", "No se pudo cargar el perfil");
			} finally {
				setLoadingProfile(false);
			}
		};

		const handleCedulaChange = (text: string) => {
			const numericText = text.replace(/[^0-9]/g, "");
			if (numericText.length <= 9) {
				setCedula(numericText);
			}
		};

		const handleTelefonoChange = (text: string) => {
			const numericText = text.replace(/[^0-9]/g, "");
			if (numericText.length <= 8) {
				setTelefono(numericText);
			}
		};

		const handleActualizarPerfil = async () => {
			// Validaciones
			if (!nombre || !cedula || !telefono || !distritoId) {
				Alert.alert("Error", "Por favor completá todos los campos obligatorios");
				return;
			}

			if (cedula.length < 9) {
				Alert.alert("Error", "La cédula debe tener 9 dígitos");
				return;
			}

			if (telefono.length < 8) {
				Alert.alert("Error", "El teléfono debe tener 8 dígitos");
				return;
			}

			setLoading(true);

			try {
				// Mapear género a entero	
				const genderInt = genero === "Masculino" ? 0 : genero === "Femenino" ? 1 : 2;

				const updateData: any = {
					firstname: nombre,
					lastname: apellido,
					cedula: cedula,
					cellphone: telefono,
					gender: genderInt,
					line1: line1 || "",
					line2: line2 || "",
					district_id: Number(distritoId),
				};



				console.log("Enviando datos:", updateData);

				await updateUserProfile(updateData);

				Alert.alert("Éxito", "Perfil actualizado correctamente");

				setTimeout(() => {
					router.replace("/home" as any);
				}, 500);
			} catch (e: any) {
				console.error("Error completo:", e);
				Alert.alert("Error", e.message || "Error inesperado");
			} finally {
				setLoading(false);
			}
		};

		if (loadingProfile) {
			return (
				<View style={styles.container}>
					<MobileHeader title="Editar Perfil" showBack={true} backPath="/home" />
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#6D4C41" />
						<Text style={styles.loadingText}>Cargando perfil...</Text>
					</View>
				</View>
			);
		}

		return (
			<View style={styles.container}>
				<MobileHeader title="Editar Perfil" showBack={true} backPath="/home" />

				<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
					<Text style={styles.title}>Mi Perfil</Text>
					<Text style={styles.subtitle}>Actualiza tu información</Text>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Nombre</Text>
						<TextInput
							style={styles.input}
							value={nombre}
							onChangeText={setNombre}
							placeholder="Tu nombre"
							placeholderTextColor="#999"
							editable={!loading}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Apellido</Text>
						<TextInput
							style={styles.input}
							value={apellido}
							onChangeText={setApellido}
							placeholder="Tu apellido"
							placeholderTextColor="#999"
							editable={!loading}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Correo Electrónico</Text>
						<TextInput
							style={styles.input}
							value={email}
							editable={false}
							placeholderTextColor="#999"
						/>
						<Text style={styles.helpText}>No puedes cambiar tu correo electrónico</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Cédula Costarricense</Text>
						<TextInput
							style={styles.input}
							value={cedula}
							onChangeText={handleCedulaChange}
							placeholder="000000000"
							keyboardType="numeric"
							maxLength={9}
							placeholderTextColor="#999"
							editable={!loading}
						/>
						{cedula.length > 0 && cedula.length < 9 && (
							<Text style={styles.errorText}>La cédula debe tener 9 dígitos</Text>
						)}
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Teléfono Celular</Text>
						<TextInput
							style={styles.input}
							value={telefono}
							onChangeText={handleTelefonoChange}
							placeholder="00000000"
							keyboardType="numeric"
							maxLength={8}
							placeholderTextColor="#999"
							editable={!loading}
						/>
						{telefono.length > 0 && telefono.length < 8 && (
							<Text style={styles.errorText}>El teléfono debe tener 8 dígitos</Text>
						)}
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Género</Text>
						<View style={styles.buttonGroup}>
							<TouchableOpacity
								style={[styles.optionButton, genero === "Masculino" && styles.optionButtonActive]}
								onPress={() => setGenero("Masculino")}
								disabled={loading}
							>
								<Text style={[styles.optionButtonText, genero === "Masculino" && styles.optionButtonTextActive]}>
									Masculino
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.optionButton, genero === "Femenino" && styles.optionButtonActive]}
								onPress={() => setGenero("Femenino")}
								disabled={loading}
							>
								<Text style={[styles.optionButtonText, genero === "Femenino" && styles.optionButtonTextActive]}>
									Femenino
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.optionButton, genero === "Otro" && styles.optionButtonActive]}
								onPress={() => setGenero("Otro")}
								disabled={loading}
							>
								<Text style={[styles.optionButtonText, genero === "Otro" && styles.optionButtonTextActive]}>
									Otro
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					<Text style={styles.directionTitle}>Dirección</Text>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>País</Text>
						<View style={styles.countryContainer}>
							<Text style={styles.countryText}>{pais}</Text>
						</View>
					</View>

					<DropdownSelect
						label="Provincia"
						options={provinces}
						selectedId={provinciaId}
						onSelect={(option) => {
							setProvinciaId(option.id);
							setCantonId(null);
							setDistritoId(null);
						}}
						placeholder="Seleccionar provincia..."
					/>

					{provinciaId !== null && (
						<DropdownSelect
							label="Cantón"
							options={getCantonsByProvince(provinciaId)}
							selectedId={cantonId}
							onSelect={(option) => {
								setCantonId(option.id);
								setDistritoId(null);
							}}
							placeholder="Seleccionar cantón..."
						/>
					)}

					{cantonId !== null && (
						<DropdownSelect
							label="Distrito"
							options={getDistrictsByCanton(cantonId)}
							selectedId={distritoId}
							onSelect={(option) => setDistritoId(option.id)}
							placeholder="Seleccionar distrito..."
						/>
					)}

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Dirección Línea 1 (Opcional)</Text>
						<TextInput
							style={styles.input}
							value={line1}
							onChangeText={setLine1}
							placeholderTextColor="#999"
							editable={!loading}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Dirección Línea 2 (Opcional)</Text>
						<TextInput
							style={styles.input}
							value={line2}
							onChangeText={setLine2}
							placeholderTextColor="#999"
							editable={!loading}
						/>
					</View>

					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleActualizarPerfil}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading ? "Actualizando..." : "Actualizar Perfil"}
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</View>
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
		scrollView: {
			flex: 1,
		},
		content: {
			paddingHorizontal: 20,
			paddingVertical: 20,
			paddingBottom: 40,
		},
		title: {
			fontSize: 32,
			fontWeight: "bold",
			marginBottom: 10,
			color: "#333",
			textAlign: "center",
		},
		subtitle: {
			fontSize: 18,
			marginBottom: 30,
			color: "#666",
			textAlign: "center",
		},
		directionTitle: {
			fontSize: 18,
			fontWeight: "600",
			color: "#333",
			marginTop: 20,
			marginBottom: 15,
		},
		inputGroup: {
			width: "100%",
			marginBottom: 20,
		},
		label: {
			fontSize: 16,
			fontWeight: "600",
			color: "#333",
			marginBottom: 8,
		},
		input: {
			width: "100%",
			backgroundColor: "#fff",
			paddingHorizontal: 15,
			paddingVertical: 12,
			borderRadius: 8,
			fontSize: 16,
			color: "#333",
		},
		helpText: {
			fontSize: 12,
			color: "#999",
			marginTop: 4,
		},
		buttonGroup: {
			flexDirection: "row",
			justifyContent: "space-between",
			gap: 10,
		},
		optionButton: {
			flex: 1,
			backgroundColor: "#fff",
			paddingVertical: 12,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: "#ddd",
			alignItems: "center",
		},
		optionButtonActive: {
			backgroundColor: "#6D4C41",
			borderColor: "#6D4C41",
		},
		optionButtonText: {
			fontSize: 14,
			fontWeight: "600",
			color: "#333",
		},
		optionButtonTextActive: {
			color: "#fff",
		},
		countryContainer: {
			backgroundColor: "#fff",
			paddingHorizontal: 15,
			paddingVertical: 12,
			borderRadius: 8,
			justifyContent: "center",
		},
		countryText: {
			fontSize: 16,
			color: "#333",
		},
		errorText: {
			color: "#d32f2f",
			fontSize: 12,
			marginTop: 4,
		},
		button: {
			width: "100%",
			backgroundColor: "#6D4C41",
			paddingVertical: 14,
			borderRadius: 8,
			alignItems: "center",
			marginTop: 20,
		},
		buttonDisabled: {
			backgroundColor: "#a1887f",
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "700",
		},
	});
