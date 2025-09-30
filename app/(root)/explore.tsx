import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";
import UserCard from "@/components/UserCard";
import PageEnd from "@/components/PageEnd";

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/getAllUsers`,
        { params: { email: user.email } }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleFriendRequest = async (userId) => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/addFriend`,
        { userId: user?.id, friendId: userId }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const filteredUsers = users.filter(
    (userItem) =>
      userItem.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2 border-b border-gray-200">
        <Text className="text-2xl font-interbold mb-4">Explore</Text>
        
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search-outline" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 font-inter"
            placeholder="Search users"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 24,
        }}
        renderItem={({ item }) => (
          <View className="">
            <UserCard
              user={item}
              currentUserId={user.id}
              onFriendRequest={handleFriendRequest}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<PageEnd />}
      />
    </SafeAreaView>
  );
};

export default ExploreScreen;