import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PageEnd = () => {
  return (
    <View className="py-6 items-center justify-center flex-row">
      <Text className="text-gray-500 text-2xl  font-poppinssemibold mr-1">
        Crafted with
      </Text>
      <Ionicons name="heart" size={32} color="#ef4444" />
      <Text className="text-gray-400 text-2xl  font-poppinssemibold ml-1">
        in Patna
      </Text>
    </View>
  );
};

export default PageEnd;
