import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Trash2, Eye } from "lucide-react-native";
import { useState } from "react";

const FriendCard = ({
  firstName,
  lastName,
  imageUri = "https://ui-avatars.com/api/?name=" + firstName + "+" + lastName,
  onView,
  onRemove,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const confirmRemove = () => {
    setModalVisible(true);
  };

  const handleRemove = () => {
    setModalVisible(false);
    onRemove();
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
        {/* View Profile Button */}
        <TouchableOpacity
          onPress={onView}
          className="bg-indigo-50 p-2.5 rounded-xl"
        >
          <Eye color="#6366f1" size={20} />
        </TouchableOpacity>

        {/* Remove Friend Button */}
        <TouchableOpacity
          onPress={confirmRemove}
          className="bg-red-50 p-2.5 rounded-xl"
        >
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center ">
          <View className="mx-4 w-[90%] max-w-[320px] bg-gray-200 rounded-2xl shadow-xl">
            <View className="p-6">
              <Text className="text-xl text-black font-interbold text-center mb-2">
                Remove Friend
              </Text>
              <Text className="text-base text-gray700 font-intermedium text-center mb-6">
                Are you sure you want to remove <Text className="font-bold">{firstName}</Text> as a friend?
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 py-3 items-center rounded-xl bg-gray-100"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRemove}
                  className="flex-1 py-3 items-center rounded-xl bg-red-500"
                >
                  <Text className="text-white font-medium">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FriendCard;
