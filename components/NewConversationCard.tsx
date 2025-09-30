import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const NewConversationCard = ({
  firstName,
  lastName,
  friendId,
  userId,
  imageUri = "https://ui-avatars.com/api/?name=" + firstName + "+" + lastName,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleChatButton = async () => {
    setIsLoading(true);
    try {
      console.log("Creating chat with friend ID:", friendId);
      console.log("User ID:", userId);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/chats/createChat`,
        {
          userId: userId,
          friendId: friendId,
        }
      );
      if (response.data && response.data._id) {
        router.push(`/chat/${response.data._id}`);
      } else {
        console.error("No chat ID received");
      }
    } catch (error) {
      console.error("Error handling chat:", error);
      // You might want to show an error toast/alert here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl shadow-md p-4 mb-4 flex-row items-center border border-gray-100">
      {/* Profile Image with Gradient Border */}
      <View className="mr-4 p-1 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
        <Image
          source={{ uri: imageUri }}
          className="w-16 h-16 rounded-full border-2 border-white"
        />
      </View>

      {/* Name and Details Container */}
      <View className="flex-1 pr-2">
        <Text className="text-gray-900 text-lg mb-1 font-poppinssemibold">
          {firstName} {lastName}
        </Text>
      </View>

      {/* Action Buttons Container */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleChatButton}
          disabled={isLoading}
          className={`bg-indigo-500 p-2 px-4 rounded-xl ${isLoading ? "opacity-50" : ""}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="font-interbold text-white">Chat</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewConversationCard;
