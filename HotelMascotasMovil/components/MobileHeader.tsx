import { useRouter } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MobileHeaderProps {
	title: string;
	backgroundColor?: string;
	titleColor?: string;
	showBack?: boolean;
	backPath?: string;
	showLogout?: boolean;
	onLogout?: () => void;
}

export function MobileHeader({
	title,
	backgroundColor = "#6b4226",
	titleColor = "#ffffff",
	showBack = false,
	backPath,
	showLogout = false,
	onLogout,
}: MobileHeaderProps) {
	const router = useRouter();

	const handleBack = () => {
		router.back();
	};

	const handleLogout = () => {
		if (onLogout) onLogout();
		router.push("/" as any);
	};

	return (
		<SafeAreaView edges={["top"]} style={{ backgroundColor }}>
			<View style={styles.header}>
				{showBack ? (
					<TouchableOpacity onPress={handleBack} style={styles.icon} accessibilityLabel="back">
						<ArrowLeft color={titleColor} size={20} />
					</TouchableOpacity>
				) : (
					<View style={styles.placeholder} />
				)}

				<Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>{title}</Text>

				{showLogout ? (
					<TouchableOpacity onPress={handleLogout} style={styles.icon} accessibilityLabel="logout">
						<LogOut color={titleColor} size={20} />
					</TouchableOpacity>
				) : (
					<View style={styles.placeholder} />
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 56,
		paddingHorizontal: 6,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		flex: 1,
		textAlign: "center",
		paddingHorizontal: 8,
	},
	icon: {
		width: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: {
		fontSize: 20,
	},
	placeholder: {
		width: 40,
	},
});

