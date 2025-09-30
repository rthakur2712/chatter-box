// app/(root)/requests.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useRequests } from "@/contexts/RequestsContext";
import Loader from "@/components/Loader";

const FriendRequestsScreen = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { setPendingRequests } = useRequests();

  const fetchFriendRequests = async () => {
    if (!user) return;
    try {
      const userId = user?.id;
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/getFriendRequests`,
        { params: { user2: userId } }
      );
      setFriendRequests(response.data);
      setPendingRequests(response.data.length); // Update the global state
      console.log("Friend requests:", response.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [user]);

  const handleAccept = async (requestId: String) => {
    if (!requestId) return;
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/acceptRequest`,
        {
          requestId,
        }
      );

      if (response.status === 200) {
        console.log(response.data.message);
        fetchFriendRequests();
      } else {
        console.error("Unexpected API response:", response);
      }
    } catch (error: any) {
      console.error(
        "Error accepting friend request:",
        error.response?.data || error.message
      );
    }
  };

  const handleDecline = async (requestId: String) => {
    if (!requestId) return;
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/declineRequest`,
        {
          requestId,
        }
      );

      if (response.status === 200) {
        console.log(response.data.message); // Log success message from API
        fetchFriendRequests(); // Refresh the list after successful API call
      } else {
        console.error("Unexpected API response:", response);
      }
    } catch (error) {
      console.error(
        "Error declining friend request:",
        error.response?.data || error.message
      );
    }
  };

  const renderRequestItem = ({ item }) => (
    <View className="p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.push(`/profile/${item.user1._id}`)} // Navigate to request sender's profile
          className="flex-row flex-1 items-center"
        >
          <Image
            source={{
              uri: item.user1.image || "https://via.placeholder.com/50",
            }} // Replace with real avatar URL
            className="w-16 h-16 rounded-full"
          />
          <View className="flex-1 ml-4">
            <Text className=" font-poppinssemibold text-lg">
              {item.user1.firstName} {item.user1.lastName}
            </Text>
            <Text className="text-gray-500 font-inter">{item.user1.email}</Text>
            {/* <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
              No bio available
            </Text> */}
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-end space-x-4 mt-4">
        <TouchableOpacity
          className="px-6 py-2 bg-gray-200 rounded-full"
          onPress={() => handleDecline(item._id)}
        >
          <Text className="text-gray-600 font-inter">Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-6 py-2 bg-indigo-400 rounded-full"
          onPress={() => handleAccept(item._id)}
        >
          <Text className="text-white font-inter">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Loader />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-interbold">Friend Requests</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Requests List */}
      <FlatList
        data={friendRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        className="flex-1"
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="people-outline" size={48} color="gray" />
            <Text className="text-gray-500 text-center mt-4 font-inter">
              No pending friend requests
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;