import { io } from "socket.io-client";
import { SOCKET_URL } from "./constants";

let socket;

/**
 * Socket.io client singleton.
 * Always returns the same socket instance — never creates duplicates.
 *
 * Usage:
 *   import { getSocket } from "../lib/socket";
 *   const socket = getSocket();
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

/**
 * Cleanly disconnect and discard the socket instance.
 * Call on logout to prevent stale connections.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
