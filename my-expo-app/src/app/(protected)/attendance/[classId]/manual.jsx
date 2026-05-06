import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import api from "../../../../services/api";

export default function ManualAttendance() {
  const { classId } = useLocalSearchParams();
  const [records, setRecords] = useState([]);

  // ---------------- FETCH STUDENTS ----------------
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      const studentsData = res.data?.data?.students || [];

      const formatted = studentsData
        .filter(s => s?._id)
        .map((s) => ({
          studentId: String(s._id),   // 🔥 FIXED KEY
          name: s?.name || "Unknown",
          roll_no: s?.roll_no || "-",
          status: "absent"
        }));

      setRecords(formatted);

    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  // ---------------- TOGGLE ----------------
  const toggleAttendance = (studentId) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? {
              ...item,
              status: item.status === "present" ? "absent" : "present"
            }
          : item
      )
    );
  };

  // ---------------- SAVE ----------------
 const saveAttendance = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    const parsedUser = JSON.parse(user);
    const teacherId = parsedUser?._id;

    const cleanedRecords = records
      .filter(r => r.studentId)
      .map((item) => ({
        studentId: String(item.studentId),
        status: item.status
      }));

    if (!cleanedRecords.length) {
      Alert.alert("Error", "No valid attendance records");
      return;
    }

    console.log("FINAL PAYLOAD:", {
      classId,
      teacherId,
      records: cleanedRecords
    });

    const res = await api.post(`/attendance/manual/${classId}`, {
      teacherId,
      records: cleanedRecords
    });

    const attendanceId = res.data?.data?._id; // ✅ IMPORTANT

    if (!attendanceId) {
      Alert.alert("Error", "Attendance ID not returned");
      return;
    }

    // ✅ MOVE TO REVIEW SCREEN
    router.push({
      pathname: "/attendance/[classId]/review",
      params: {
        classId,
        attendanceId,
        data: JSON.stringify(cleanedRecords)
      }
    });

  } catch (error) {
    console.log("API ERROR:", error.response?.data || error.message);
    Alert.alert("Error", "Failed to save attendance");
  }
};

  // ---------------- UI ----------------
  return (
    <ScrollView className="flex-1 bg-white p-4">

      {records.map((item) => (
        <TouchableOpacity
          key={item.studentId}
          onPress={() => toggleAttendance(item.studentId)}
          className="p-4 border mb-3 rounded-lg flex-row justify-between items-center"
        >
          <View>
            <Text className="font-bold">{item.name}</Text>
            <Text className="text-gray-500">{item.roll_no}</Text>
          </View>

          <Text
            className={
              item.status === "present"
                ? "text-green-600 font-bold"
                : "text-red-600 font-bold"
            }
          >
            {item.status.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={saveAttendance}
        className="bg-blue-600 p-4 rounded-lg mt-4"
      >
        <Text className="text-white text-center font-bold">
          Save Attendance
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}