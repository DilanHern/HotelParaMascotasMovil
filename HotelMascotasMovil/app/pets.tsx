import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MobileHeader } from "@/components/MobileHeader";
import { Plus, Edit, Trash2 } from "lucide-react-native";

interface Pet {
	id: number;
	name: string;
	breed: string;
	animal: string;
	age: number;
	weight: number;
	size: "Pequeño" | "Mediano" | "Grande";
	gender: "Macho" | "Hembra";
	image?: string;
}

export default function PetsScreen() {
	const router = useRouter();
	const [pets] = useState<Pet[]>([
		{
			id: 1,
			name: "Luffy",
			breed: "Persa",
			animal: "Gato",
			age: 2,
			weight: 4.5,
			size: "Pequeño",
			gender: "Macho",
			image: undefined,
		},
		{
			id: 2,
			name: "Max",
			breed: "Labrador",
			animal: "Perro",
			age: 3,
			weight: 30,
			size: "Grande",
			gender: "Macho",
			image: undefined,
		},
		{
			id: 3,
			name: "Bella",
			breed: "Siamés",
			animal: "Gato",
			age: 1,
			weight: 3.2,
			size: "Pequeño",
			gender: "Hembra",
			image: undefined,
		},
	]);

	const handleEdit = (petId: number) => {
		// TODO: Implementar edición
		console.log("Editar mascota", petId);
	};

	const handleDelete = (petId: number) => {
		// TODO: Implementar eliminación
		console.log("Eliminar mascota", petId);
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
			<MobileHeader title="Mis Mascotas" showBack={true} backPath="/home" />

			{/* Botón Registrar Nueva Mascota */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.registerButton}
					activeOpacity={0.8}
					onPress={() => router.push("/PetRegister" as any)}
				>
					<Plus color="#ffffff" size={20} />
					<Text style={styles.registerButtonText}>Registrar nueva mascota</Text>
				</TouchableOpacity>
			</View>

			{/* Lista de Mascotas */}
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{pets.map((pet) => (
					<View key={pet.id} style={styles.petCard}>
						{/* Contenedor de imagen e info */}
						<View style={styles.petContentRow}>
							{/* Imagen */}
							<View style={styles.imageContainer}>
								{pet.image ? (
									<Image
										source={{ uri: pet.image }}
										style={styles.petImage}
										resizeMode="cover"
									/>
								) : (
									<Image
										source={require("@/assets/images/huellaGato.png")}
										style={styles.petImage}
										resizeMode="contain"
									/>
								)}
							</View>

							{/* Información */}
							<View style={styles.petInfo}>
								{/* ID y Nombre */}
								<View style={styles.headerRow}>
									<Text style={styles.petName}>{pet.name}</Text>
									<Text style={styles.petId}>ID: {pet.id}</Text>
								</View>

								{/* Raza - Animal */}
								<Text style={styles.petBreed}>
									{pet.breed} - {pet.animal}
								</Text>

								{/* Edad y Peso */}
								<View style={styles.detailsRow}>
									<Text style={styles.petDetail}>Edad: {pet.age} años</Text>
									<Text style={styles.petDetail}>Peso: {pet.weight} kg</Text>
								</View>

								{/* Tamaño y Género */}
								<View style={styles.detailsRow}>
									<Text style={styles.petDetail}>Tamaño: {pet.size}</Text>
									<Text style={styles.petDetail}>Género: {pet.gender}</Text>
								</View>
							</View>
						</View>

						{/* Botones de Acción */}
						<View style={styles.actionsContainer}>
							<TouchableOpacity
								style={styles.editButton}
								onPress={() => handleEdit(pet.id)}
							>
								<Edit color="#6b4226" size={18} />
								<Text style={styles.editButtonText}>Editar</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => handleDelete(pet.id)}
							>
								<Trash2 color="#ffffff" size={18} />
								<Text style={styles.deleteButtonText}>Eliminar</Text>
							</TouchableOpacity>
						</View>
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	buttonContainer: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	registerButton: {
		backgroundColor: "#6b4226",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	registerButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "600",
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	scrollContent: {
		paddingVertical: 12,
		paddingBottom: 24,
		gap: 16,
	},
	petCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	petContentRow: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 16,
	},
	imageContainer: {
		width: 100,
		height: 100,
		borderRadius: 8,
		backgroundColor: "#f5f5f5",
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
		flexShrink: 0,
	},
	petImage: {
		width: "100%",
		height: "100%",
	},
	petInfo: {
		flex: 1,
		justifyContent: "center",
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 4,
		gap: 8,
	},
	petName: {
		fontSize: 16,
		fontWeight: "700",
		color: "#6b4226",
		flex: 1,
	},
	petId: {
		fontSize: 11,
		color: "#999999",
		fontWeight: "600",
		flexShrink: 0,
	},
	petBreed: {
		fontSize: 12,
		color: "#666666",
		marginBottom: 8,
	},
	detailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
		gap: 4,
	},
	petDetail: {
		fontSize: 12,
		color: "#999999",
		flex: 1,
	},
	actionsContainer: {
		flexDirection: "row",
		gap: 12,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		paddingTop: 12,
	},
	editButton: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderWidth: 2,
		borderColor: "#6b4226",
		paddingVertical: 10,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	editButtonText: {
		color: "#6b4226",
		fontWeight: "600",
		fontSize: 14,
	},
	deleteButton: {
		flex: 1,
		backgroundColor: "#d32f2f",
		paddingVertical: 10,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	deleteButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		fontSize: 14,
	},
});
