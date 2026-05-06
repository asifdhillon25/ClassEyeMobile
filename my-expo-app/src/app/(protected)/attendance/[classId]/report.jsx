import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AttendanceReport() {
  const { classId } = useLocalSearchParams();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-bold">
        Attendance Report
      </Text>

      <Text>
        Class ID: {classId}
      </Text>
    </View>
  );
}