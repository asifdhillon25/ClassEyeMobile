import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    email: "",
    id: "",
    roll_no: "",
    photo_url: null,
    class_name: ""
  });
  const [attendanceSummary, setAttendanceSummary] = useState({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    attendance_percentage: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Get student info from storage
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setStudentInfo({
          name: userData.name || "Student",
          email: userData.email || "",
          id: userData._id || userData.id || "",
          roll_no: userData.roll_no || "",
          photo_url: userData.photo_url || null,
          class_name: userData.class_name || "Not Assigned"
        });

        // Fetch student's attendance summary
        const attendanceRes = await api.get(`/attendance/student/${userData._id}/summary`);
        if (attendanceRes.data.success) {
          setAttendanceSummary(attendanceRes.data.data.summary);
          setRecentAttendance(attendanceRes.data.data.recent || []);
        }
      }

      // Fetch dashboard overview (student-specific stats)
      const response = await api.get("/dashboard/student");
      if (response.data.success) {
        setDashboardData(response.data.data);
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

  // Student stats
  const studentStats = [
    { 
      label: "Attendance", 
      value: `${attendanceSummary.attendance_percentage || 0}%`, 
      icon: "stats-chart-outline", 
      color: "#0D9488" 
    },
    { 
      label: "Present", 
      value: attendanceSummary.present_days?.toString() || "0", 
      icon: "checkmark-circle-outline", 
      color: "#10B981" 
    },
    { 
      label: "Absent", 
      value: attendanceSummary.absent_days?.toString() || "0", 
      icon: "close-circle-outline", 
      color: "#EF4444" 
    },
    { 
      label: "Total Days", 
      value: attendanceSummary.total_days?.toString() || "0", 
      icon: "calendar-outline", 
      color: "#1D4ED8" 
    },
  ];

  const quickActions = [
    { 
      title: "My Attendance", 
      description: "View detailed attendance records", 
      icon: "calendar-outline", 
      route: "/(protected)/student/attendance",
      color: "#0D9488"
    },
    { 
      title: "Download Report", 
      description: "Download attendance report", 
      icon: "download-outline", 
      route: "/(protected)/student/report",
      color: "#8B5CF6"
    },
    { 
      title: "Profile", 
      description: "View and edit profile", 
      icon: "person-outline", 
      route: "/(protected)/student/profile",
      color: "#F59E0B"
    }
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

  // Get attendance color based on percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <ScrollView 
      className="flex-1 bg-light-background dark:bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar style="auto" />
      
      {/* Header Section with Student Profile */}
      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            {/* Profile Image or Icon */}
            {studentInfo.photo_url ? (
              <Image 
                source={{ uri: studentInfo.photo_url }}
                className="w-14 h-14 rounded-full border-2 border-white"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="school-outline" size={28} color="white" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-white text-xl font-bold">
                {studentInfo.name}
              </Text>
              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {studentInfo.email}
              </Text>
              <Text className="text-white/60 text-xs mt-0.5">
                Roll No: {studentInfo.roll_no} • {studentInfo.class_name}
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

      {/* Attendance Stats Grid */}
      <View className="px-6 -mt-6">
        <View className="flex-row flex-wrap gap-3">
          {studentStats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-1"
              style={{ minWidth: '45%' }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                    {stat.label}
                  </Text>
                  <Text 
                    className="text-2xl font-bold mt-1"
                    style={{ color: stat.label === "Attendance" ? getAttendanceColor(parseFloat(stat.value)) : undefined }}
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

      {/* Attendance Progress Bar */}
      <View className="px-6 mt-6">
        <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold">
              Overall Attendance
            </Text>
            <Text 
              className="font-bold"
              style={{ color: getAttendanceColor(attendanceSummary.attendance_percentage || 0) }}
            >
              {attendanceSummary.attendance_percentage || 0}%
            </Text>
          </View>
          <View className="h-2 bg-light-surfaceMuted dark:bg-dark-surfaceMuted rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full"
              style={{ 
                width: `${attendanceSummary.attendance_percentage || 0}%`,
                backgroundColor: getAttendanceColor(attendanceSummary.attendance_percentage || 0)
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

      {/* Recent Attendance Timeline */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold">
            Recent Activity
          </Text>
          <TouchableOpacity onPress={() => router.push("/(protected)/student/attendance")}>
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
              {recentAttendance.slice(0, 5).map((record, index) => (
                <View key={index} className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-3 ${record.status === 'present' ? 'bg-light-success' : 'bg-light-error'}`} />
                  <View className="flex-1">
                    <Text className="text-light-textPrimary dark:text-dark-textPrimary text-sm font-medium">
                      {record.class_name || 'Class'}
                    </Text>
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                      {record.date ? new Date(record.date).toLocaleDateString() : 'Date not available'}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${record.status === 'present' ? 'bg-light-success/15' : 'bg-light-error/15'}`}>
                    <Text className={`text-xs font-semibold ${record.status === 'present' ? 'text-light-success' : 'text-light-error'}`}>
                      {record.status?.toUpperCase() || 'ABSENT'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions Section */}
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
              <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tips Section */}
      <View className="px-6 mt-6 mb-8">
        <View className="bg-light-primary/5 dark:bg-dark-primary/5 rounded-xl p-4 border border-light-primary/20 dark:border-dark-primary/20">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold ml-2">
              Did you know?
            </Text>
          </View>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
            Regular attendance helps you stay on track with your studies. 
            You can download your attendance report anytime from the quick actions menu.
          </Text>
        </View>
      </View>

      {/* Bottom Space */}
      <View className="h-4" />
    </ScrollView>
  );
}