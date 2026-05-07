import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';

export default function TeacherHome() {
  // Quick stats data (replace with real data from API later)
  const stats = [
    { label: "Total Classes", value: "4", icon: "book-outline", color: "#0D9488" },
    { label: "Today's Classes", value: "2", icon: "today-outline", color: "#1D4ED8" },
    { label: "Total Students", value: "128", icon: "people-outline", color: "#22D3EE" },
    { label: "Attendance Rate", value: "94%", icon: "stats-chart-outline", color: "#10B981" },
  ];

  const quickActions = [
    { 
      title: "My Classes", 
      description: "View and manage your classes", 
      icon: "book-outline", 
      route: "/(protected)/(teacher)/classes",
      color: "#0D9488"
    },
    { 
      title: "Today's Attendance", 
      description: "Mark attendance for today", 
      icon: "calendar-outline", 
      route: "/(protected)/attendance",
      color: "#1D4ED8"
    },
    { 
      title: "Reports", 
      description: "View attendance reports", 
      icon: "document-text-outline", 
      route: "/(protected)/attendance/reports",
      color: "#F59E0B"
    },
    { 
      title: "Recent Activity", 
      description: "Check recent attendance records", 
      icon: "time-outline", 
      route: "/(protected)/attendance/history",
      color: "#8B5CF6"
    },
  ];

  return (
    <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
      <StatusBar style="auto" />
      
      {/* Header Section */}
      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">
              Welcome back, 👋
            </Text>
            <Text className="text-white/80 text-base mt-1">
              Teacher Dashboard
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="person-outline" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 -mt-8">
        <View className="flex-row flex-wrap gap-4">
          {stats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-1 min-w-[40%]"
              style={{ minWidth: '45%' }}
            >
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
                    {stat.label}
                  </Text>
                  <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-1">
                    {stat.value}
                  </Text>
                </View>
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions Section */}
      <View className="px-6 mt-8">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold mb-4">
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
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View className="flex-1">
                <Text className="text-light-textPrimary dark:text-dark-textPrimary text-base font-semibold">
                  {action.title}
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-0.5">
                  {action.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity Section */}
      <View className="px-6 mt-8 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold">
            Recent Activity
          </Text>
          <TouchableOpacity>
            <Text className="text-light-primary dark:text-dark-primary text-sm font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
          <View className="space-y-3">
            {[1, 2, 3].map((item) => (
              <View key={item} className="flex-row items-center pb-3 border-b border-light-border dark:border-dark-border last:border-0">
                <View className="w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#0D9488" />
                </View>
                <View className="flex-1">
                  <Text className="text-light-textPrimary dark:text-dark-textPrimary text-sm font-medium">
                    Attendance marked for Class {item}
                  </Text>
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-0.5">
                    {item} hour{item !== 1 ? 's' : ''} ago
                  </Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={16} color="#94A3B8" />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Space for Safe Area */}
      <View className="h-4" />
    </ScrollView>
  );
}