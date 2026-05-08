import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { useTheme, THEMES } from "../context/ThemeContext";

export default function ThemeToggle({ showAsModal = false, onClose }) {
  const { themeMode, setTheme, isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const themeOptions = [
    {
      id: THEMES.LIGHT,
      name: "Light Mode",
      icon: "sunny-outline",
      description: "Bright and clean interface"
    },
    {
      id: THEMES.DARK,
      name: "Dark Mode",
      icon: "moon-outline",
      description: "Easy on the eyes at night"
    },
    {
      id: THEMES.SYSTEM,
      name: "System Default",
      icon: "phone-portrait-outline",
      description: "Follows device settings"
    }
  ];

  const ThemeSelectorContent = () => (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-light-textPrimary dark:text-dark-textPrimary text-xl font-bold">
          Theme Preference
        </Text>
        {showAsModal && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDark ? "#F1F5F9" : "#1E293B"} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-4">
        Choose how you want the app to look
      </Text>

      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => {
            setTheme(option.id);
            if (!showAsModal) setShowModal(false);
            if (onClose && showAsModal) onClose();
          }}
          activeOpacity={0.7}
          className={`flex-row items-center p-4 rounded-xl border-2 ${
            themeMode === option.id
              ? "border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10"
              : "border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
          }`}
        >
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            themeMode === option.id
              ? "bg-light-primary dark:bg-dark-primary"
              : "bg-light-surfaceMuted dark:bg-dark-surfaceMuted"
          }`}>
            <Ionicons 
              name={option.icon} 
              size={24} 
              color={themeMode === option.id ? "white" : (isDark ? "#CBD5E1" : "#64748B")} 
            />
          </View>
          <View className="flex-1">
            <Text className={`text-base font-semibold ${
              themeMode === option.id
                ? "text-light-primary dark:text-dark-primary"
                : "text-light-textPrimary dark:text-dark-textPrimary"
            }`}>
              {option.name}
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-0.5">
              {option.description}
            </Text>
          </View>
          {themeMode === option.id && (
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
          )}
        </TouchableOpacity>
      ))}

      <View className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center">
          Current: {themeMode === THEMES.LIGHT ? "Light" : themeMode === THEMES.DARK ? "Dark" : "System"} Mode
        </Text>
      </View>
    </View>
  );

  if (showAsModal) {
    return <ThemeSelectorContent />;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="flex-row items-center px-4 py-3"
        activeOpacity={0.7}
      >
        <Ionicons name="color-palette-outline" size={22} color={isDark ? "#CBD5E1" : "#64748B"} />
        <Text className="flex-1 text-light-textPrimary dark:text-dark-textPrimary ml-3">
          Theme
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mr-2">
          {themeMode === THEMES.LIGHT ? "Light" : themeMode === THEMES.DARK ? "Dark" : "System"}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={isDark ? "#CBD5E1" : "#64748B"} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowModal(false)}
        >
          <Pressable 
            className="bg-light-surface dark:bg-dark-surface rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <ThemeSelectorContent />
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="mt-6 py-3 rounded-xl bg-light-surfaceMuted dark:bg-dark-surfaceMuted"
            >
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}