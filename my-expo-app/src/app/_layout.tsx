import { Stack, router } from "expo-router";
import { useEffect } from "react";
import "../../global.css";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login"); // redirect safely
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}