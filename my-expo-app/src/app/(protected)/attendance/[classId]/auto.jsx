import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useLocalSearchParams,
  router,
  Stack
} from "expo-router";

import { useState, useEffect } from "react";
import api from "../../../../services/api";
import { Ionicons } from '@expo/vector-icons';

export default function AutoAttendance() {

  const { classId } = useLocalSearchParams();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("");
  const [allStudents, setAllStudents] = useState([]); // Store all students

  // Fetch class name and all students for header
  useEffect(() => {
    fetchClassDetails();
    requestPermissions();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      const classData = res.data?.data;
      setClassName(classData?.course_name || "Auto Attendance");
      // Store all students for later use
      setAllStudents(classData?.students || []);
    } catch (error) {
      console.log("Error fetching class:", error);
    }
  };

  // Request camera and gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required to take photos');
    }
    if (galleryStatus !== 'granted') {
      Alert.alert('Permission Needed', 'Gallery permission is required to select images');
    }
  };

  // Optimize image before upload
  const optimizeImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result;
    } catch (error) {
      console.log("Image optimization error:", error);
      return { uri };
    }
  };

  // Pick images from gallery
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const optimizedImages = await Promise.all(
        result.assets.map(async (asset) => {
          const optimized = await optimizeImage(asset.uri);
          return { ...asset, uri: optimized.uri };
        })
      );
      setImages([...images, ...optimizedImages]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const optimized = await optimizeImage(result.assets[0].uri);
      setImages([...images, { ...result.assets[0], uri: optimized.uri }]);
      
      Alert.alert(
        "Add More?",
        "Do you want to take another photo?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => takePhoto() }
        ]
      );
    }
  };

  // Show image source options
  const showImageSourceOptions = () => {
    Alert.alert(
      "Select Images",
      "Choose how to add images",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickFromGallery }
      ],
      { cancelable: true }
    );
  };

  // Remove image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Upload images to backend
  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert("Error", "Please select at least one image");
      return;
    }

    try {
      setLoading(true);

      const user = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(user);
      const teacherId = parsedUser?._id;

      if (!teacherId) {
        Alert.alert("Error", "Teacher not found");
        return;
      }

      const formData = new FormData();
      formData.append("teacherId", teacherId);

      images.forEach((img, index) => {
        formData.append("images", {
          uri: img.uri,
          name: `image_${Date.now()}_${index}.jpg`,
          type: "image/jpeg"
        });
      });

      const res = await api.post(
        `/attendance/auto/${classId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const recognizedStudents = res.data.data.recognized_students || [];
      const attendanceId = res.data.data.attendance_id;

      // Create a map of recognized student IDs for quick lookup
      const recognizedMap = new Map();
      recognizedStudents.forEach(student => {
        recognizedMap.set(student.studentId, student);
      });

      // Create complete student list with ALL students
      // - Recognized students: status = "present", with confidence
      // - Not recognized students: status = "absent", confidence = null
      const allStudentsList = allStudents.map(student => {
        const recognized = recognizedMap.get(student._id);
        
        if (recognized) {
          // Student was recognized by AI
          return {
            studentId: student._id,
            name: student.name || "Unknown",
            roll_no: student.roll_no || "-",
            confidence: recognized.confidence,
            status: "present"
          };
        } else {
          // Student was NOT recognized (absent)
          return {
            studentId: student._id,
            name: student.name || "Unknown",
            roll_no: student.roll_no || "-",
            confidence: null,
            status: "absent"
          };
        }
      });

      console.log(`Total students: ${allStudentsList.length}`);
      console.log(`Recognized: ${recognizedStudents.length}`);
      console.log(`Absent: ${allStudentsList.length - recognizedStudents.length}`);

      // Navigate to review screen with ALL students
      router.push({
        pathname: "/attendance/[classId]/review",
        params: {
          classId,
          attendanceId: attendanceId,
          data: JSON.stringify(allStudentsList)
        }
      });

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to process images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: className || "Auto Attendance",
          headerShown: true
        }} 
      />
      
      <ScrollView className="flex-1 bg-light-background dark:bg-dark-background">
        
        {/* Header Banner */}
        <View className="bg-light-primary dark:bg-dark-primary pt-6 pb-8 px-6 rounded-b-3xl shadow-lg">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
              <Ionicons name="camera-outline" size={40} color="white" />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              AI Auto Attendance
            </Text>
            <Text className="text-white/80 text-center mt-2">
              Upload classroom images for automatic face recognition
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-5 pt-8 pb-12">
          
          {/* Info Card */}
          <View className="bg-light-primary/5 dark:bg-dark-primary/5 rounded-xl p-4 mb-6 border border-light-primary/20 dark:border-dark-primary/20">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={20} color="#0D9488" />
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold ml-2">
                How it works
              </Text>
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
              1. Take photos or select images containing students' faces{'\n'}
              2. AI will detect and recognize faces{'\n'}
              3. Review ALL students (present marked, absent needs verification){'\n'}
              4. Manually mark any missed students before finalizing
            </Text>
          </View>

          {/* Image Selection Buttons */}
          <View className="flex-row space-x-4 mb-6">
            <TouchableOpacity
              onPress={takePhoto}
              activeOpacity={0.8}
              className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-4 items-center justify-center shadow-card border border-light-border dark:border-dark-border"
            >
              <View className="w-12 h-12 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 items-center justify-center mb-2">
                <Ionicons name="camera-outline" size={24} color="#0D9488" />
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold text-sm">
                Take Photo
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                Capture now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickFromGallery}
              activeOpacity={0.8}
              className="flex-1 bg-light-surface dark:bg-dark-surface rounded-xl p-4 items-center justify-center shadow-card border border-light-border dark:border-dark-border"
            >
              <View className="w-12 h-12 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 items-center justify-center mb-2">
                <Ionicons name="images-outline" size={24} color="#0D9488" />
              </View>
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold text-sm">
                Choose Gallery
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mt-1">
                Select existing
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Images Stats */}
          {images.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold">
                  Selected Images ({images.length})
                </Text>
                <TouchableOpacity 
                  onPress={() => setImages([])}
                  className="flex-row items-center"
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text className="text-light-error dark:text-dark-error text-sm ml-1">
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {images.map((img, index) => (
                    <View key={index} className="relative">
                      <Image 
                        source={{ uri: img.uri }}
                        className="w-24 h-24 rounded-xl"
                        style={{ resizeMode: "cover" }}
                      />
                      <TouchableOpacity 
                        onPress={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-light-error dark:bg-dark-error rounded-full items-center justify-center shadow-md"
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Add More Button */}
          {images.length > 0 && !loading && (
            <TouchableOpacity
              onPress={showImageSourceOptions}
              className="flex-row items-center justify-center mb-6"
            >
              <Ionicons name="add-circle-outline" size={20} color="#0D9488" />
              <Text className="text-light-primary dark:text-dark-primary text-sm font-medium ml-1">
                Add More Images
              </Text>
            </TouchableOpacity>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            onPress={uploadImages}
            disabled={loading || images.length === 0}
            className={`bg-light-primary dark:bg-dark-primary py-4 rounded-xl shadow-card flex-row items-center justify-center ${
              (loading || images.length === 0) ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">
                  Processing Images...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Upload & Recognize Faces
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Upload Info */}
          {images.length > 0 && !loading && (
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs text-center mt-3">
              {images.length} image{images.length !== 1 ? 's' : ''} will be processed
            </Text>
          )}

          {/* Tips Section */}
          <View className="mt-8 p-4 bg-light-surfaceMuted dark:bg-dark-surfaceMuted rounded-xl">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              <Text className="text-light-textPrimary dark:text-dark-textPrimary font-semibold ml-2">
                Tips for best results
              </Text>
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
              • Use well-lit, clear photos{'\n'}
              • Ensure faces are visible and not obscured{'\n'}
              • Multiple angles improve recognition accuracy{'\n'}
              • Take photos from different parts of the classroom{'\n'}
              • Maximum 10 images per batch{'\n'}
              • After AI detection, review all students and mark any missed ones
            </Text>
          </View>

        </View>

      </ScrollView>
    </>
  );
}