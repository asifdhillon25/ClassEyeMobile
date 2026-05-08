import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

export default function Settings() {
  const { isDark, themeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setUserRole(userData.role || "teacher");
        setUserName(userData.name || "User");
        setUserEmail(userData.email || "user@example.com");
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            router.replace("/login");
          }
        }
      ]
    );
  };

  // Get role-specific settings sections
  const getRoleSpecificSections = () => {
    const commonSections = [
      {
        title: "Appearance",
        icon: "color-palette-outline",
        items: [
          {
            type: "custom",
            component: <ThemeToggle key="theme-toggle" />
          }
        ]
      },
      {
        title: "Preferences",
        icon: "settings-outline",
        items: [
          {
            label: "Push Notifications",
            icon: "notifications-outline",
            type: "switch",
            value: notifications,
            onValueChange: setNotifications
          },
          {
            label: "Auto Sync Data",
            icon: "sync-outline",
            type: "switch",
            value: autoSync,
            onValueChange: setAutoSync
          },
          {
            label: "Language",
            icon: "language-outline",
            type: "select",
            value: "English",
            onPress: () => Alert.alert("Coming Soon", "Language selection will be available soon")
          }
        ]
      },
      {
        title: "Data Management",
        icon: "database-outline",
        items: [
          {
            label: "Clear Cache",
            icon: "trash-outline",
            type: "button",
            onPress: () => Alert.alert("Success", "Cache cleared successfully"),
            danger: false
          },
          {
            label: "Export Data",
            icon: "download-outline",
            type: "button",
            onPress: () => Alert.alert("Coming Soon", "Export feature will be available soon"),
            danger: false
          }
        ]
      }
    ];

    // Role-specific sections
    if (userRole === "admin") {
      commonSections.push({
        title: "Administration",
        icon: "shield-outline",
        items: [
          {
            label: "Manage Users",
            icon: "people-outline",
            type: "link",
            onPress: () => Alert.alert("User Management", "Manage teachers and students")
          },
          {
            label: "System Settings",
            icon: "server-outline",
            type: "link",
            onPress: () => Alert.alert("System Settings", "Configure system parameters")
          },
          {
            label: "Backup Database",
            icon: "cloud-upload-outline",
            type: "button",
            onPress: () => Alert.alert("Backup", "Database backup initiated")
          }
        ]
      });
    }

    if (userRole === "student") {
      commonSections.push({
        title: "Academic",
        icon: "school-outline",
        items: [
          {
            label: "My Attendance",
            icon: "calendar-outline",
            type: "link",
            onPress: () => router.push("/(protected)/student/attendance")
          },
          {
            label: "Download Reports",
            icon: "document-download-outline",
            type: "button",
            onPress: () => Alert.alert("Reports", "Download your attendance report")
          }
        ]
      });
    }

    // Support section for all roles
    commonSections.push({
      title: "Support",
      icon: "help-circle-outline",
      items: [
        {
          label: "Privacy Policy",
          icon: "document-text-outline",
          type: "link",
          onPress: () => Alert.alert("Privacy Policy", "Your data is protected...")
        },
        {
          label: "Terms of Service",
          icon: "newspaper-outline",
          type: "link",
          onPress: () => Alert.alert("Terms of Service", "Terms and conditions...")
        },
        {
          label: "About",
          icon: "information-circle-outline",
          type: "link",
          onPress: () => Alert.alert("About", "Face Recognition Attendance System v1.0.0")
        }
      ]
    });

    // Account section for all roles
    commonSections.push({
      title: "Account",
      icon: "person-outline",
      items: [
        {
          label: "Profile Settings",
          icon: "create-outline",
          type: "link",
          onPress: () => Alert.alert("Profile", "Profile editing coming soon")
        },
        {
          label: "Change Password",
          icon: "key-outline",
          type: "button",
          onPress: () => Alert.alert("Change Password", "Password change feature coming soon")
        },
        {
          label: "Logout",
          icon: "log-out-outline",
          type: "button",
          onPress: handleLogout,
          danger: true
        }
      ]
    });

    return commonSections;
  };

  const settingsSections = getRoleSpecificSections();

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case "admin": return "Administrator";
      case "teacher": return "Teacher";
      case "student": return "Student";
      default: return "User";
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Settings",
          headerShown: true,
          headerBackTitle: "Back"
        }} 
      />
      
      <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
        
        {/* Header Avatar Section */}
        <View className="items-center py-8 bg-light-surface dark:bg-dark-surface rounded-b-3xl shadow-card">
          <View className="w-24 h-24 rounded-full bg-light-primary/20 dark:bg-dark-primary/20 items-center justify-center mb-3">
            <Ionicons name="person-circle-outline" size={60} color="#0D9488" />
          </View>
          <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold">
            {userName}
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-1">
            {userEmail}
          </Text>
          <View className="mt-2 px-3 py-1 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full">
            <Text className="text-light-primary dark:text-dark-primary text-xs font-semibold">
              {getRoleDisplayName()}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6 px-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name={section.icon} size={20} color="#0D9488" />
              <Text className="text-light-textPrimary dark:text-dark-textPrimary text-lg font-semibold ml-2">
                {section.title}
              </Text>
            </View>
            
            <View className="bg-light-surface dark:bg-dark-surface rounded-xl overflow-hidden shadow-card">
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {item.type === "custom" ? (
                    item.component
                  ) : item.type === "switch" ? (
                    <View className="flex-row items-center justify-between px-4 py-3">
                      <View className="flex-row items-center">
                        <Ionicons name={item.icon} size={22} color={isDark ? "#CBD5E1" : "#64748B"} />
                        <Text className="text-light-textPrimary dark:text-dark-textPrimary ml-3">
                          {item.label}
                        </Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        trackColor={{ false: "#767577", true: "#0D9488" }}
                        thumbColor="#f4f3f4"
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={item.onPress}
                      className="flex-row items-center justify-between px-4 py-3"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={item.icon} 
                          size={22} 
                          color={item.danger ? "#EF4444" : (isDark ? "#CBD5E1" : "#64748B")} 
                        />
                        <Text className={`ml-3 ${
                          item.danger 
                            ? "text-light-error dark:text-dark-error" 
                            : "text-light-textPrimary dark:text-dark-textPrimary"
                        }`}>
                          {item.label}
                        </Text>
                      </View>
                      {item.type === "select" && (
                        <View className="flex-row items-center">
                          <Text className="text-light-textSecondary dark:text-dark-textSecondary mr-2">
                            {item.value}
                          </Text>
                          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                        </View>
                      )}
                      {item.type === "link" && (
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  )}
                  {itemIndex < section.items.length - 1 && (
                    <View className="h-px bg-light-border dark:bg-dark-border mx-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Version Info */}
        <View className="items-center py-8">
          <Text className="text-light-textMuted dark:text-dark-textMuted text-xs">
            Version 1.0.0
          </Text>
          <Text className="text-light-textMuted dark:text-dark-textMuted text-xs mt-1">
            © 2024 Face Recognition Attendance System
          </Text>
        </View>

      </ScrollView>
    </>
  );
}