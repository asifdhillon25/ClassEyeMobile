import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect } from "react";
import api from "../../../../services/api";
import { Ionicons } from '@expo/vector-icons';

export default function ManualAttendance() {
  const params = useLocalSearchParams();
  const { classId } = params;
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [className, setClassName] = useState("");
  
  // For returning from review screen (AI mode)
  const [attendanceId, setAttendanceId] = useState(params.attendanceId);
  const [returnToReview, setReturnToReview] = useState(params.returnToReview === "true");
  const [preMarkedStudents, setPreMarkedStudents] = useState(() => {
    try {
      return JSON.parse(params.preMarkedStudents || "[]");
    } catch {
      return [];
    }
  });

  // ---------------- FETCH STUDENTS ----------------
  useEffect(() => {
    fetchStudents();
  }, []);

  // Merge pre-marked students when they arrive (from AI review)
  useEffect(() => {
    if (preMarkedStudents.length > 0 && records.length > 0) {
      // Merge pre-marked students (from AI) with current records
      const mergedRecords = records.map(record => {
        const preMarked = preMarkedStudents.find(p => p.studentId === record.studentId);
        if (preMarked && preMarked.status === "present") {
          return { ...record, status: "present" };
        }
        return record;
      });
      setRecords(mergedRecords);
    }
  }, [preMarkedStudents]);

  const fetchStudents = async () => {
    try {
      let allStudents = [];
      let courseName = "";
      
      // Check if we have an attendanceId (coming from AI mode)
      if (attendanceId && returnToReview) {
        // Fetch current attendance data to get all students
        const res = await api.get(`/attendance/class/${classId}/${new Date().toISOString().split('T')[0]}`);
        const attendanceData = res.data?.data;
        
        if (attendanceData && attendanceData.records) {
          allStudents = attendanceData.records.map(record => ({
            studentId: String(record.student._id),
            name: record.student.name || "Unknown",
            roll_no: record.student.roll_no || "-",
            status: record.status || "absent"
          }));
          courseName = attendanceData.class_info?.course_name || "Manual Attendance";
        } else {
          // Fallback to fetching from class
          const classRes = await api.get(`/classes/${classId}`);
          const classData = classRes.data?.data;
          courseName = classData?.course_name || "Manual Attendance";
          allStudents = classData?.students || [];
        }
      } else {
        // Normal manual mode - fetch from class
        const res = await api.get(`/classes/${classId}`);
        const classData = res.data?.data;
        courseName = classData?.course_name || "Manual Attendance";
        allStudents = classData?.students || [];
      }
      
      setClassName(courseName);

      const formatted = allStudents
        .filter(s => s?._id || s?.studentId)
        .map((s) => ({
          studentId: String(s._id || s.studentId),
          name: s?.name || "Unknown",
          roll_no: s?.roll_no || "-",
          status: s?.status || "absent"
        }));

      setRecords(formatted);

    } catch (error) {
      console.log("FETCH ERROR:", error);
      Alert.alert("Error", "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOGGLE ----------------
  const toggleAttendance = (studentId) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? {
              ...item,
              status: item.status === "present" ? "absent" : "present"
            }
          : item
      )
    );
  };

  // ---------------- SAVE ----------------
  const saveAttendance = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      const user = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(user);
      const teacherId = parsedUser?._id;

      const cleanedRecords = records
        .filter(r => r.studentId)
        .map((item) => ({
          studentId: String(item.studentId),
          status: item.status
        }));

      if (!cleanedRecords.length) {
        Alert.alert("Error", "No valid attendance records");
        return;
      }

      // If we have an attendanceId (coming from AI mode), use PATCH to update individual students
      if (attendanceId && returnToReview) {
        console.log("Updating existing attendance:", attendanceId);
        
        // Update each student individually using the patch endpoint
        let updatePromises = cleanedRecords.map(record => 
          api.patch(`/attendance/${attendanceId}/student/${record.studentId}`, {
            status: record.status,
            marked_by: "manual"
          }).catch(err => console.log(`Error updating student ${record.studentId}:`, err))
        );
        
        await Promise.all(updatePromises);
        
        // Return to review screen with updated data
        router.push({
          pathname: `/attendance/${classId}/review`,
          params: {
            classId,
            attendanceId: attendanceId,
            data: JSON.stringify(cleanedRecords)
          }
        });
        return;
      }

      // Normal manual mode - create new attendance
      console.log("Creating new manual attendance");
      const res = await api.post(`/attendance/manual/${classId}`, {
        teacherId,
        records: cleanedRecords
      });

      const newAttendanceId = res.data?.data?._id;

      if (!newAttendanceId) {
        Alert.alert("Error", "Attendance ID not returned");
        return;
      }

      // Move to review screen
      router.push({
        pathname: `/attendance/${classId}/review`,
        params: {
          classId,
          attendanceId: newAttendanceId,
          data: JSON.stringify(cleanedRecords)
        }
      });

    } catch (error) {
      console.log("API ERROR:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const attendancePercentage = records.length > 0 
    ? Math.round((presentCount / records.length) * 100) 
    : 0;

  // ---------------- UI ----------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: returnToReview ? `Mark Absent: ${className}` : (className || "Manual Attendance"),
          headerShown: true
        }} 
      />
      
      <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
        
        {/* Info Banner for Return Mode */}
        {returnToReview && (
          <View className="bg-light-accent/10 dark:bg-dark-accent/10 pt-4 pb-4 px-6">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={20} color="#1D4ED8" />
              <Text className="text-light-accent dark:text-dark-accent text-sm ml-2 flex-1">
                AI-detected students are already marked present. Tap absent students to mark them present.
              </Text>
            </View>
          </View>
        )}
        
        {/* Stats Banner */}
        <View className="bg-light-primary dark:bg-dark-primary pt-4 pb-6 px-6 rounded-b-3xl shadow-lg">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/80 text-sm">Total Students</Text>
              <Text className="text-white text-2xl font-bold">{records.length}</Text>
            </View>
            <View className="w-px h-12 bg-white/30" />
            <View>
              <Text className="text-white/80 text-sm">Present</Text>
              <Text className="text-white text-2xl font-bold">{presentCount}</Text>
            </View>
            <View className="w-px h-12 bg-white/30" />
            <View>
              <Text className="text-white/80 text-sm">Attendance</Text>
              <Text className="text-white text-2xl font-bold">{attendancePercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Students List */}
        <View className="px-4 pt-6 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold">
              Student List
            </Text>
            <TouchableOpacity 
              onPress={() => {
                // Only mark absent students as present (don't override existing present)
                const newRecords = records.map(r => ({
                  ...r,
                  status: r.status === "absent" ? "present" : r.status
                }));
                setRecords(newRecords);
              }}
              className="flex-row items-center"
            >
              <Ionicons name="checkbox-outline" size={18} color="#0D9488" />
              <Text className="text-light-primary dark:text-dark-primary text-sm ml-1">
                Mark All Absent
              </Text>
            </TouchableOpacity>
          </View>

          {records.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="people-outline" size={64} color="#94A3B8" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-4">
                No students found in this class
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {records.map((item, index) => (
                <TouchableOpacity
                  key={item.studentId}
                  onPress={() => toggleAttendance(item.studentId)}
                  activeOpacity={0.7}
                  className={`bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card flex-row justify-between items-center border-l-4 ${
                    item.status === "present" 
                      ? "border-l-light-success dark:border-l-dark-success" 
                      : "border-l-light-error dark:border-l-dark-error"
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      item.status === "present" 
                        ? "bg-light-success/10 dark:bg-dark-success/10" 
                        : "bg-light-error/10 dark:bg-dark-error/10"
                    }`}>
                      <Text className={`font-bold ${
                        item.status === "present" 
                          ? "text-light-success dark:text-dark-success" 
                          : "text-light-error dark:text-dark-error"
                      }`}>
                        {item.roll_no?.slice(-2) || index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold text-base">
                        {item.name}
                      </Text>
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
                        Roll No: {item.roll_no}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className={`px-3 py-1.5 rounded-full ${
                      item.status === "present" 
                        ? "bg-light-success/15 dark:bg-dark-success/15" 
                        : "bg-light-error/15 dark:bg-dark-error/15"
                    }`}>
                      <Text className={`font-bold text-sm ${
                        item.status === "present" 
                          ? "text-light-success dark:text-dark-success" 
                          : "text-light-error dark:text-dark-error"
                      }`}>
                        {item.status === "present" ? "PRESENT" : "ABSENT"}
                      </Text>
                    </View>
                    <Ionicons 
                      name={item.status === "present" ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={item.status === "present" ? "#10B981" : "#EF4444"} 
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        <View className="px-4 pb-8 pt-4">
          <TouchableOpacity
            onPress={saveAttendance}
            disabled={saving}
            className={`bg-light-primary dark:bg-dark-primary py-4 rounded-xl shadow-card flex-row items-center justify-center ${
              saving ? 'opacity-70' : ''
            }`}
          >
            {saving ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">
                  {returnToReview ? "Updating..." : "Saving..."}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  {returnToReview ? "Update & Return to Review" : "Save & Continue to Review"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center mt-3">
            Tap on student cards to toggle attendance status
          </Text>
          
          {returnToReview && (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mt-3 py-2"
            >
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center">
                ← Back to Review
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </>
  );
}