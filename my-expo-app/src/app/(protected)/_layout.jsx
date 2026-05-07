import { Slot, useRouter, Stack } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function ProtectedLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0D9488',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="(teacher)" 
        options={{ 
          headerShown: false,
          title: "Teacher Dashboard"
        }} 
      />
      <Stack.Screen 
        name="attendance" 
        options={{ 
          headerShown: false,
          title: "Attendance"
        }} 
      />
    </Stack>
  );
}