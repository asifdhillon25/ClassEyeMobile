import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.1.10:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🚀 REQUEST INTERCEPTOR (attach token automatically)
api.interceptors.request.use(
  async (config) => {
    // ❌ skip token for login route
    if (config.url?.includes("/auth/login")) {
      return config;
    }

    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR (global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("API ERROR:", error.response.data);
    } else {
      console.log("NETWORK ERROR:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;