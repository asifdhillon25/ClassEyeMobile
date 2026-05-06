import { Stack } from "expo-router";

export default function AttendanceLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="[classId]/[date]"
        options={{ title: "Take Attendance" }}
      />

      <Stack.Screen
        name="[classId]/history"
        options={{ title: "Attendance History" }}
      />

      <Stack.Screen
        name="[classId]/report"
        options={{ title: "Attendance Report" }}
      />
    </Stack>
  );
}