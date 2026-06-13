import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
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
        name="[classId]/index"
        options={{ 
          title: "Attendance Modes"
        }}
      />

      <Stack.Screen
        name="[classId]/manual"
        options={{ 
          title: "Manual Attendance"
        }}
      />

      <Stack.Screen
        name="[classId]/auto"
        options={{ 
          title: "Auto Attendance"
        }}
      />

      <Stack.Screen
        name="[classId]/review"
        options={{ 
          title: "Review & Finalize"
        }}
      />

      <Stack.Screen
        name="[classId]/[date]"
        options={{ 
          title: "Attendance Details"
        }}
      />

      <Stack.Screen
        name="[classId]/history"
        options={{ 
          title: "Attendance History"
        }}
      />

      <Stack.Screen
        name="[classId]/report"
        options={{ 
          title: "Attendance Report"
        }}
      />
    </Stack>
  );
}