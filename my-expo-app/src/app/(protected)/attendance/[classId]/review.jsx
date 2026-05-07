import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator
} from "react-native";

import {
  useLocalSearchParams,
  router,
  Stack
} from "expo-router";

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../../services/api";
import { Ionicons } from '@expo/vector-icons';

export default function ReviewAttendance() {

  const params = useLocalSearchParams();
  const initialData = JSON.parse(params.data || "[]");
  const attendanceId = params.attendanceId;
  const { classId } = useLocalSearchParams();

  const [records, setRecords] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("");
  const [allStudents, setAllStudents] = useState([]);

  // Fetch class name and all students for manual override
  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      setClassName(res.data?.data?.course_name || "Review Attendance");
      // Store all students to show absent ones
      setAllStudents(res.data?.data?.students || []);
    } catch (error) {
      console.log("Error fetching class:", error);
    }
  };

  const toggleStatus = async (studentId) => {
    // Update locally first for immediate UI feedback
    setRecords(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? {
              ...item,
              status: item.status === "present" ? "absent" : "present"
            }
          : item
      )
    );

    // Optional: Call API to update status immediately
    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user);
      const teacherId = parsed?._id;

      await api.patch(`/attendance/${attendanceId}/student/${studentId}`, {
        status: records.find(r => r.studentId === studentId)?.status === "present" ? "absent" : "present",
        marked_by: "manual"
      });
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  const finalize = async () => {
    try {
      setLoading(true);

      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user);
      const teacherId = parsed?._id;

      await api.post(`/attendance/${attendanceId}/finalize`, {
        teacherId
      });

      Alert.alert(
        "Success", 
        "Attendance Finalized Successfully",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(protected)/(teacher)")
          }
        ]
      );

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to finalize attendance");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to manual page to mark additional students
  const goToManualMarking = () => {
    // Get students who are absent in current records
    const absentStudentIds = records
      .filter(r => r.status === "absent")
      .map(r => r.studentId);
    
    router.push({
      pathname: `/attendance/${classId}/manual`,
      params: {
        attendanceId: attendanceId,
        preMarkedStudents: JSON.stringify(records.filter(r => r.status === "present")),
        returnToReview: "true"
      }
    });
  };

  // Calculate statistics
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const aiDetectedCount = records.filter(r => r.confidence).length;
  const attendancePercentage = records.length > 0 
    ? Math.round((presentCount / records.length) * 100) 
    : 0;

  const isAIMode = records.some(r => r.confidence);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: className ? `Review: ${className}` : "Review Attendance",
          headerShown: true
        }} 
      />
      
      <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
        
        {/* Header Banner */}
        <View className="bg-light-primary dark:bg-dark-primary pt-6 pb-6 px-6 rounded-b-3xl shadow-lg">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/80 text-sm">Attendance Review</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {isAIMode ? "AI Detected" : "Manual Entry"}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-4 py-2">
              <Text className="text-white font-bold text-lg">
                {attendancePercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-5 -mt-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-light-success/15 dark:bg-dark-success/15 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-2">Present</Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-2">
                {presentCount}
              </Text>
            </View>
            
            <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-light-error/15 dark:bg-dark-error/15 items-center justify-center">
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </View>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-2">Absent</Text>
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-2xl font-bold mt-2">
                {absentCount}
              </Text>
            </View>
          </View>

          {/* AI Detection Stats */}
          {isAIMode && (
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-3 shadow-card">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">AI Detected</Text>
                <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold text-lg">
                  {aiDetectedCount}
                </Text>
              </View>
              <View className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-3 shadow-card">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">Needs Review</Text>
                <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold text-lg">
                  {absentCount}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Info Banner */}
        <View className="px-5 mt-6">
          <View className="bg-light-primary/5 dark:bg-dark-primary/5 rounded-xl p-3 border border-light-primary/20 dark:border-dark-primary/20">
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center">
              {isAIMode 
                ? "Tap on any student to toggle status, or use 'Mark More Students' for absent ones"
                : "Review all students and tap to toggle status before finalizing"}
            </Text>
          </View>
        </View>

        {/* Students List */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-4">
            Student List
          </Text>

          {records.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="people-outline" size={64} color="#94A3B8" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-4">
                No student records found
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {records.map((student, index) => (
                <TouchableOpacity
                  key={student.studentId || index}
                  onPress={() => toggleStatus(student.studentId)}
                  activeOpacity={0.7}
                  className={`bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-row justify-between items-center border-l-4 ${
                    student.status === "present" 
                      ? "border-l-light-success dark:border-l-dark-success" 
                      : "border-l-light-error dark:border-l-dark-error"
                  }`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        student.status === "present" 
                          ? "bg-light-success/15 dark:bg-dark-success/15" 
                          : "bg-light-error/15 dark:bg-dark-error/15"
                      }`}>
                        <Text className={`font-bold text-sm ${
                          student.status === "present" 
                            ? "text-light-success dark:text-dark-success" 
                            : "text-light-error dark:text-dark-error"
                        }`}>
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold text-base">
                          {student.name}
                        </Text>
                        {student.confidence && (
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="flash-outline" size={12} color="#22D3EE" />
                            <Text className="text-light-primary dark:text-dark-primary text-xs ml-1">
                              AI Confidence: {Math.round(student.confidence * 100)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className={`px-3 py-1.5 rounded-full mr-2 ${
                      student.status === "present" 
                        ? "bg-light-success/15 dark:bg-dark-success/15" 
                        : "bg-light-error/15 dark:bg-dark-error/15"
                    }`}>
                      <Text className={`font-bold text-xs ${
                        student.status === "present" 
                          ? "text-light-success dark:text-dark-success" 
                          : "text-light-error dark:text-dark-error"
                      }`}>
                        {student.status === "present" ? "PRESENT" : "ABSENT"}
                      </Text>
                    </View>
                    <Ionicons 
                      name={student.status === "present" ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={student.status === "present" ? "#10B981" : "#EF4444"} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="px-5 pb-8 pt-4 space-y-3">
          {/* Mark More Students Button - Only show in AI mode with absent students */}
          {isAIMode && absentCount > 0 && (
            <TouchableOpacity
              onPress={goToManualMarking}
              disabled={loading}
              className="bg-light-accent dark:bg-dark-accent py-4 rounded-xl shadow-card flex-row items-center justify-center"
            >
              <Ionicons name="people-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                Mark More Students ({absentCount} absent)
              </Text>
            </TouchableOpacity>
          )}

          {/* Finalize Button */}
          <TouchableOpacity
            onPress={finalize}
            disabled={loading}
            className={`bg-light-success dark:bg-dark-success py-4 rounded-xl shadow-card flex-row items-center justify-center ${
              loading ? 'opacity-70' : ''
            }`}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">
                  Finalizing...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Finalize & Lock Attendance
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center mt-2">
            ⚠️ Attendance will be locked after finalization
          </Text>
        </View>

      </ScrollView>
    </>
  );
}