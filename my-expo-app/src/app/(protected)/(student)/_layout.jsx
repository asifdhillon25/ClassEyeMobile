import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function StudentLayout() {
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
          router.canGoBack() ? (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ) : null
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Student Dashboard"
        }} 
      />
      <Stack.Screen 
        name="attendance" 
        options={{ 
          title: "My Attendance",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="report" 
        options={{ 
          title: "Attendance Report",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: "My Profile",
          headerShown: true
        }} 
      />
    </Stack>
  );
}