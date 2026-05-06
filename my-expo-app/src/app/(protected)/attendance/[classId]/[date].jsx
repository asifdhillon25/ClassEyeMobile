import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../../../services/api";

export default function TakeAttendance() {
  const { classId, date } = useLocalSearchParams();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      const classData = res.data.data;

      setStudents(classData.students || []);

      const initialState = {};

      classData.students.forEach((student) => {
        initialState[student._id] = "present";
      });

      setAttendance(initialState);

    } catch (error) {
      console.log(error);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]:
        prev[studentId] === "present"
          ? "absent"
          : "present",
    }));
  };

  const submitAttendance = async () => {
    try {
      const payload = {
        classId,
        date,
        records: Object.entries(attendance).map(
          ([studentId, status]) => ({
            student: studentId,
            status,
          })
        ),
      };

      await api.post("/attendance", payload);

      alert("Attendance Saved");

      router.push(
        `/(protected)/attendance/${classId}/history`
      );

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">

      <Text className="text-xl font-bold mb-5">
        {date}
      </Text>

      {students.map((student) => (
        <TouchableOpacity
          key={student._id}
          onPress={() => toggleAttendance(student._id)}
          className="bg-gray-100 p-4 rounded-xl mb-3"
        >
          <Text className="font-bold">
            {student.name}
          </Text>

          <Text>
            {attendance[student._id]}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={submitAttendance}
        className="bg-green-600 p-4 rounded-xl mt-5"
      >
        <Text className="text-white text-center font-bold">
          Save Attendance
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}