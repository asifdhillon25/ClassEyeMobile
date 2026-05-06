import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '../../../../services/api';

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await api.get(`/classes/${id}`);
        console.log('Class Detail Response:', res.data);

        setData(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClass();
  }, [id]);

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-6 dark:bg-black">
      {/* CLASS HEADER */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-black dark:text-white">{data.course_name}</Text>

        <Text className="mt-1 text-gray-500">
          {data.class_code} • {data.subject_code}
        </Text>
      </View>

      {/* INFO CARD */}
      <View className="mb-4 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
        <Text className="text-black dark:text-white">Semester: {data.semester}</Text>

        <Text className="mt-1 text-black dark:text-white">Room: {data.room}</Text>
      </View>

      {/* TEACHER */}
      <View className="mb-4 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
        <Text className="mb-1 font-bold text-black dark:text-white">Teacher</Text>

        <Text className="text-black dark:text-white">{data.teacher?.name}</Text>

        <Text className="text-gray-500">{data.teacher?.email}</Text>
      </View>

      {/* STUDENTS */}
      <View className="mb-6 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
        <Text className="font-bold text-black dark:text-white">
          Students: {data.students?.length}
        </Text>
      </View>

      {/* ATTENDANCE BUTTON */}
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/attendance/[classId]',
            params: {
              classId: data._id,
            },
          });
        }}
        className="mb-10 rounded-xl bg-green-600 py-3">
        <Text className="text-center font-bold text-white">Take Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
