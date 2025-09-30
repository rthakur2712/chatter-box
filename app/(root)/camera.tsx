import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ImageIcon, X, Upload, ImagesIcon } from "lucide-react-native";

const ImagePickerScreen = () => {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadToCloudinary = async () => {
    if (!image) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        type: "image/jpeg",
        name: "upload.jpg",
      });
      formData.append(
        "upload_preset",
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const response = await fetch(
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_URL,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: "/(root)/chat",
          params: { imageUrl: data.secure_url },
        });
      } else {
        console.error("Upload failed:", data);
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {image ? (
          
          <View className="flex-1 relative mt-4">
            <Image source={{ uri: image }} className="flex-1 rounded-2xl" resizeMode="cover" />

            {/* Floating action buttons */}
            <View className="absolute top-4 right-4 flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setImage(null)}
                className="bg-black/20 backdrop-blur-lg p-3 rounded-full"
                disabled={isUploading}
              >
                <X size={24} color="white" />
              </TouchableOpacity>

              {isUploading ? (
                <View className="bg-black/20 backdrop-blur-lg p-3 rounded-full">
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={uploadToCloudinary}
                  className="bg-black/20 backdrop-blur-lg p-3 rounded-full"
                >
                  <Upload size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          // Minimal upload options
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl font-intermedium text-center text-gray-900 mb-8">
              Add Photo
            </Text>

            <View className=" gap-2 flex-row">
              <TouchableOpacity
                onPress={takePhoto}
                className="bg-gray-50 h-20 w-40 border mr-4 border-gray-200/80 shadow-md p-6 rounded-2xl flex-row items-center justify-center "
              >
                <Camera size={24} color="#4F46E5" strokeWidth={2} />
                <Text className="text-gray-900 text-lg ml-3 font-poppinssemibold ">
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                className="bg-gray-50 h-20 w-40 border border-gray-200/80 shadow-md p-6 rounded-2xl flex-row items-center justify-center space-x-3"
              >
                <ImagesIcon size={24} color="#4F46E5" strokeWidth={2} />
                <Text className="text-gray-900 text-lg ml-3 font-poppinssemibold">
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ImagePickerScreen;
