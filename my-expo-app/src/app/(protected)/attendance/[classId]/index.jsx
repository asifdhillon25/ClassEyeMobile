import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function AttendanceOptions() {
  const { classId } = useLocalSearchParams();

  return (
    <View className="flex-1 justify-center px-5 bg-white">

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mb-4"
        onPress={() =>
          router.push(`/attendance/${classId}/manual`)
        }
      >
        <Text className="text-white text-center">
          Manual Attendance
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-500 p-4 rounded-lg"
        onPress={() =>
          router.push(`/attendance/${classId}/auto`)
        }
      >
        <Text className="text-white text-center">
          AI Attendance
        </Text>
      </TouchableOpacity>

    </View>
  );
}