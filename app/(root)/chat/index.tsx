import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import CryptoJS from "react-native-crypto-js";
import { useUser } from "@/contexts/UserContext";
import { useSocket } from "@/contexts/SocketContext";
import Loader from "@/components/Loader";
import {
  PlusIcon,
  CheckCircle2,
  SendIcon,
  SendHorizonalIcon,
  CameraIcon,
  Images,
  GalleryHorizontal,
} from "lucide-react-native";

const AllChatsScreen = () => {
  const { imageUrl } = useLocalSearchParams();
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const[socketConnected, setSocketConnected] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { socket } = useSocket();

  const SECRET_KEY = process.env.EXPO_PUBLIC_SECRET_KEY;

  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (!user || !socket || !chats) return;
    try {
      socket.emit("join", { userId: user.id });
      setSocketConnected(true);

      // Listen for unread counts updates
      socket.on("unreadCounts", ({ chats: updatedChats = [] }) => {
        const countsMap = {};
        updatedChats.forEach((chat) => {
          if (chat?._id) {
            countsMap[chat._id] = chat.unreadCount || 0;
          }
        });
        setUnreadCounts(countsMap);
      });

      // Listen for individual unread count updates
      socket.on("unreadCountUpdate", ({ chatId, unreadCounts = [] }) => {
        if (!chatId) return;

        setUnreadCounts((prev) => ({
          ...prev,
          [chatId]:
            unreadCounts?.find?.((uc) => uc?.participantId === user.id)
              ?.count || 0,
        }));
      });

      // Listen for new messages
      socket.on("lastMessageUpdate", ({ chatId, lastMessage }) => {
        if (!chatId || !lastMessage) return;

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === chatId ? { ...chat, lastMessage } : chat
          )
        );
      });

      return () => {
        socket.off("unreadCounts");
        socket.off("unreadCountUpdate");
        socket.off("lastMessageUpdate");
      };
    } catch (error) {
      console.error("Socket setup error:", error);
    }
  }, [user, socket, chats]);

  const safeEmit = (eventName, data) => {
    if (socket && socketConnected) {
      socket.emit(eventName, data);
      return true;
    }
    console.warn("Socket not connected, message queued");
    return false;
  };
  const encryptMessage = (message) => {
    try {
      if (!SECRET_KEY) {
        throw new Error("Encryption key is not defined");
      }
      return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt message");
    }
  };
  const sendImage = async () => {
    if (!socketConnected||!imageUrl || !selectedChat) {
      alert("Connection lost. Please try again.");
      return;
    }

    setIsSending(true);

    try {
      const newMessage = {
        chatId: selectedChat,
        senderId: user.id,
        messageType: "image",
        message: await encryptMessage("Sent an image"),
        imageUrl: imageUrl,
        timeStamp: new Date(),
      };

      const sent = safeEmit("sendMessage", newMessage);

      if (sent) {
        console.log("Image sent successfully");
        router.push(`/(root)/chat/${selectedChat}`);
      }
    } catch (error) {
      console.error("Error sending image message:", error);
      alert("Error sending image. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const fetchChats = async () => {
    if (!user) {
      console.warn("User is not defined, skipping fetchChats");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/chats/getChats`,
        { params: { userId: user.id } }
      );
      setChats(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load chats");
      setLoading(false);
      console.error("Error fetching chats:", err);
    }
  };

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p._id !== user.id) || participants[0];
  };

  const filteredChats = chats.filter((chat) => {
    const otherParticipant = getOtherParticipant(chat.participants);
    const fullName =
      `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      (chat.lastMessage.message &&
        chat.lastMessage.message.toLowerCase().includes(searchLower))
    );
  });

  const handleChatPress = (chatId) => {
    if (imageUrl) {
      setSelectedChat(chatId);
    } else {
      // Mark messages as seen when entering chat
      // socket.emit("join", { userId: user.id, chatId });
      router.push(`/chat/${chatId}`);
    }
  };

  const sortedChats = filteredChats.sort((a, b) => {
    const timeA = a.lastMessage?.timeStamp ? new Date(a.lastMessage.timeStamp) : new Date(0);
    const timeB = b.lastMessage?.timeStamp ? new Date(b.lastMessage.timeStamp) : new Date(0);
    return timeB.getTime() - timeA.getTime();
  });

  const renderChatItem = ({ item }) => {
    const otherParticipant = getOtherParticipant(item.participants);
    const isSelected = selectedChat === item._id;
    const unreadCount = unreadCounts[item._id] || 0;
    const isLastMessageFromOther = item.lastMessage.senderId !== user.id;

    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-gray-100 ${
          isSelected ? "bg-indigo-50" : ""
        }${unreadCount > 0 && isLastMessageFromOther ? "bg-indigo-50/20" : ""}`}
        onPress={() => handleChatPress(item._id)}
        disabled={isSending}
      >
        <View className="relative">
          <Image
            source={{ uri: otherParticipant.image }}
            className="w-14 h-14 rounded-full"
          />
          {isSending && item._id === selectedChat && (
            <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          )}
          {isSelected && (
            <View className="absolute -right-1 -bottom-1">
              <CheckCircle2 size={24} color="#4F46E5" fill="white" />
            </View>
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center">
            <Text
              className={`font-poppinssemibold text-lg ${
                unreadCount > 0 && isLastMessageFromOther
                  ? "text-indigo-600"
                  : ""
              }`}
            >
              {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
            </Text>
            <Text className="text-gray-500 text-sm font-poppinssemibold">
              {new Date(item.lastMessage.timeStamp).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-1">
            <Text
              className={`text-gray-600 flex-1 mr-4 font-intersemibold ${
                unreadCount > 0 && isLastMessageFromOther
                  ? " font-interbold"
                  : ""
              }`}
              numberOfLines={1}
            >
              {item.lastMessage.messageType === "image" ? (
                <View className="flex-row items-center justify-center gap-1">
                  <Images size={16} color="#4b5563" />
                  <Text className="font-intersemibold text-gray-600">
                    Photo
                  </Text>
                </View>
              ) : (
                decryptMessage(item.lastMessage.message)
              )}
            </Text>
            {unreadCount > 0 && isLastMessageFromOther && (
              <View className="bg-indigo-600 rounded-full h-6 min-w-[24px] px-1.5 items-center justify-center">
                <Text className="text-white text-xs font-poppinsbold">
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 font-poppinsregular">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-indigo-500 px-4 py-2 rounded-full"
          onPress={fetchChats}
        >
          <Text className="text-white font-inter">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {imageUrl && (
        <View className="bg-indigo-50 p-2 gap-2 justify-evenly items-center flex-row">
          <Text className="text-center text-indigo-600 font-poppinssemibold text-lg mb-2">
            Select a chat to send your image
          </Text>
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg self-center"
            resizeMode="cover"
          />
        </View>
      )}

      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-interbold">Chats</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push("/(root)/camera")}
              className="bg-indigo-600 p-1.5 rounded-full"
            >
              <Ionicons name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search-outline" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 font-inter"
            placeholder="Search chats"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={sortedChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        className="flex-1"
      />

      {imageUrl && selectedChat ? (
        <TouchableOpacity
          className="absolute bottom-10 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={sendImage}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <SendHorizonalIcon size={24} color="white" />
          )}
        </TouchableOpacity>
      ) : (
        !imageUrl && (
          <TouchableOpacity
            className="absolute bottom-10 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            onPress={() => router.push("/(root)/newConversation")}
          >
            <PlusIcon size={24} color="white" />
          </TouchableOpacity>
        )
      )}
    </SafeAreaView>
  );
};

export default AllChatsScreen;
