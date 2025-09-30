import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";

// Custom Input Component
const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  editable = true,
}) => (
  <View className="mb-4">
    <Text className="text-black font-semibold text-sm mb-2 font-inter ">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      editable={editable}
      className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-3xl font-medium font-inter
        ${!editable ? "bg-gray-50 text-gray-500" : ""} 
        ${multiline ? "h-32 py-4" : ""}`}
      placeholderTextColor="#9CA3AF"
      style={{
        textAlignVertical: multiline ? "top" : "center",
      }}
    />
  </View>
);

const NewProfilePage = () => {
  const router = useRouter();
  const user = useUser().user;
  const { signOut } = useAuth();
  const [isloading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState(""); // New location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [clerkImage, setClerkImage] = useState(user?.imageUrl.toString());
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [image, setImage] = useState(clerkImage);
  const [currentUser, setCurrentUser] = useState(null);

  

  const email = user?.primaryEmailAddress?.emailAddress;

  // Check if user is new
  const checkIfNewUser = async () => {
    try {
      console.log("Checking if user is new...");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/isNewUser`,
        { email }
      );

      if (response.status === 200) {
        console.log("New user detected, staying here...");
      } else if (response.status === 201) {
        console.log("Existing user detected, redirecting to explore...");
        
        if (response.data.token) {
          await SecureStore.setItemAsync("authToken", response.data.token);

          router.replace("/(root)/chat");
        } else {
          console.warn("No token received for existing user.");
        }
      }
    } catch (error) {
      console.error("Error checking if user is new:", error);

      Alert.alert(
        "Error",
        "Something went wrong. Please try signing in again.",
        [
          {
            text: "Try Again",
            onPress: async () => {
              try {
                await signOut();
                router.replace("/");
              } catch (signOutError) {
                console.error("Error signing out:", signOutError);
                router.replace("/");
              }
            },
          },
        ]
      );
    } finally {
      setIsCheckingUser(false);
    }
  };

  useEffect(() => {
    if (email) {
      checkIfNewUser();
    }
  }, [email]);

  // Fetch current location
  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Location Permission",
          "Permission to access location was denied. You can manually enter your location.",
          [{ text: "OK" }]
        );
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      let addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const locationString = `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim();
        setLocation(locationString);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert(
        "Location Error", 
        "Could not fetch your current location. You can enter it manually.",
        [{ text: "OK" }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Image picking handler
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
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
          setImage(data.secure_url);
          setIsLoading(false);
        } else {
          console.error("Upload failed:", data);
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        setIsLoading(false);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return false;
    }
    if (!about.trim()) {
      Alert.alert("Error", "Please tell us about yourself");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Please add your location");
      return false;
    }
    if (!image) {
      Alert.alert("Error", "Please select a profile picture");
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          email,
          firstName,
          lastName,
          about,
          image,
          location,
        }
      );

      if (response.data.token) {
        await SecureStore.setItemAsync("authToken", response.data.token);
        console.log("Profile created successfully");
        setIsLoading(false);
        router.push("/(root)/explore");
      } else {
        console.warn("No token received for existing user.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong while creating your profile"
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isCheckingUser ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full"></TouchableOpacity>
              <View className="w-10" />
            </View>

            {/* Profile Picture Section */}
            <View className="items-center mb-8">
              <View className="relative">
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-indigo-400"
                >
                  {image ? (
                    <Image source={{ uri: image }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="person" size={40} color="#818CF8" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-400 rounded-full items-center justify-center border-4 border-white"
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View className="px-4">
              <CustomInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
              />
              <CustomInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
              />
              <CustomInput
                label="About"
                value={about}
                onChangeText={setAbout}
                placeholder="Tell us about yourself..."
                multiline
              />
              <CustomInput
                label="Email"
                value={email}
                editable={false}
                placeholder="Your email address"
              />

              {/* Location Input */}
              <View className="mb-4">
                <Text className="text-black font-inter font-semibold text-sm mb-2">Location</Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter your location"
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-3xl font-medium font-inter"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={fetchCurrentLocation}
                    disabled={locationLoading}
                    className="ml-2 bg-indigo-400 p-3 rounded-full"
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons 
                        name="locate" 
                        size={20} 
                        color="white" 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <View className="px-4 mt-6">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isloading}
                className={`bg-indigo-400 py-4 px-6 rounded-3xl flex-row items-center justify-center ${
                  isloading ? "opacity-70" : ""
                }`}
              >
                {isloading ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : (
                  <>
                    <Text className="text-white font-medium text-lg font-poppins">
                      Complete Setup
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewProfilePage;