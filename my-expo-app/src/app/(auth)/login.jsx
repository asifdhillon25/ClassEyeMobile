import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setResponse("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setResponse(null);

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

      router.replace("/(protected)/(teacher)");

      // 👉 Later you will redirect like:
      // router.replace("/(protected)/admin");
      // based on user.role

    } catch (error) {
      console.log(error);

      if (error.response) {
        setResponse(JSON.stringify(error.response.data, null, 2));
      } else {
        setResponse("Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-black">

      <Text className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
        Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 dark:border-gray-700 text-black dark:text-white px-4 py-3 rounded-xl mb-4"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-gray-300 dark:border-gray-700 text-black dark:text-white px-4 py-3 rounded-xl mb-6"
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-600 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Loading..." : "Login"}
        </Text>
      </TouchableOpacity>

      {response && (
        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <Text className="text-xs text-black dark:text-white">
            {response}
          </Text>
        </View>
      )}

    </View>
  );
}