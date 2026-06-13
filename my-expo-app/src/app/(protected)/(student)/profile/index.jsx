import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../../services/api";
import { useEffect, useState } from "react";

export default function StudentProfile() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const fetchStudent = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (!user) return;

      const userData = JSON.parse(user);
      const studentId = userData.linked_id;

      const response = await api.get(`/students/${studentId}`);

      if (response.data.status === "success") {
        setStudentData(response.data.data.student);
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const InfoItem = ({ icon, label, value, color = "#0D9488" }) => (
    <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 mb-3 shadow-card flex-row items-center">
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${color}18` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View className="flex-1">
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
          {label}
        </Text>

        <Text
          className="text-light-textPrimary dark:text-dark-textPrimary text-base font-semibold mt-1"
          numberOfLines={1}
        >
          {value || "Not available"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mt-3">
          Student not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-light-primary dark:bg-dark-primary px-5 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
      <StatusBar style="auto" />

      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back-outline" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold">Student Profile</Text>

          <View className="w-10" />
        </View>

        <View className="items-center">
          {studentData.photo_url ? (
            <Image
              source={{ uri: studentData.photo_url }}
              className="w-28 h-28 rounded-full border-4 border-white"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-white/20 items-center justify-center border-4 border-white">
              <Ionicons name="person-outline" size={52} color="white" />
            </View>
          )}

          <Text className="text-white text-2xl font-bold mt-4 text-center">
            {studentData.name || "Student"}
          </Text>

          <Text className="text-white/80 text-sm mt-1">
            {studentData.email || "No email"}
          </Text>

          <View className="mt-3 px-4 py-1.5 rounded-full bg-white/20">
            <Text className="text-white text-xs font-semibold">
              {studentData.status?.toUpperCase() || "ACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Academic Information
        </Text>

        <InfoItem
          icon="card-outline"
          label="Student ID"
          value={studentData._id}
          color="#1D4ED8"
        />

        <InfoItem
          icon="document-text-outline"
          label="Roll Number"
          value={studentData.roll_no}
          color="#0D9488"
        />

        <InfoItem
          icon="business-outline"
          label="Department"
          value={studentData.department}
          color="#8B5CF6"
        />

        <InfoItem
          icon="school-outline"
          label="Year"
          value={studentData.year ? `Year ${studentData.year}` : "Not assigned"}
          color="#F59E0B"
        />
      </View>

      <View className="px-6 mt-4">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Face Recognition Data
        </Text>

        <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-card">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: studentData.has_embeddings
                    ? "#10B98118"
                    : "#EF444418",
                }}
              >
                <Ionicons
                  name={
                    studentData.has_embeddings
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={25}
                  color={studentData.has_embeddings ? "#10B981" : "#EF4444"}
                />
              </View>

              <View className="flex-1">
                <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                  Embeddings Status
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                  Face data for recognition
                </Text>
              </View>
            </View>

            <Text
              className="text-xs font-bold"
              style={{
                color: studentData.has_embeddings ? "#10B981" : "#EF4444",
              }}
            >
              {studentData.has_embeddings ? "AVAILABLE" : "MISSING"}
            </Text>
          </View>

          <View className="h-px bg-light-surfaceMuted dark:bg-dark-surfaceMuted mb-4" />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                Images Used
              </Text>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold mt-1">
                {studentData.embeddings_image_count || 0}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                Last Updated
              </Text>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-sm font-semibold mt-1">
                {formatDate(studentData.embeddings_updated_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 mt-6 mb-8">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Record Details
        </Text>

        <InfoItem
          icon="calendar-outline"
          label="Created At"
          value={formatDate(studentData.created_at)}
          color="#64748B"
        />

        <InfoItem
          icon="time-outline"
          label="Updated At"
          value={formatDate(studentData.updated_at)}
          color="#64748B"
        />
      </View>
    </ScrollView>
  );
}