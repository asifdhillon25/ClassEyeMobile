import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../../../services/api";

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await api.get(`/classes/${id}`);
        console.log("Class Detail Response:", res.data);

        setData(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClass();
  }, [id]);

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black px-5 pt-6">

      {/* CLASS HEADER */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-black dark:text-white">
          {data.course_name}
        </Text>

        <Text className="text-gray-500 mt-1">
          {data.class_code} • {data.subject_code}
        </Text>
      </View>

      {/* INFO CARD */}
      <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-4">
        <Text className="text-black dark:text-white">
          Semester: {data.semester}
        </Text>

        <Text className="text-black dark:text-white mt-1">
          Room: {data.room}
        </Text>
      </View>

      {/* TEACHER */}
      <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-4">
        <Text className="font-bold text-black dark:text-white mb-1">
          Teacher
        </Text>

        <Text className="text-black dark:text-white">
          {data.teacher?.name}
        </Text>

        <Text className="text-gray-500">
          {data.teacher?.email}
        </Text>
      </View>

      {/* STUDENTS */}
      <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6">
        <Text className="font-bold text-black dark:text-white">
          Students: {data.students?.length}
        </Text>
      </View>

      {/* ATTENDANCE BUTTON */}
      <TouchableOpacity
        onPress={() => {
          router.push(
            `/(protected)/attendance/${data._id}/${today}`
          );
        }}
        className="bg-green-600 py-3 rounded-xl mb-10"
      >
        <Text className="text-white text-center font-bold">
          Take Attendance
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}