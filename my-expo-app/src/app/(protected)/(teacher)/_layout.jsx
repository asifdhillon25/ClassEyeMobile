import { Stack } from "expo-router";

export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Teacher Dashboard" }}
      />

      <Stack.Screen
        name="classes/index"
        options={{ title: "Classes" }}
      />

      <Stack.Screen
        name="classes/[id]"
        options={{ title: "Class Details" }}
      />
    </Stack>
  );
}