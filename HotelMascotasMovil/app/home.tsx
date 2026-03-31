import { MobileHeader } from "@/components/MobileHeader";
import { useRouter } from "expo-router";
import { Bell, Calendar, Grid3x3, User, Heart } from "lucide-react-native";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



interface Pet {
	id: string;
	name: string;
	breed: string;
	animal: string;
	age: number;
	weight: number;
	image?: string;
}

export default function HomeScreen() {
	const router = useRouter();
	const [pets] = useState<Pet[]>([
		{
			id: "1",
			name: "Luffy",
			breed: "Persa",
			animal: "Gato",
			age: 2,
			weight: 4.5,
			image: undefined,
		},
		{
			id: "2",
			name: "Max",
			breed: "Labrador",
			animal: "Perro",
			age: 3,
			weight: 30,
			image: undefined,
		},
	]);

	return (
		<SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
			<MobileHeader title="PetLodge" showLogout />

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Título principal */}
				<Text style={styles.mainTitle}>Mis Mascotas</Text>

				{/* Subtítulo */}
				<Text style={styles.subtitle}>Gestiona tus mascotas y reservas</Text>
            
				{/* Cards de mascotas */}
				<View style={styles.petsContainer}>
					{pets.map((pet) => (
						<View key={pet.id} style={styles.petCard}>
							{/* Imagen o icono de huella */}
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

							{/* Información de la mascota */}
							<View style={styles.petInfo}>
								<Text style={styles.petName}>{pet.name}</Text>
								<Text style={styles.petBreed}>
									{pet.breed} - {pet.animal}
								</Text>
								<View style={styles.petDetailsRow}>
									<Text style={styles.petDetail}>
										Edad: {pet.age} años
									</Text>
									<Text style={styles.petDetail}>
										Peso: {pet.weight} kg
									</Text>
								</View>
							</View>
						</View>
					))}
				</View>

				{/* Menu Cards */}
				<View style={styles.menuContainer}>
					{/* Cuadro 1 - Mis Mascotas */}
				<TouchableOpacity 
					style={[styles.menuCard, styles.darkCard]}
					onPress={() => router.push("/pets" as any)}
				>
				<Heart color="#fff8e7" size={24} />
				<View style={styles.menuTextContainer}>
					<Text style={[styles.menuTitle, styles.darkText]}>Mis Mascotas</Text>
					<Text style={[styles.menuSubtitle, styles.darkText]}>Editar, registrar o eliminar</Text>
				</View>
			</TouchableOpacity>

					{/* Cuadro 2 - Mis Reservas */}
					<TouchableOpacity 
						style={[styles.menuCard, styles.darkCard]}
						onPress={() => router.push("/Reservations" as any)}
					>
						<Grid3x3 color="#fff8e7" size={24} />
						<View style={styles.menuTextContainer}>
							<Text style={[styles.menuTitle, styles.darkText]}>Mis Reservas</Text>
							<Text style={[styles.menuSubtitle, styles.darkText]}>Ver y gestionar reservas</Text>
						</View>
					</TouchableOpacity>

					{/* Cuadro 3 - Notificaciones */}
					<TouchableOpacity style={[styles.menuCard, styles.lightCard]} onPress={() => router.push("/Notifications" as any)}>
						<Bell color="#6b4226" size={24} />
						<View style={styles.menuTextContainer}>
							<Text style={[styles.menuTitle, styles.lightText]}>Notificaciones</Text>
							<Text style={[styles.menuSubtitle, styles.lightText]}>Ver mensajes del sistema</Text>
						</View>
					</TouchableOpacity>

					{/* Cuadro 4 - Mi perfil */}
					<TouchableOpacity style={[styles.menuCard, styles.lightCard]}>
						<User color="#6b4226" size={24} />
						<View style={styles.menuTextContainer}>
							<Text style={[styles.menuTitle, styles.lightText]}>Mi perfil</Text>
							<Text style={[styles.menuSubtitle, styles.lightText]}>Editar información personal</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>
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
		paddingTop: 24,
	},
	mainTitle: {
		fontSize: 32,
		fontWeight: "700",
		color: "#6b4226",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 24,
		color: "#8b6f47",
		textAlign: "center",
		marginBottom: 24,
	},
	petsContainer: {
		gap: 16,
		paddingBottom: 24,
	},
	petCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	imageContainer: {
		width: 100,
		height: 100,
		borderRadius: 8,
		backgroundColor: "#f5f5f5",
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	petImage: {
		width: "100%",
		height: "100%",
	},
	petInfo: {
		flex: 1,
		justifyContent: "center",
	},
	petName: {
		fontSize: 18,
		fontWeight: "700",
		color: "#6b4226",
		marginBottom: 4,
	},
	petBreed: {
		fontSize: 14,
		color: "#8b6f47",
		marginBottom: 8,
	},
	petDetailsRow: {
		flexDirection: "row",
		gap: 12,
	},
	petDetail: {
		fontSize: 13,
		color: "#999999",
	},
	menuContainer: {
		gap: 12,
		paddingBottom: 24,
		marginTop: 16,
	},
	menuCard: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		gap: 12,
	},
	darkCard: {
		backgroundColor: "#6b4226",
	},
	lightCard: {
		backgroundColor: "#fff8e7",
		borderWidth: 2,
		borderColor: "#6b4226",
	},
	menuTextContainer: {
		justifyContent: "center",
		flex: 1,
	},
	menuTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 2,
	},
	menuSubtitle: {
		fontSize: 13,
	},
	darkText: {
		color: "#fff8e7",
	},
	lightText: {
		color: "#6b4226",
	},
});
