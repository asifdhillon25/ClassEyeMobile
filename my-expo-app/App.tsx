import { View, Text, Pressable } from "react-native";
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 bg-black items-center justify-center px-6">

      {/* Card */}
      <View className="bg-zinc-900 w-full p-6 rounded-2xl border border-zinc-700 shadow-lg">

        {/* Badge */}
        <View className="self-start bg-green-500 px-3 py-1 rounded-full mb-4">
          <Text className="text-black font-bold text-xs">
            LIVE STATUS
          </Text>
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold">
          NativeWind UI 🚀
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-400 mt-2 text-base">
          Your Expo app is now styled with Tailwind classes.
        </Text>

        {/* Divider */}
        <View className="h-px bg-zinc-700 my-5" />

        {/* Stats Row */}
        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-400 text-sm">Performance</Text>
            <Text className="text-green-400 font-bold">Excellent</Text>
          </View>

          <View>
            <Text className="text-gray-400 text-sm">Status</Text>
            <Text className="text-blue-400 font-bold">Active</Text>
          </View>
        </View>

        {/* Button */}
        <Pressable className="mt-6 bg-white py-3 rounded-xl active:opacity-70">
          <Text className="text-black text-center font-bold">
            Get Started
          </Text>
        </Pressable>

      </View>

    </View>
  );
}