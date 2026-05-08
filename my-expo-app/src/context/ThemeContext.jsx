import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export function ThemeProvider({ children }) {
  // NativeWind hook - note: useColorScheme returns the current scheme
  const { colorScheme, setColorScheme } = useColorScheme();

  const [themeMode, setThemeMode] = useState(THEMES.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Sync when system theme changes (for SYSTEM mode)
  useEffect(() => {
    if (themeMode === THEMES.SYSTEM && colorScheme) {
      // System theme changed, but we don't need to do anything
      // The actualTheme will automatically update
      console.log("System theme changed:", colorScheme);
    }
  }, [colorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("app_theme");

      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        applyTheme(savedTheme);
      } else {
        applyTheme(THEMES.SYSTEM);
      }
    } catch (error) {
      console.log("Theme load error:", error);
      applyTheme(THEMES.SYSTEM);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = async (mode) => {
    console.log("Applying theme:", mode);
    setThemeMode(mode);

    if (mode === THEMES.SYSTEM) {
      // Set to system - NativeWind will handle it
      if (setColorScheme) {
        setColorScheme("system");
      }
    } else {
      // Force light or dark
      if (setColorScheme) {
        setColorScheme(mode);
      }
    }

    await AsyncStorage.setItem("app_theme", mode);
  };

  const setTheme = (mode) => {
    if (Object.values(THEMES).includes(mode)) {
      applyTheme(mode);
    }
  };

  const toggleTheme = () => {
    if (themeMode === THEMES.LIGHT) {
      applyTheme(THEMES.DARK);
    } else if (themeMode === THEMES.DARK) {
      applyTheme(THEMES.SYSTEM);
    } else {
      applyTheme(THEMES.LIGHT);
    }
  };

  // Get actual theme for UI decisions
  const actualTheme = themeMode === THEMES.SYSTEM ? colorScheme : themeMode;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        actualTheme,
        isDark: actualTheme === "dark",
        isLoading,
        toggleTheme,
        setTheme,
        THEMES, // Expose THEMES for convenience
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};