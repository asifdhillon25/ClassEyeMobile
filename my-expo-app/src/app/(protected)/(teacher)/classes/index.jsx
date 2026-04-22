import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { router } from "expo-router";

export default function Classes() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/classes");

        

        // ✅ FIXED LINE
        setClasses(res.data.data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <View className="flex-1 p-4">

      <Text>Classes</Text>

      {classes.map((item) => (
        <TouchableOpacity
          key={item._id}
          onPress={() =>
            router.push(`/(protected)/(teacher)/classes/${item._id}`)
          }
        >
          <Text>{item.course_name}</Text>
        </TouchableOpacity>
      ))}

    </View>
  );
}