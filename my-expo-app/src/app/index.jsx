import { View, Text } from "react-native";
import "../../global.css";
export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-orange-500 text-xl font-bold dark:text-blue-400">
        Home Screen ✅
      </Text>
    </View>
  );
}