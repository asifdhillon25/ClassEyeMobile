import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
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
        name="index" 
        options={{ 
          headerShown: false,
          title: "Admin Dashboard"
        }} 
      />
      <Stack.Screen 
        name="students" 
        options={{ 
          title: "Manage Students",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="teachers" 
        options={{ 
          title: "Manage Teachers",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="classes" 
        options={{ 
          title: "Manage Classes",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="reports" 
        options={{ 
          title: "System Reports",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="attendance" 
        options={{ 
          title: "Attendance Overview",
          headerShown: true
        }} 
      />
    </Stack>
  );
}