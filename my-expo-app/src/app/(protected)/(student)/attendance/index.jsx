import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import api from "../../../../services/api";

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    attendance_percentage: 0,
  });
  const [attendance, setAttendance] = useState([]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const fetchAttendance = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (!user) return;

      const userData = JSON.parse(user);
      const studentId = userData.linked_id;

      const response = await api.get(`/attendance/student/${studentId}/details`);

      if (response.data.success) {
        setStudent(response.data.data.student);
        setSummary(response.data.data.summary);
        setAttendance(response.data.data.attendance || []);
      }
    } catch (error) {
      console.log("Student attendance fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, []);

  const StatCard = ({ label, value, icon, color }) => (
    <View
      className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 shadow-card flex-1"
      style={{ minWidth: "45%" }}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
            {label}
          </Text>
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-1">
            {value}
          </Text>
        </View>

        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Ionicons name={icon} size={18} color={color} />
        </View>
      </View>
    </View>
  );

  const AttendanceCard = ({ item }) => {
    const isPresent = item.status === "present";

    return (
      <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 mb-3 shadow-card">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-base font-bold">
              {item.class?.name ||
                item.class?.class_name ||
                "Class"}
            </Text>

            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
              {formatDate(item.date)}
            </Text>
          </View>

          <View
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: isPresent ? "#10B98118" : "#EF444418",
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: isPresent ? "#10B981" : "#EF4444" }}
            >
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="h-px bg-light-surfaceMuted dark:bg-dark-surfaceMuted my-4" />

        <View className="flex-row flex-wrap">
          <Detail icon="person-outline" label="Teacher" value={item.teacher?.name} />
          <Detail icon="create-outline" label="Marked By" value={item.marked_by} />
          <Detail icon="camera-outline" label="Method" value={item.method} />
          <Detail icon="time-outline" label="Marked At" value={formatTime(item.marked_at)} />
          <Detail icon="image-outline" label="Images" value={item.images_count?.toString()} />
          <Detail
            icon="checkmark-done-outline"
            label="Finalized"
            value={item.is_finalized ? "Yes" : "No"}
          />
        </View>
      </View>
    );
  };

  const Detail = ({ icon, label, value }) => (
    <View className="w-1/2 flex-row items-center mb-3">
      <Ionicons name={icon} size={15} color="#94A3B8" />
      <View className="ml-2 flex-1">
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-[10px]">
          {label}
        </Text>
        <Text
          className="text-light-textPrimary dark:text-dark-textPrimary text-xs font-semibold"
          numberOfLines={1}
        >
          {value || "N/A"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading attendance...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-light-background dark:bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar style="auto" />

      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back-outline" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold">My Attendance</Text>

          <View className="w-10" />
        </View>

        <Text className="text-white/80 text-sm">Attendance Overview</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {student?.name || "Student"}
        </Text>
        <Text className="text-white/70 text-xs mt-1">
          Roll No: {student?.roll_no || "N/A"}
        </Text>

        <View className="mt-5">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/80 text-sm">Overall Percentage</Text>
            <Text className="text-white font-bold">
              {summary.attendance_percentage || 0}%
            </Text>
          </View>

          <View className="h-3 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${summary.attendance_percentage || 0}%`,
                backgroundColor: getAttendanceColor(
                  summary.attendance_percentage || 0
                ),
              }}
            />
          </View>
        </View>
      </View>

      <View className="px-6 -mt-5">
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            label="Total Days"
            value={summary.total_days}
            icon="calendar-outline"
            color="#1D4ED8"
          />
          <StatCard
            label="Present"
            value={summary.present_days}
            icon="checkmark-circle-outline"
            color="#10B981"
          />
          <StatCard
            label="Absent"
            value={summary.absent_days}
            icon="close-circle-outline"
            color="#EF4444"
          />
          <StatCard
            label="Percentage"
            value={`${summary.attendance_percentage || 0}%`}
            icon="stats-chart-outline"
            color={getAttendanceColor(summary.attendance_percentage || 0)}
          />
        </View>
      </View>

      <View className="px-6 mt-6 mb-8">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Attendance History
        </Text>

        {attendance.length === 0 ? (
          <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-8 items-center">
            <Ionicons name="calendar-clear-outline" size={45} color="#94A3B8" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold mt-3">
              No records found
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center text-sm mt-1">
              Your attendance history will appear here.
            </Text>
          </View>
        ) : (
          attendance.map((item) => (
            <AttendanceCard key={item.attendance_id} item={item} />
          ))
        )}
      </View>
    </ScrollView>
  );
}