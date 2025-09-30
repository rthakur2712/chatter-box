import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Search, ArrowLeft, UserX } from "lucide-react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import FriendCard from "@/components/FriendCard";
import Loader from "@/components/Loader"; 
import NewConversationCard from "@/components/NewConversationCard";

const NewConversationScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/getFriends`,
          {
            params: { userId: user.id },
          }
        );
        setFriends(response.data);
        setFilteredFriends(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFriends();
    }
  }, [user]);

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Filter friends by first name or last name (case-insensitive)
    const filtered = friends.filter(
      (friend) =>
        friend.firstName.toLowerCase().includes(query.toLowerCase()) ||
        friend.lastName.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredFriends(filtered);
  };

  // Remove friend handler
  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/remove/${friendId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Update local state
      const updatedFriends = friends.filter(
        (friend) => friend._id !== friendId
      );
      setFriends(updatedFriends);
      setFilteredFriends(updatedFriends);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // Render friend item
  const renderFriendCard = ({ item }) => (
    <NewConversationCard
      firstName={item.firstName}
      lastName={item.lastName}
      imageUri={item.image}
      friendId={item._id}
      userId={user.id}
      onChat={() => router.push(`/profile/${item._id}`)}
      
    />
  );

  // Empty list component
  const EmptyListComponent = () => (
    <View className="flex-1 items-center justify-center mt-12">
      <UserX size={64} color="#6366f1" />
      <Text className="text-gray-500 text-lg mt-4">
        {searchQuery
          ? "No friends found matching your search"
          : "You have no friends yet"}
      </Text>
    </View>
  );

  if (loading) {
    return <Loader />; // Show Loader component when loading
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#6366f1" />
        </TouchableOpacity>

        <Text className="text-2xl font-semibold font-inter text-indigo-500 flex-1">
          New Conversation
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Search size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Search friends"
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={handleSearch}
            className="flex-1 text-gray-800 font-inter"
          />
        </View>
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriendCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 80, // Add bottom padding for tab bar
        }}
        ListEmptyComponent={EmptyListComponent}
      />
    </SafeAreaView>
  );
};

export default NewConversationScreen;
