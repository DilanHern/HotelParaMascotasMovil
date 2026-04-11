import toastConfig from "@/components/ToastConfig";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import { registerAllListeners } from "@/src/Notification";

export default function RootLayout() {
  useEffect(() => {
    // Register all notification listeners when app starts
    registerAllListeners();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} />
    </>
  );
}
