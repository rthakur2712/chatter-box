// socket.js
import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
  transports: ["websocket"],
});

export default socket;