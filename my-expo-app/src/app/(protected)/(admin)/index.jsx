import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    id: ""
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Get admin info from storage
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setAdminInfo({
          name: userData.name || "Administrator",
          email: userData.email || "",
          id: userData._id || userData.id || ""
        });
      }

      // Fetch dashboard overview (admin-specific stats)
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

  // Admin stats from API
  const adminStats = dashboardData ? [
    { 
      label: "Total Students", 
      value: dashboardData.kpis.totalStudents?.toString() || "0", 
      icon: "people-outline", 
      color: "#0D9488",
      change: dashboardData.trends?.newStudentsThisMonth || 0
    },
    { 
      label: "Total Teachers", 
      value: dashboardData.kpis.totalTeachers?.toString() || "0", 
      icon: "person-outline", 
      color: "#1D4ED8",
      change: dashboardData.trends?.newTeachersThisMonth || 0
    },
    { 
      label: "Active Classes", 
      value: dashboardData.kpis.activeClasses?.toString() || "0", 
      icon: "book-outline", 
      color: "#22D3EE",
      change: null
    },
    { 
      label: "Today's Attendance", 
      value: `${dashboardData.kpis.attendanceTodayPercent || 0}%`, 
      icon: "stats-chart-outline", 
      color: "#10B981",
      change: null
    },
  ] : [];

  // Risk metrics
  const riskMetrics = dashboardData ? [
    {
      label: "At Risk Students",
      value: dashboardData.risks.atRiskStudents || 0,
      description: "Below 75% attendance",
      icon: "warning-outline",
      color: "#F59E0B"
    },
    {
      label: "Inactive Students",
      value: dashboardData.risks.inactiveStudents || 0,
      description: "No attendance in 14 days",
      icon: "person-remove-outline",
      color: "#EF4444"
    },
    {
      label: "Classes Pending",
      value: dashboardData.risks.classesWithoutAttendanceThisWeek || 0,
      description: "No attendance this week",
      icon: "calendar-outline",
      color: "#8B5CF6"
    }
  ] : [];

  const quickActions = [
    { 
      title: "Manage Students", 
      description: "Add, edit, or remove students", 
      icon: "people-outline", 
      route: "/(protected)/admin/students",
      color: "#0D9488"
    },
    { 
      title: "Manage Teachers", 
      description: "Manage teacher accounts", 
      icon: "person-outline", 
      route: "/(protected)/admin/teachers",
      color: "#1D4ED8"
    },
    { 
      title: "Manage Classes", 
      description: "Create and manage classes", 
      icon: "book-outline", 
      route: "/(protected)/admin/classes",
      color: "#22D3EE"
    },
    { 
      title: "System Reports", 
      description: "View system-wide reports", 
      icon: "document-text-outline", 
      route: "/(protected)/admin/reports",
      color: "#F59E0B"
    },
    { 
      title: "Attendance Overview", 
      description: "Monitor attendance across all classes", 
      icon: "calendar-outline", 
      route: "/(protected)/admin/attendance",
      color: "#8B5CF6"
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

  return (
    <ScrollView 
      className="flex-1 bg-light-background dark:bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar style="auto" />
      
      {/* Header Section with Admin Profile */}
      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">
              Welcome, {adminInfo.name.split(' ')[0]} 👋
            </Text>
            <Text className="text-white/80 text-base mt-1">
              Admin Dashboard
            </Text>
            <Text className="text-white/60 text-sm mt-0.5">
              {adminInfo.email}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/settings")}
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 -mt-8">
        <View className="flex-row flex-wrap gap-3">
          {adminStats.map((stat, index) => (
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
                  <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-1">
                    {stat.value}
                  </Text>
                  {stat.change !== null && stat.change > 0 && (
                    <Text className="text-light-success dark:text-dark-success text-xs mt-1">
                      +{stat.change} this month
                    </Text>
                  )}
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

      {/* Risk Alerts Section */}
      {dashboardData && (dashboardData.risks.atRiskStudents > 0 || dashboardData.risks.inactiveStudents > 0) && (
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold ml-2">
              Risk Alerts
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {riskMetrics.map((metric, index) => (
              metric.value > 0 && (
                <View 
                  key={index}
                  className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-3 shadow-card"
                  style={{ minWidth: '30%' }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name={metric.icon} size={14} color={metric.color} />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-1">
                      {metric.label}
                    </Text>
                  </View>
                  <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold">
                    {metric.value}
                  </Text>
                  <Text className="text-light-textMuted dark:text-dark-textMuted text-[10px] mt-1">
                    {metric.description}
                  </Text>
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* AI & System Health */}
      {dashboardData && (
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="hardware-chip-outline" size={18} color="#0D9488" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold ml-2">
              System Health
            </Text>
          </View>
          <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="scan-outline" size={16} color="#0D9488" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-2">
                  Face Recognition Coverage
                </Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                {dashboardData.aiUsage?.embeddingCoveragePercent || 0}%
              </Text>
            </View>
            <View className="h-px bg-light-border dark:bg-dark-border my-2" />
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="camera-outline" size={16} color="#22D3EE" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-2">
                  AI Attendance Usage
                </Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                {dashboardData.aiUsage?.imageAttendanceRatio || 0}%
              </Text>
            </View>
            <View className="h-px bg-light-border dark:bg-dark-border my-2" />
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="trending-up-outline" size={16} color="#10B981" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-2">
                  Attendance This Week
                </Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold">
                {dashboardData.trends?.attendanceLast7Days || 0} records
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions Section */}
      <View className="px-6 mt-6">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-3">
          Admin Actions
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

      {/* System Status */}
      <View className="px-6 mt-6 mb-8">
        <View className="bg-light-success/5 dark:bg-dark-success/5 rounded-xl p-4 border border-light-success/20 dark:border-dark-success/20">
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
            <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold ml-2">
              System Status
            </Text>
          </View>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
            All systems operational • Last backup: Today at 2:00 AM • API running normally
          </Text>
        </View>
      </View>

      {/* Bottom Space */}
      <View className="h-4" />
    </ScrollView>
  );
}