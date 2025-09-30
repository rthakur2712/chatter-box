import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { logout } from "@/lib/auth";
import axios from "axios";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MapPin, MailIcon, InfoIcon, Users } from "lucide-react-native";
import { useUser } from "@/contexts/UserContext";
import { usePushToken } from "@/contexts/PushTokenContext";
import FriendCard from "@/components/FriendCard";
import Loader from "@/components/Loader";
import ImageModalViewer from "@/components/ImageModalViewer";

const TAB_BAR_HEIGHT = 64; // Height of the tab bar from your layout

const ProfileScreen = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const router = useRouter();
  const { clearPushToken } = usePushToken();

  const handleLogout = async () => {
    await clearPushToken();
    await logout(() => {
      router.replace("/(auth)/welcome");
    });
  };

  // Fetch user details and friends from the backend
  useEffect(() => {
    if (user?.email) {
      const fetchUserData = async () => {
        try {
          // Fetch user details
          setLoading(true);
          const userResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/userDetails`,
            { params: { email: user.email } }
          );
          setUserData(userResponse.data);

          // Fetch friends
          const friendsResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/friend/getFriends`,
            {
              params: { userId: user.id },
            }
          );
          setFriends(friendsResponse.data.slice(0, 3)); // Limit to 3 friends
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  // Render loading state if data is not yet available
  if (!user || !userData || loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT, // Add padding to bottom to prevent tab bar overlap
        }}
      >
        <View className="h-48 justify-center items-center border-b">
          <Image
            source={require("../../../assets/images/banner.png")}
            style={{ position: "absolute", width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Profile Info */}
        <View className="px-4 pb-4">
          {/* Avatar */}
          <View className="relative -mt-16 mb-4">
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: userData?.image }}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
            </TouchableOpacity>
          </View>

          <ImageModalViewer
            visible={imageModalVisible}
            onClose={() => setImageModalVisible(false)}
            imageUri={userData?.image}
          />

          {/* User Info */}
          <View className="mb-6 gap-2">
            <Text className="text-2xl font-poppinssemibold">
              {userData?.firstName} {userData?.lastName}
            </Text>

            <View className="flex-row items-center">
              <View className="p-2 rounded-full mr-2">
                <MailIcon size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-intermedium">{userData.email}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="p-2 rounded-full mr-2">
                <InfoIcon size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-intermedium">{userData.bio}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="p-2 rounded-full mr-2">
                <MapPin size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-intermedium">{userData.location}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 gap-1 mb-6">
            <TouchableOpacity className="flex-1 bg-black py-3 rounded-full">
              <Text className="text-white text-center font-intersemibold">
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-1 bg-red-500 py-3 rounded-full"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-center  mr-2 font-intersemibold">
                  Logout
                </Text>
                <MaterialIcons name="logout" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Friends Section */}
          <View>
            <TouchableOpacity
              className="flex-row items-center justify-between mb-4"
              onPress={() => router.push("/(root)/friends")}
            >
              <View className="flex-row items-center gap-2">
                <Users size={24} color="#6366f1" className="" />
                <Text className="text-xl text-indigo-500 font-interbold">
                  My Friends
                </Text>
              </View>
              <Text className="text-indigo-500 font-intermedium">See All</Text>
            </TouchableOpacity>

            {friends.length === 0 ? (
              <Text className="text-gray-500 font-inter">No friends yet</Text>
            ) : (
              friends.map((friend) => (
                <FriendCard
                  key={friend._id}
                  firstName={friend.firstName}
                  lastName={friend.lastName}
                  imageUri={friend.image}
                  onView={() => router.push(`/profile/${friend._id}`)}
                  onRemove={() => {}}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
