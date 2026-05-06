import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert
} from "react-native";

import {
  useLocalSearchParams,
  router
} from "expo-router";

import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../../services/api";

export default function ReviewAttendance() {

  const params = useLocalSearchParams();

  const initialData = JSON.parse(params.data || "[]");

  const attendanceId = params.attendanceId; // ✅ IMPORTANT

  const [records, setRecords] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const toggleStatus = (studentId) => {
    setRecords(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? {
              ...item,
              status: item.status === "present" ? "absent" : "present"
            }
          : item
      )
    );
  };

  const finalize = async () => {
    try {
      setLoading(true);

      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user);
      const teacherId = parsed?._id;

      const res = await api.post(
        `/attendance/${attendanceId}/finalize`,
        {
          teacherId
        }
      );

      Alert.alert("Success", "Attendance Finalized");

      router.replace("/(protected)/(teacher)");

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to finalize attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">

      {records.map(student => (
        <TouchableOpacity
          key={student.studentId}
          className="p-4 border mb-3 rounded-lg"
          onPress={() => toggleStatus(student.studentId)}
        >
          <Text>{student.name}</Text>

          <Text>
            Confidence: {student.confidence ?? "manual"}
          </Text>

          <Text>
            Status: {student.status}
          </Text>

        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={finalize}
        disabled={loading}
        className="bg-blue-500 p-4 rounded-lg mt-4"
      >
        <Text className="text-white text-center">
          {loading ? "Finalizing..." : "Finalize"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}