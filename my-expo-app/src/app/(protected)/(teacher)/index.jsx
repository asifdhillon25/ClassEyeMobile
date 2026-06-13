import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export default function TeacherHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState({
    name: "",
    email: "",
    id: "",
    teacher_id: "",
    department: "",
    designation: "",
    phone: "",
    photo_url: null,
    join_date: "",
    status: ""
  });
  const [teacherClasses, setTeacherClasses] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Get user info from storage
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        console.log("No user found");
        return;
      }
      
      const userData = JSON.parse(user);
      const linkedId = userData.linked_id; // This should be the teacher's _id
      
      if (!linkedId) {
        console.log("No linked_id found for teacher");
        setLoading(false);
        return;
      }

      // Fetch teacher details with populated classes_assigned
      const teacherResponse = await api.get(`/teachers/${linkedId}`);
      if (teacherResponse.data.status === "success") {
        const teacher = teacherResponse.data.data.teacher;
        
        setTeacherInfo({
          name: teacher.name || "Teacher",
          email: teacher.email || "",
          id: teacher._id || "",
          teacher_id: teacher.teacher_id || "",
          department: teacher.department || "Not specified",
          designation: teacher.designation || "Lecturer",
          phone: teacher.phone || "",
          photo_url: teacher.photo_url || null,
          join_date: teacher.join_date || "",
          status: teacher.status || "active"
        });
        
        // Set populated classes
        const classes = teacher.classes_assigned || [];
        setTeacherClasses(classes);
      }

      // Fetch dashboard overview (teacher-specific stats)
      const response = await api.get("/dashboard/overview");
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

  // Calculate total students from populated classes
  const totalStudents = teacherClasses.reduce((total, cls) => {
    return total + (cls.students?.length || 0);
  }, 0);

  // Teacher-specific stats
  const teacherStats = [
    { 
      label: "My Classes", 
      value: teacherClasses.length.toString(), 
      icon: "book-outline", 
      color: "#0D9488",
      bgColor: "#E6F7F5"
    },
    { 
      label: "Total Students", 
      value: totalStudents.toString(), 
      icon: "people-outline", 
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    { 
      label: "Today's Attendance", 
      value: dashboardData?.kpis?.attendanceTodayPercent ? `${dashboardData.kpis.attendanceTodayPercent}%` : "0%", 
      icon: "stats-chart-outline", 
      color: "#10B981",
      bgColor: "#E6F9F0"
    },
  ];

  // Helper function to navigate to class-specific screens
  const navigateToClassHistory = (classId, className) => {
    router.push({
      pathname: `/attendance/${classId}/history`,
      params: { classId, className }
    });
  };

  const navigateToClassReport = (classId, className) => {
    router.push({
      pathname: `/attendance/${classId}/report`,
      params: { classId, className }
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <ActivityIndicator size="large" color="#0D9488" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />
      }
    >
      <StatusBar style="dark" />
      
      {/* Header Section with Teacher Profile */}
      <View 
        className="pt-12 pb-6 px-6"
        style={{ 
          backgroundColor: '#0F172A',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center flex-1">
            {/* Profile Image or Icon */}
            {teacherInfo.photo_url ? (
              <Image 
                source={{ uri: teacherInfo.photo_url }}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="school-outline" size={32} color="white" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-white text-xl font-bold">
                {teacherInfo.name}
              </Text>
              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {teacherInfo.email}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Text className="text-emerald-400 text-xs font-medium">
                    {teacherInfo.designation}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs ml-2">
                  ID: {teacherInfo.teacher_id}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/settings")}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Additional Teacher Info */}
        <View className="mt-4 pt-3 border-t border-white/10">
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={14} color="#94A3B8" />
              <Text className="text-gray-400 text-xs ml-1">
                {teacherInfo.department}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#94A3B8" />
              <Text className="text-gray-400 text-xs ml-1">
                {teacherInfo.phone || "No phone"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
              <Text className="text-gray-400 text-xs ml-1">
                Joined: {formatDate(teacherInfo.join_date)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid - Teacher Specific */}
      <View className="px-6 -mt-6">
        <View className="flex-row flex-wrap gap-3">
          {teacherStats.map((stat, index) => (
            <View 
              key={index} 
              className="rounded-xl p-4 shadow-sm flex-1"
              style={{ 
                backgroundColor: stat.bgColor,
                minWidth: '30%',
                borderWidth: 1,
                borderColor: `${stat.color}20`
              }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-gray-600 text-xs font-medium">
                    {stat.label}
                  </Text>
                  <Text className="text-gray-900 text-2xl font-bold mt-1">
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

      {/* Recent Classes Section */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-1 h-5 bg-teal-500 rounded-full mr-2" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              My Classes
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(protected)/(teacher)/classes")}>
            <Text className="text-teal-600 dark:text-teal-400 text-sm font-medium">
              View All ({teacherClasses.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {teacherClasses.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center shadow-sm">
            <Ionicons name="school-outline" size={48} color="#94A3B8" />
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-3 font-medium">
              No classes assigned yet
            </Text>
            <Text className="text-gray-500 dark:text-gray-500 text-center text-xs mt-1">
              Contact administrator for class assignments
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {teacherClasses.slice(0, 3).map((cls, index) => (
              <View key={cls._id || index}>
                <TouchableOpacity
                  onPress={() => router.push(`/(protected)/(teacher)/classes/${cls._id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                  activeOpacity={0.7}
                >
                  <View className="p-4">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 items-center justify-center mr-3">
                        <Ionicons name="book-outline" size={24} color="#0D9488" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-semibold text-base">
                          {cls.course_name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            Code: {cls.subject_code || cls.class_code}
                          </Text>
                          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                          <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            {cls.students?.length || 0} Students
                          </Text>
                        </View>
                        {cls.semester && (
                          <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            {cls.semester}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Class-specific action buttons */}
                <View className="flex-row gap-2 mt-2 px-1">
                  <TouchableOpacity
                    onPress={() => router.push(`/attendance/${cls._id}/manual`)}
                    className="flex-1 bg-teal-50 dark:bg-teal-900/20 py-2.5 rounded-lg flex-row items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color="#0D9488" />
                    <Text className="text-teal-600 dark:text-teal-400 text-xs font-medium ml-1">
                      Mark Attendance
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push(`/attendance/${cls._id}/auto`)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 py-2.5 rounded-lg flex-row items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium ml-1">
                      AI Attendance
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigateToClassHistory(cls._id, cls.course_name)}
                    className="flex-1 bg-purple-50 dark:bg-purple-900/20 py-2.5 rounded-lg flex-row items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                    <Text className="text-purple-600 dark:text-purple-400 text-xs font-medium ml-1">
                      History
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigateToClassReport(cls._id, cls.course_name)}
                    className="flex-1 bg-amber-50 dark:bg-amber-900/20 py-2.5 rounded-lg flex-row items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text-outline" size={16} color="#F59E0B" />
                    <Text className="text-amber-600 dark:text-amber-400 text-xs font-medium ml-1">
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions Section - Keeping existing route */}
      <View className="px-6 mt-6">
        <View className="flex-row items-center mb-3">
          <View className="w-1 h-5 bg-blue-500 rounded-full mr-2" />
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Quick Actions
          </Text>
        </View>
        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(teacher)/classes")}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 bg-teal-100 dark:bg-teal-900/30">
              <Ionicons name="book-outline" size={24} color="#0D9488" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white text-base font-semibold">
                My Classes
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                View and manage all your classes
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Usage Stats (Teacher View) */}
      {dashboardData && (
        <View className="px-6 mt-6 mb-8">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-5 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              AI Features
            </Text>
            <Ionicons name="flash-outline" size={16} color="#10B981" className="ml-2" />
          </View>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View className="bg-teal-100 dark:bg-teal-900/30 p-1.5 rounded-lg">
                  <Ionicons name="scan-outline" size={16} color="#0D9488" />
                </View>
                <Text className="text-gray-700 dark:text-gray-300 text-sm ml-2">
                  Face Recognition Ready
                </Text>
              </View>
              <Text className="text-gray-900 dark:text-white font-bold text-lg">
                {dashboardData.aiUsage?.embeddingCoveragePercent || 0}%
              </Text>
            </View>
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <View 
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: '#0D9488',
                  width: `${dashboardData.aiUsage?.embeddingCoveragePercent || 0}%` 
                }}
              />
            </View>
            
            <View className="flex-row justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded-lg">
                  <Ionicons name="camera-outline" size={16} color="#06B6D4" />
                </View>
                <View className="ml-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    AI Attendance Usage
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-semibold">
                    {dashboardData.aiUsage?.imageAttendanceRatio || 0}%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                  <Ionicons name="trending-up-outline" size={16} color="#10B981" />
                </View>
                <View className="ml-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Weekly Records
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-semibold">
                    {dashboardData.trends?.attendanceLast7Days || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Space */}
      <View className="h-6" />
    </ScrollView>
  );
}