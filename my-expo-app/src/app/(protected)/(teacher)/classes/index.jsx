import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/classes");
      console.log("Classes Response:", res.data);
      
      // ✅ FIXED LINE - accessing res.data.data
      setClasses(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCourseIcon = (courseName) => {
    const icons = {
      'Mathematics': 'calculator-outline',
      'Physics': 'flask-outline',
      'Chemistry': 'beaker-outline',
      'Biology': 'leaf-outline',
      'Computer Science': 'desktop-outline',
      'English': 'book-outline',
      'History': 'time-outline',
      'Geography': 'globe-outline',
      'default': 'school-outline'
    };
    return icons[courseName] || icons.default;
  };

  const getStatsCount = (students) => {
    return students?.length || 0;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-light-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
          Loading your classes...
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
      
      {/* Header Section */}
      <View className="bg-light-primary dark:bg-dark-primary pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">
              My Classes
            </Text>
            <Text className="text-white/80 text-base mt-1">
              {classes.length} {classes.length === 1 ? 'Class' : 'Classes'} Assigned
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Classes List */}
      <View className="px-6 pt-6 pb-8">
        {classes.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-24 h-24 rounded-full bg-light-surfaceMuted dark:bg-dark-surfaceMuted items-center justify-center mb-4">
              <Ionicons name="school-outline" size={48} color="#94A3B8" />
            </View>
            <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-semibold text-center">
              No Classes Assigned
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-2">
              You haven't been assigned to any classes yet.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {classes.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() =>
                  router.push(`(protected)/attendance/${item._id}`)
                }
                activeOpacity={0.7}
                className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-card overflow-hidden"
              >
                {/* Course Header */}
                <View className="p-5">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 items-center justify-center mr-4">
                        <Ionicons 
                          name={getCourseIcon(item.course_name)} 
                          size={24} 
                          color="#0D9488" 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-bold">
                          {item.course_name}
                        </Text>
                        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-0.5">
                          {item.semester || 'Semester'} • {item.section || 'Section A'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
                  </View>

                  {/* Stats Row */}
                  <View className="flex-row mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                    <View className="flex-1 flex-row items-center">
                      <Ionicons name="people-outline" size={16} color="#64748B" />
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-1">
                        {getStatsCount(item.students)} Students
                      </Text>
                    </View>
                    <View className="flex-1 flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#64748B" />
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-1">
                        {item.schedule || 'Schedule TBD'}
                      </Text>
                    </View>
                    <View className="flex-1 flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#64748B" />
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs ml-1">
                        {item.duration || '2 hours'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons (Optional - Quick Actions) */}
                <View className="flex-row border-t border-light-border dark:border-dark-border bg-light-surfaceMuted/50 dark:bg-dark-surfaceMuted/50">
                  <TouchableOpacity 
                    className="flex-1 py-3 flex-row items-center justify-center"
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`(protected)/attendance/${item._id}`);
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#0D9488" />
                    <Text className="text-light-primary dark:text-dark-primary text-sm font-medium ml-2">
                      Mark Attendance
                    </Text>
                  </TouchableOpacity>
                  
                  <View className="w-px h-8 bg-light-border dark:border-dark-border self-center" />
                  
                  <TouchableOpacity 
                    className="flex-1 py-3 flex-row items-center justify-center"
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/attendance/${item._id}/history`);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={18} color="#64748B" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium ml-2">
                      View Reports
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Space for Safe Area */}
      <View className="h-4" />
    </ScrollView>
  );
}