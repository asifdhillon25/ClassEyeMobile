import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../../context/ThemeContext";

export default function ProtectedLayout() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      
      // Get user role
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setUserRole(userData.role?.toLowerCase() || "teacher");
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

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
      {userRole === "admin" && (
        <Stack.Screen 
          name="(admin)" 
          options={{ 
            headerShown: false,
            title: "Admin Dashboard"
          }} 
        />
      )}
      {userRole === "teacher" && (
        <Stack.Screen 
          name="(teacher)" 
          options={{ 
            headerShown: false,
            title: "Teacher Dashboard"
          }} 
        />
      )}
      {userRole === "student" && (
        <Stack.Screen 
          name="(student)" 
          options={{ 
            headerShown: false,
            title: "Student Dashboard"
          }} 
        />
      )}
      <Stack.Screen 
        name="attendance" 
        options={{ 
          headerShown: false,
          title: "Attendance"
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Settings",
          headerShown: true
        }} 
      />
    </Stack>
  );
}