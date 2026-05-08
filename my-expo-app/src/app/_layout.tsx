import { Stack, router } from "expo-router";
import { useEffect } from "react";
import "../../global.css";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Inner component to use theme
function RootLayoutInner() {
  const { isDark, isLoading } = useTheme();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    // You can show a splash screen here
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}