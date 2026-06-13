import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    id: "",
    role: ""
  });

  const fetchDashboardData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setAdminInfo({
          name: userData.name || "Administrator",
          email: userData.email || "",
          id: userData._id || userData.id || "",
          role: userData.role || "Admin"
        });
      }

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

  const adminStats = dashboardData ? [
    { 
      label: "Total Students", 
      value: dashboardData.kpis.totalStudents?.toString() || "0", 
      icon: "people-outline", 
      color: "#0D9488",
      bgColor: "#E6F7F5",
      change: dashboardData.trends?.newStudentsThisMonth || 0,
      changeText: "new this month"
    },
    { 
      label: "Total Teachers", 
      value: dashboardData.kpis.totalTeachers?.toString() || "0", 
      icon: "school-outline", 
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      change: dashboardData.trends?.newTeachersThisMonth || 0,
      changeText: "new this month"
    },
    { 
      label: "Active Classes", 
      value: dashboardData.kpis.activeClasses?.toString() || "0", 
      icon: "book-outline", 
      color: "#06B6D4",
      bgColor: "#E0F7FA",
      change: null
    },
    { 
      label: "Today's Attendance", 
      value: `${dashboardData.kpis.attendanceTodayPercent || 0}%`, 
      icon: "calendar-outline", 
      color: "#10B981",
      bgColor: "#E6F9F0",
      subValue: `${dashboardData.kpis.attendanceTodayCount || 0} / ${dashboardData.kpis.totalStudents || 0}`,
      change: null
    },
  ] : [];

  const riskMetrics = dashboardData ? [
    {
      label: "At Risk",
      value: dashboardData.risks.atRiskStudents || 0,
      description: "Below 75% attendance",
      icon: "alert-triangle-outline",
      color: "#F59E0B",
      bgColor: "#FEF3C7"
    },
    {
      label: "Inactive",
      value: dashboardData.risks.inactiveStudents || 0,
      description: "No activity in 14 days",
      icon: "person-remove-outline",
      color: "#EF4444",
      bgColor: "#FEE2E2"
    },
    {
      label: "Pending Classes",
      value: dashboardData.risks.classesWithoutAttendanceThisWeek || 0,
      description: "No attendance recorded",
      icon: "time-outline",
      color: "#8B5CF6",
      bgColor: "#EDE9FE"
    }
  ] : [];

  const StatCard = ({ stat }) => (
    <View 
      className="rounded-2xl p-4 shadow-sm"
      style={{ 
        flex: 1, 
        minWidth: width < 400 ? '100%' : '48%', 
        marginBottom: 12,
        backgroundColor: stat.bgColor,
        borderWidth: 1,
        borderColor: `${stat.color}20`
      }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-gray-600 text-xs font-medium mb-1">
            {stat.label}
          </Text>
          <Text className="text-gray-900 text-3xl font-bold">
            {stat.value}
          </Text>
          {stat.subValue && (
            <Text className="text-gray-500 text-xs mt-1">
              {stat.subValue}
            </Text>
          )}
          {stat.change && stat.change > 0 && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="arrow-up-outline" size={12} color="#10B981" />
              <Text className="text-green-600 text-xs ml-1">
                +{stat.change} {stat.changeText}
              </Text>
            </View>
          )}
        </View>
        <View 
          className="rounded-full p-2"
          style={{ backgroundColor: `${stat.color}20` }}
        >
          <Ionicons name={stat.icon} size={24} color={stat.color} />
        </View>
      </View>
    </View>
  );

  const RiskCard = ({ metric }) => (
    <View 
      className="rounded-xl p-3"
      style={{ 
        backgroundColor: metric.bgColor, 
        flex: 1, 
        minWidth: width < 400 ? '100%' : '30%',
        borderWidth: 1,
        borderColor: `${metric.color}30`
      }}
    >
      <View className="flex-row items-center mb-2">
        <Ionicons name={metric.icon} size={16} color={metric.color} />
        <Text className="text-xs font-semibold ml-1" style={{ color: metric.color }}>
          {metric.label}
        </Text>
      </View>
      <Text className="text-2xl font-bold" style={{ color: metric.color }}>
        {metric.value}
      </Text>
      <Text className="text-gray-600 text-xs mt-1">
        {metric.description}
      </Text>
    </View>
  );

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
      
      {/* Modern Header */}
      <View 
        className="pt-12 pb-8 px-6"
        style={{ 
          backgroundColor: '#0F172A',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-gray-400 text-sm font-medium mb-1">
              Welcome back,
            </Text>
            <Text className="text-white text-2xl font-bold">
              {adminInfo.name.split(' ')[0]}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="bg-emerald-500/20 px-2 py-1 rounded-full">
                <Text className="text-emerald-400 text-xs font-medium">
                  {adminInfo.role}
                </Text>
              </View>
              <View className="flex-row items-center ml-2">
                <Ionicons name="mail-outline" size={12} color="#94A3B8" />
                <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>
                  {adminInfo.email}
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

        {/* Welcome Message */}
        <View className="mt-2">
          <Text className="text-gray-300 text-sm leading-5">
            Monitor your institution's performance and manage operations from this central dashboard.
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 -mt-6">
        <View className="flex-row flex-wrap justify-between gap-3">
          {adminStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </View>
      </View>

      {/* Risk Alerts Section */}
      {dashboardData && (dashboardData.risks.atRiskStudents > 0 || dashboardData.risks.inactiveStudents > 0) && (
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-5 bg-red-500 rounded-full mr-2" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Risk Alerts
            </Text>
            <View className="ml-2 bg-red-100 rounded-full px-2 py-0.5">
              <Text className="text-red-600 text-xs font-semibold">
                Action Required
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {riskMetrics.map((metric, index) => (
              metric.value > 0 && (
                <RiskCard key={index} metric={metric} />
              )
            ))}
          </View>
        </View>
      )}

      {/* AI & System Intelligence */}
      {dashboardData && (
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-5 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              System Intelligence
            </Text>
            <Ionicons name="flash-outline" size={16} color="#10B981" className="ml-2" />
          </View>
          
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            {/* AI Coverage */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="bg-teal-100 dark:bg-teal-900/30 p-1.5 rounded-lg">
                    <Ionicons name="scan-outline" size={16} color="#0D9488" />
                  </View>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-2">
                    Face Recognition Coverage
                  </Text>
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">
                  {dashboardData.aiUsage?.embeddingCoveragePercent || 0}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: '#0D9488',
                    width: `${dashboardData.aiUsage?.embeddingCoveragePercent || 0}%` 
                  }}
                />
              </View>
            </View>

            {/* AI Usage Stats */}
            <View className="flex-row justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded-lg">
                  <Ionicons name="camera-outline" size={16} color="#06B6D4" />
                </View>
                <View className="ml-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    AI Attendance
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-semibold">
                    {dashboardData.aiUsage?.imageAttendanceRatio || 0}% usage
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                  <Ionicons name="trending-up-outline" size={16} color="#10B981" />
                </View>
                <View className="ml-2">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Weekly Attendance
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-semibold">
                    {dashboardData.trends?.attendanceLast7Days || 0} records
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Insight */}
            <View className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                  <Text className="text-gray-600 dark:text-gray-400 text-xs ml-1">
                    AI Insight:
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 text-xs ml-1 flex-1" numberOfLines={1}>
                    {dashboardData.aiUsage?.embeddingCoveragePercent > 70 
                      ? "Good facial recognition coverage" 
                      : "Consider updating student photos"}
                  </Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={14} color="#94A3B8" />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recent Activity Section */}
      {dashboardData && dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
        <View className="px-6 mt-6 mb-8">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-5 bg-blue-500 rounded-full mr-2" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Recent Activity
            </Text>
            <TouchableOpacity className="ml-auto">
              <Text className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            {dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
              <View key={index} className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <View className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                  <Ionicons name="notifications-outline" size={16} color="#6B7280" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                    {activity.title}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {activity.time}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color="#94A3B8" />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bottom Padding */}
      <View className="h-4" />
    </ScrollView>
  );
}