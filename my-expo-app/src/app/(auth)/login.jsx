import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setResponse("Please fill all fields");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      setResponse(null);
      setIsError(false);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Response:", res.data);

      const { token, user } = res.data.data;

      // 🔐 SAVE TOKEN
      await AsyncStorage.setItem("token", token);

      // 👤 SAVE USER INFO
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setResponse("Login successful!");
      setIsError(false);

      // Redirect based on user role
      setTimeout(() => {
        const role = user.role?.toLowerCase();
        
        if (role === "admin") {
          router.replace("/(protected)/(teacher)");
        } else if (role === "teacher") {
          router.replace("/(protected)/(teacher)");
        } else if (role === "student") {
          router.replace("/(protected)/(student)");
        } else {
          // Default to teacher dashboard
          router.replace("/(protected)/(teacher)");
        }
      }, 500);

    } catch (error) {
      console.log(error);

      if (error.response) {
        const errorMsg = error.response.data?.message || JSON.stringify(error.response.data, null, 2);
        setResponse(errorMsg);
      } else {
        setResponse("Network error - Please check your connection");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar style="auto" />
      <ScrollView 
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12 bg-light-background dark:bg-dark-background">
          
          {/* Logo/Brand Section */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-gradient-accent items-center justify-center mb-4 shadow-lg">
              <Text className="text-4xl font-bold text-white">📚</Text>
            </View>
            <Text className="text-4xl font-bold text-light-textPrimary dark:text-dark-textPrimary mb-2">
              Attendance Pro
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
              Face Recognition Based Attendance System
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-light-textPrimary dark:text-dark-textPrimary mb-2">
              Welcome Back
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
              Sign in to continue to your dashboard
            </Text>

            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium">
                Email Address
              </Text>
              <TextInput
                placeholder="teacher@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-textPrimary dark:text-dark-textPrimary px-4 py-3 rounded-xl"
                style={{ fontSize: 16 }}
              />
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium">
                Password
              </Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-textPrimary dark:text-dark-textPrimary px-4 py-3 rounded-xl"
                style={{ fontSize: 16 }}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="items-end">
              <Text className="text-light-primary dark:text-dark-primary text-sm font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`bg-light-primary dark:bg-dark-primary py-4 rounded-xl mt-4 shadow-card ${
                loading ? 'opacity-70' : ''
              }`}
            >
              {loading ? (
                <View className="flex-row items-center justify-center space-x-2">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-center font-semibold text-base">
                    Logging in...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Response Message */}
            {response && (
              <View className={`mt-4 p-4 rounded-xl border ${
                isError 
                  ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                  : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
              }`}>
                <Text className={`text-sm text-center ${
                  isError 
                    ? 'text-light-error dark:text-dark-error' 
                    : 'text-light-success dark:text-dark-success'
                }`}>
                  {response}
                </Text>
              </View>
            )}

            {/* Demo Credentials Hint */}
            <View className="mt-6 p-4 bg-light-surfaceMuted dark:bg-dark-surfaceMuted rounded-xl">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center">
                Demo Credentials:
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center mt-1">
                Email: teacher@example.com
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center">
                Password: password123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}