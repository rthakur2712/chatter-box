// SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/contexts/UserContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      // Initialize socket with auth details
      const socketInstance = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          userId: user.id, // Add userId to connection query
        },
        auth: {
          userId: user.id, // Add userId to auth object as well
        },
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected with userId:", user.id);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socketInstance.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(socketInstance);

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [user?.id]);

  const value = {
    socket,
    isConnected: socket?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
