import {
  View,
  Text,
  TouchableOpacity,
  Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useLocalSearchParams,
  router
} from "expo-router";

import { useState } from "react";
import api from "../../../../services/api";

export default function AutoAttendance() {

  const { classId } = useLocalSearchParams();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pick images
  const pickImages = async () => {

    const result =
      await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1
      });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  // Upload images to backend
  const uploadImages = async () => {

    try {
      setLoading(true);

      // ✅ FIXED: AsyncStorage returns STRING → must parse
      const user = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(user);
      const teacherId = parsedUser?._id;

      if (!teacherId) {
        Alert.alert("Error", "Teacher not found");
        return;
      }

      const formData = new FormData();

      // ✅ REQUIRED by backend
      formData.append("teacherId", teacherId);

      // ✅ images for multer
      images.forEach((img, index) => {
        formData.append("images", {
          uri: img.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg"
        });
      });

      const res = await api.post(
        `/attendance/auto/${classId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const recognized =
        res.data.data.recognized_students;

    router.push({
  pathname: "/attendance/[classId]/review",
  params: {
    classId,
    attendanceId: res.data.data.attendance_id, // ✅ ADD THIS
    data: JSON.stringify(
      recognized.map(r => ({
        studentId: r.studentId,
        name: r.name,
        confidence: r.confidence,
        status: "present"
      }))
    )
  }
});

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to process images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5 bg-white">

      <TouchableOpacity
        onPress={pickImages}
        className="bg-green-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center">
          Select Images
        </Text>
      </TouchableOpacity>

      <Text>
        Selected: {images.length}
      </Text>

      <TouchableOpacity
        onPress={uploadImages}
        disabled={loading}
        className="bg-blue-500 p-4 rounded-lg mt-4"
      >
        <Text className="text-white text-center">
          {loading ? "Uploading..." : "Upload"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}