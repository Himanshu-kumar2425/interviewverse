import { io } from "socket.io-client";

// Singleton socket instance shared across the app
const socket = io("/", {
  autoConnect: false, // connect only when needed
  withCredentials: true,
});

export default socket;
