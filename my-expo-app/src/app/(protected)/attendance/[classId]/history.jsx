import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import api from "../../../../services/api";
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceHistory() {
  const { classId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [className, setClassName] = useState("");
  const [stats, setStats] = useState({
    total_records: 0,
    total_present: 0,
    total_students: 0,
    average_attendance: 0
  });

  const fetchHistory = async () => {
    try {
      // Fetch class details
      const classRes = await api.get(`/classes/${classId}`);
      setClassName(classRes.data?.data?.course_name || "Attendance History");

      // Fetch attendance history - Using the correct endpoint from your backend
      const historyRes = await api.get(`/attendance/history/class/${classId}`);
      if (historyRes.data.success) {
        setHistory(historyRes.data.data.records || []);
        setStats(historyRes.data.data.stats || {
          total_records: 0,
          total_present: 0,
          total_students: 0,
          average_attendance: 0
        });
      }
    } catch (error) {
      console.log("Error fetching history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (classId && classId !== 'history') {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [classId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  // Check if classId is valid (not a string like 'history')
  if (!classId || classId === 'history') {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mt-4">
          Invalid Class
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-2 px-8">
          Please select a class from your classes list first.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(protected)/(teacher)/classes")}
          className="mt-6 bg-light-primary py-3 px-6 rounded-xl"
        >
          <Text className="text-white font-semibold">View My Classes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `History: ${className}`,
          headerShown: true
        }} 
      />
      
      <ScrollView 
        className="flex-1 bg-light-background dark:bg-dark-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View className="bg-light-primary dark:bg-dark-primary pt-6 pb-6 px-6 rounded-b-3xl shadow-lg">
          <Text className="text-white text-lg font-bold mb-3">Summary</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white/80 text-xs">Total Sessions</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {stats.total_records}
              </Text>
            </View>
            <View className="w-px h-10 bg-white/30" />
            <View className="items-center">
              <Text className="text-white/80 text-xs">Avg Attendance</Text>
              <Text 
                className="text-2xl font-bold mt-1"
                style={{ color: getAttendanceColor(parseFloat(stats.average_attendance)) }}
              >
                {stats.average_attendance}%
              </Text>
            </View>
            <View className="w-px h-10 bg-white/30" />
            <View className="items-center">
              <Text className="text-white/80 text-xs">Total Present</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {stats.total_present}
              </Text>
            </View>
          </View>
        </View>

        {/* History List */}
        <View className="px-5 pt-6 pb-8">
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold mb-4">
            Attendance Records
          </Text>

          {history.length === 0 ? (
            <View className="items-center justify-center py-12 bg-light-surface dark:bg-dark-surface rounded-xl">
              <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-4">
                No attendance records found
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {history.map((record, index) => (
                <TouchableOpacity
                  key={record._id || index}
                  onPress={() => router.push(`/attendance/${classId}/${record.date?.split('T')[0]}`)}
                  className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 shadow-card"
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold text-base">
                        {formatDate(record.date)}
                      </Text>
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                        {record.method === 'image' ? '🤖 AI Detected' : record.method === 'manual' ? '✍️ Manual' : '🔄 Mixed'}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className={`px-3 py-1 rounded-full ${record.is_finalized ? 'bg-light-success/15' : 'bg-light-warning/15'}`}>
                        <Text className={`text-xs font-semibold ${record.is_finalized ? 'text-light-success' : 'text-light-warning'}`}>
                          {record.is_finalized ? 'FINALIZED' : 'DRAFT'}
                        </Text>
                      </View>
                      <Text className="text-light-textPrimary dark:text-dark-textPrimary font-bold mt-2">
                        {record.present_count}/{record.total_students} Present
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}