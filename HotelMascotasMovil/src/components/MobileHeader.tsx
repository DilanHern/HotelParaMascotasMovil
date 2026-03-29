import { useRouter } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
		if (backPath) {
			router.push(backPath as any);
		} else {
			router.back();
		}
	};

	const handleLogout = () => {
		if (onLogout) onLogout();
		router.push("/" as any);
	};

	return (
		<View style={[styles.header, { backgroundColor }]}> 
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
	);
}

const styles = StyleSheet.create({
	header: {
		height: 76,
		paddingHorizontal: 12,
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

