import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";  // ✅ Added ActivityIndicator
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect } from "react";
import api from "../../../../services/api";
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceOptions() {
  const { classId } = useLocalSearchParams();
  const [className, setClassName] = useState("");
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      const classData = res.data.data;
      setClassName(classData.course_name);
      setClassDetails(classData);
    } catch (error) {
      console.log("Error fetching class details:", error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceModes = [
    {
      id: "manual",
      title: "Manual Attendance",
      description: "Mark attendance manually by tapping on student names",
      icon: "create-outline",
      color: "#0D9488",
      bgColor: "bg-light-primary dark:bg-dark-primary",
      route: `/attendance/${classId}/manual`
    },
    {
      id: "auto",
      title: "AI Auto Attendance",
      description: "Upload classroom image for automatic face recognition",
      icon: "camera-outline",
      color: "#22D3EE",
      bgColor: "bg-cyan-500",
      route: `/attendance/${classId}/auto`
    },
    {
      id: "history",
      title: "Attendance History",
      description: "View past attendance records and statistics",
      icon: "time-outline",
      color: "#8B5CF6",
      bgColor: "bg-purple-500",
      route: `/attendance/${classId}/history`
    },
    {
      id: "report",
      title: "Attendance Report",
      description: "Generate and export attendance reports",
      icon: "document-text-outline",
      color: "#F59E0B",
      bgColor: "bg-amber-500",
      route: `/attendance/${classId}/report`
    }
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading class details...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: className ? `${className}` : "Attendance",
          headerShown: true
        }} 
      />
      
      <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
        {/* Class Info Banner */}
        <View className="bg-light-primary dark:bg-dark-primary pt-6 pb-8 px-6 rounded-b-3xl shadow-lg">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
              <Ionicons name="school-outline" size={40} color="white" />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              {className || "Class Attendance"}
            </Text>
            {classDetails && (
              <View className="flex-row mt-2 space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={16} color="white" />
                  <Text className="text-white/90 text-sm ml-1">
                    {classDetails.students?.length || 0} Students
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text className="text-white/90 text-sm ml-1">
                    {classDetails.schedule || "Schedule TBD"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Modes Grid */}
        <View className="px-6 pt-8 pb-12">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-4">
            Choose Attendance Mode
          </Text>
          
          <View className="space-y-4">
            {attendanceModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                onPress={() => router.push(mode.route)}
                activeOpacity={0.8}
                className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-card overflow-hidden"
              >
                <View className="flex-row p-5">
                  <View 
                    className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${mode.color}15` }}
                  >
                    <Ionicons name={mode.icon} size={28} color={mode.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-light-textPrimary dark:text-dark-textPrimary text-base font-semibold mb-1">
                      {mode.title}
                    </Text>
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
                      {mode.description}
                    </Text>
                  </View>
                  <View className="justify-center">
                    <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Summary Card */}
          <View className="mt-8 p-5 bg-light-primary/5 dark:bg-dark-primary/5 rounded-xl border border-light-primary/20 dark:border-dark-primary/20">
            <View className="flex-row items-center mb-3">
              <Ionicons name="today-outline" size={20} color="#0D9488" />
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold ml-2">
                Today's Summary
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                  0
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                  Present
                </Text>
              </View>
              <View className="w-px bg-light-border dark:border-dark-border" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-light-textSecondary dark:text-dark-textSecondary">
                  0
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                  Absent
                </Text>
              </View>
              <View className="w-px bg-light-border dark:border-dark-border" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-light-success dark:text-dark-success">
                  0%
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                  Attendance
                </Text>
              </View>
            </View>
            <TouchableOpacity className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
              <Text className="text-light-primary dark:text-dark-primary text-sm text-center font-medium">
                View Full Report →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}