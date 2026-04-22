import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function TeacherHome() {
  return (
    <View className="flex-1 justify-center items-center">

      <Text>Teacher Dashboard</Text>

      <TouchableOpacity
        onPress={() => router.push("/(protected)/(teacher)/classes")}
      >
        <Text>Go to Classes</Text>
      </TouchableOpacity>

    </View>
  );
}