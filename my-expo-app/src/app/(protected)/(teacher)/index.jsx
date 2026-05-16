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
    photo_url: null
  });
  const [teacherClasses, setTeacherClasses] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Get teacher info from storage
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setTeacherInfo({
          name: userData.name || "Teacher",
          email: userData.email || "",
          id: userData._id || userData.id || "",
          photo_url: userData.photo_url || null
        });
      }

      // Fetch teacher's classes
      const classesResponse = await api.get("/classes/teacher");
      if (classesResponse.data.success) {
        const classes = classesResponse.data.data || [];
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

  // Teacher-specific stats
  const teacherStats = [
    { 
      label: "My Classes", 
      value: teacherClasses.length.toString(), 
      icon: "book-outline", 
      color: "#0D9488" 
    },
    { 
      label: "Total Students", 
      value: teacherClasses.reduce((total, cls) => total + (cls.students?.length || 0), 0).toString(), 
      icon: "people-outline", 
      color: "#1D4ED8" 
    },
    { 
      label: "Today's Attendance", 
      value: dashboardData?.kpis?.attendanceTodayPercent ? `${dashboardData.kpis.attendanceTodayPercent}%` : "0%", 
      icon: "stats-chart-outline", 
      color: "#10B981" 
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
      
      {/* Header Section with Teacher Profile */}
      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            {/* Profile Image or Icon */}
            {teacherInfo.photo_url ? (
              <Image 
                source={{ uri: teacherInfo.photo_url }}
                className="w-14 h-14 rounded-full border-2 border-white"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="person-outline" size={28} color="white" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-white text-xl font-bold">
                {teacherInfo.name}
              </Text>
              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {teacherInfo.email}
              </Text>
              <Text className="text-white/60 text-xs mt-0.5">
                ID: {teacherInfo.id}
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

      {/* Stats Grid - Teacher Specific */}
      <View className="px-6 -mt-6">
        <View className="flex-row flex-wrap gap-3">
          {teacherStats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-1"
              style={{ minWidth: '30%' }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                    {stat.label}
                  </Text>
                  <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-1">
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
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold">
            My Classes
          </Text>
          <TouchableOpacity onPress={() => router.push("/(protected)/(teacher)/classes")}>
            <Text className="text-light-primary dark:text-dark-primary text-sm font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {teacherClasses.length === 0 ? (
          <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 items-center">
            <Ionicons name="school-outline" size={40} color="#94A3B8" />
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-2">
              No classes assigned yet
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {teacherClasses.slice(0, 3).map((cls, index) => (
              <View key={cls._id || index}>
                <TouchableOpacity
                  onPress={() => router.push(`/(protected)/(teacher)/classes/${cls._id}`)}
                  className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 items-center justify-center mr-3">
                      <Ionicons name="book-outline" size={20} color="#0D9488" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold">
                        {cls.course_name}
                      </Text>
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-0.5">
                        {cls.section || 'Section A'} • {cls.students?.length || 0} Students
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
                
                {/* Class-specific action buttons */}
                <View className="flex-row gap-2 mt-2 ml-12">
                  <TouchableOpacity
                    onPress={() => router.push(`/attendance/${cls._id}/manual`)}
                    className="flex-1 bg-light-primary/10 dark:bg-dark-primary/10 py-2 rounded-lg flex-row items-center justify-center"
                  >
                    <Ionicons name="create-outline" size={14} color="#0D9488" />
                    <Text className="text-light-primary dark:text-dark-primary text-xs font-medium ml-1">
                      Mark
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => router.push(`/attendance/${cls._id}/auto`)}
                    className="flex-1 bg-light-accent/10 dark:bg-dark-accent/10 py-2 rounded-lg flex-row items-center justify-center"
                  >
                    <Ionicons name="camera-outline" size={14} color="#1D4ED8" />
                    <Text className="text-light-accent dark:text-dark-accent text-xs font-medium ml-1">
                      AI
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigateToClassHistory(cls._id, cls.course_name)}
                    className="flex-1 bg-purple-500/10 py-2 rounded-lg flex-row items-center justify-center"
                  >
                    <Ionicons name="time-outline" size={14} color="#8B5CF6" />
                    <Text className="text-purple-600 dark:text-purple-400 text-xs font-medium ml-1">
                      History
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigateToClassReport(cls._id, cls.course_name)}
                    className="flex-1 bg-amber-500/10 py-2 rounded-lg flex-row items-center justify-center"
                  >
                    <Ionicons name="document-text-outline" size={14} color="#F59E0B" />
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

      {/* Quick Actions Section */}
      <View className="px-6 mt-6">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Quick Actions
        </Text>
        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(teacher)/classes")}
            className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-light-primary/15">
              <Ionicons name="book-outline" size={22} color="#0D9488" />
            </View>
            <View className="flex-1">
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-base font-semibold">
                My Classes
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-0.5">
                View and manage your classes
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Usage Stats (Teacher View) */}
      {dashboardData && (
        <View className="px-6 mt-6 mb-8">
          <View className="flex-row items-center mb-3">
            <Ionicons name="hardware-chip-outline" size={18} color="#0D9488" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold ml-2">
              AI Features
            </Text>
          </View>
          <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="scan-outline" size={16} color="#0D9488" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-2">
                  Face Recognition Ready
                </Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                {dashboardData.aiUsage?.embeddingCoveragePercent || 0}%
              </Text>
            </View>
            <View className="h-px bg-light-border dark:bg-dark-border my-3" />
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="camera-outline" size={16} color="#22D3EE" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-2">
                  AI Attendance Used
                </Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                {dashboardData.aiUsage?.imageAttendanceRatio || 0}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Space */}
      <View className="h-4" />
    </ScrollView>
  );
}