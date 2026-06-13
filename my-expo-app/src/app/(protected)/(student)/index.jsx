import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";
import AttendanceReportButton from "../../../components/AttendanceReportButton";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [studentInfo, setStudentInfo] = useState({
    id: "",
    name: "",
    email: "",
    roll_no: "",
    department: "",
    year: "",
    status: "",
    photo_url: null,
    has_embeddings: false,
    embeddings_image_count: 0,
    embeddings_updated_at: null,
    created_at: null,
    updated_at: null,
  });

  const [attendanceSummary, setAttendanceSummary] = useState({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    attendance_percentage: 0,
  });

  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const fetchDashboardData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (user) {
        const userData = JSON.parse(user);
        const studentId = userData.linked_id;

        const studentRes = await api.get(`/students/${studentId}`);

        if (studentRes.data.status === "success") {
          const student = studentRes.data.data.student;

          setStudentInfo({
            id: student._id || "",
            name: student.name || "Student",
            email: student.email || "",
            roll_no: student.roll_no || "",
            department: student.department || "Not Assigned",
            year: student.year || "Not Assigned",
            status: student.status || "active",
            photo_url: student.photo_url || null,
            has_embeddings: student.has_embeddings || false,
            embeddings_image_count: student.embeddings_image_count || 0,
            embeddings_updated_at: student.embeddings_updated_at || null,
            created_at: student.created_at || null,
            updated_at: student.updated_at || null,
          });
        }

        const attendanceRes = await api.get(
          `/attendance/student/${studentId}/details`
        );

        if (attendanceRes.data.success) {
          setAttendanceSummary(attendanceRes.data.data.summary);
          setAttendanceDetails(attendanceRes.data.data.attendance || []);
          setRecentAttendance(
            attendanceRes.data.data.attendance?.slice(0, 5) || []
          );
        }
      }
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const studentStats = [
    {
      label: "Attendance",
      value: `${attendanceSummary.attendance_percentage || 0}%`,
      icon: "stats-chart-outline",
      color: "#0D9488",
    },
    {
      label: "Present",
      value: attendanceSummary.present_days?.toString() || "0",
      icon: "checkmark-circle-outline",
      color: "#10B981",
    },
    {
      label: "Absent",
      value: attendanceSummary.absent_days?.toString() || "0",
      icon: "close-circle-outline",
      color: "#EF4444",
    },
    {
      label: "Total Days",
      value: attendanceSummary.total_days?.toString() || "0",
      icon: "calendar-outline",
      color: "#1D4ED8",
    },
  ];

  const quickActions = [
    {
      title: "My Attendance",
      description: "View detailed attendance records",
      icon: "calendar-outline",
      route: "/(protected)/(student)/attendance",
      color: "#0D9488",
    },
    {
      title: "Profile",
      description: "View and edit profile",
      icon: "person-outline",
      route: "/(protected)/(student)/profile",
      color: "#F59E0B",
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading dashboard...
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

      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            {studentInfo.photo_url ? (
              <Image
                source={{ uri: studentInfo.photo_url }}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="school-outline" size={30} color="white" />
              </View>
            )}

            <View className="ml-3 flex-1">
              <Text className="text-white text-xl font-bold">
                {studentInfo.name}
              </Text>

              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {studentInfo.email}
              </Text>

              <Text className="text-white/70 text-xs mt-1">
                Roll No: {studentInfo.roll_no}
              </Text>

              <Text className="text-white/70 text-xs">
                {studentInfo.department} • Year {studentInfo.year}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 -mt-6">
        <View className="flex-row flex-wrap gap-3">
          {studentStats.map((stat, index) => (
            <View
              key={index}
              className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-1"
              style={{ minWidth: "45%" }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                    {stat.label}
                  </Text>
                  <Text
                    className="text-2xl font-bold mt-1"
                    style={{
                      color:
                        stat.label === "Attendance"
                          ? getAttendanceColor(
                              attendanceSummary.attendance_percentage || 0
                            )
                          : undefined,
                    }}
                  >
                    {stat.value}
                  </Text>
                </View>

                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 mt-6">
        <AttendanceReportButton
          student={studentInfo}
          summary={attendanceSummary}
          attendance={attendanceDetails}
        />
      </View>

      <View className="px-6 mt-6">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Student Information
        </Text>

        <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
          <InfoRow label="Student ID" value={studentInfo.id} />
          <InfoRow label="Roll No" value={studentInfo.roll_no} />
          <InfoRow label="Department" value={studentInfo.department} />
          <InfoRow label="Year" value={`Year ${studentInfo.year}`} />
          <InfoRow label="Status" value={studentInfo.status?.toUpperCase()} />
          <InfoRow
            label="Face Embeddings"
            value={studentInfo.has_embeddings ? "Available" : "Not Available"}
          />
          <InfoRow
            label="Embedding Images"
            value={studentInfo.embeddings_image_count}
          />
          <InfoRow
            label="Embeddings Updated"
            value={formatDate(studentInfo.embeddings_updated_at)}
          />
          <InfoRow
            label="Profile Created"
            value={formatDate(studentInfo.created_at)}
          />
          <InfoRow
            label="Last Updated"
            value={formatDate(studentInfo.updated_at)}
          />
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold">
              Overall Attendance
            </Text>

            <Text
              className="font-bold"
              style={{
                color: getAttendanceColor(
                  attendanceSummary.attendance_percentage || 0
                ),
              }}
            >
              {attendanceSummary.attendance_percentage || 0}%
            </Text>
          </View>

          <View className="h-2 bg-light-surfaceMuted dark:bg-dark-surfaceMuted rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${attendanceSummary.attendance_percentage || 0}%`,
                backgroundColor: getAttendanceColor(
                  attendanceSummary.attendance_percentage || 0
                ),
              }}
            />
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
              Need 75% for good standing
            </Text>

            {attendanceSummary.attendance_percentage < 75 && (
              <Text className="text-light-error dark:text-dark-error text-xs">
                ⚠️ Below target
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold">
            Recent Activity
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(protected)/(student)/attendance")}
          >
            <Text className="text-light-primary dark:text-dark-primary text-sm font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentAttendance.length === 0 ? (
          <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 items-center">
            <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-2">
              No attendance records yet
            </Text>
          </View>
        ) : (
          <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
            <View className="space-y-3">
              {recentAttendance.map((record, index) => (
                <View key={index} className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-3 ${
                      record.status === "present"
                        ? "bg-light-success"
                        : "bg-light-error"
                    }`}
                  />

                  <View className="flex-1">
                    <Text className="text-light-textPrimary dark:text-dark-textPrimary text-sm font-medium">
                      {record.class?.name ||
                        record.class?.class_name ||
                        record.class_name ||
                        "Class"}
                    </Text>

                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                      {record.date
                        ? new Date(record.date).toLocaleDateString()
                        : "Date not available"}
                    </Text>

                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                      Marked by: {record.marked_by || "N/A"} • Method:{" "}
                      {record.method || "N/A"}
                    </Text>
                  </View>

                  <View
                    className={`px-2 py-1 rounded-full ${
                      record.status === "present"
                        ? "bg-light-success/15"
                        : "bg-light-error/15"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        record.status === "present"
                          ? "text-light-success"
                          : "text-light-error"
                      }`}
                    >
                      {record.status?.toUpperCase() || "ABSENT"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="px-6 mt-6">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Quick Actions
        </Text>

        <View className="space-y-3">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.route)}
              className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-row items-center"
              activeOpacity={0.7}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>

              <View className="flex-1">
                <Text className="text-light-textPrimary dark:text-dark-textPrimary text-base font-semibold">
                  {action.title}
                </Text>

                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-0.5">
                  {action.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-light-surfaceMuted dark:border-dark-surfaceMuted">
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
        {label}
      </Text>

      <Text
        className="text-light-textPrimary dark:text-dark-textPrimary text-sm font-semibold flex-1 text-right ml-4"
        numberOfLines={1}
      >
        {value || "Not available"}
      </Text>
    </View>
  );
}