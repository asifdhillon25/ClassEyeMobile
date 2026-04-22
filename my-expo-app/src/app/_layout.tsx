import { Stack, router } from "expo-router";
import { useEffect } from "react";
import "../../global.css";

export default function RootLayout() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login"); // redirect safely
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}