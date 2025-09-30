import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface UserCardProps {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    about: string;
    image: string;
    friendshipStatus: "Add Friend" | "Pending" | "View Request" | "Friends";
  };
  currentUserId: string;
  onFriendRequest: (userId: string) => void;
}

const UserCard = ({ user, currentUserId, onFriendRequest }: UserCardProps) => {
  const router = useRouter();

  const handleButtonPress = () => {
    if (user.friendshipStatus === "Add Friend") {
      onFriendRequest(user._id);
    } else if (user.friendshipStatus === "View Request") {
      router.push("/(root)/requests");
    }
  };

  const getButtonStyle = (status: string) => {
    switch (status) {
      case "Add Friend":
        return " bg-indigo-400"; // Indigo background for Add Friend
      case "Pending":
        return "bg-gray-200"; // Light gray for Pending
      case "View Request":
        return "bg-black"; // Black background for View Request
      case "Friends":
        return "bg-indigo-500"; // Green background for Friends
      default:
        return " bg-indigo-400"; // Default gray background
    }
  };

  const handleCardPress = () => {
    router.push({
      pathname: `/profile/${user._id}`,
      params: {
        friendshipStatus: user.friendshipStatus,
        userId: currentUserId,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl shadow-md p-4 mb-4 flex-row gap-1 items-center border border-gray-100"
    >
      {/* Profile Image */}
      <View className="mr-4 p-1 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
        <Image
          source={{ uri: user.image }}
          className="w-16 h-16 rounded-full border-2 border-white"
        />
      </View>

      {/* User Info */}
      <View className="flex-1 pr-2">
        <Text className="text-gray-900 text-lg mb-1 font-poppinssemibold">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-sm text-gray-500 font-inter" numberOfLines={1}>{user.email}</Text>
        <Text className="text-sm text-gray-600 mt-1 font-intersemibold" numberOfLines={1}>
          {user.about}
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={handleButtonPress}
        className={`${getButtonStyle(user.friendshipStatus)} p-2 px-4 rounded-xl`}
        disabled={
          user.friendshipStatus === "Pending" ||
          user.friendshipStatus === "Friends"
        }
      >
        <Text
          className={`${
            user.friendshipStatus === "Pending"
              ? "text-black"
              : "text-white"
          } text-sm font-intersemibold`}
        >
          {user.friendshipStatus}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default UserCard;
