import { io } from "socket.io-client";
import { SOCKET_URL } from "./constants";

const SOCKET_GLOBAL_KEY = "__collabWorkspaceSocket";

/**
 * Socket.io client singleton.
 * Always returns the same socket instance — never creates duplicates.
 *
 * Usage:
 *   import { getSocket } from "../lib/socket";
 *   const socket = getSocket();
 */
export const getSocket = () => {
  if (!globalThis[SOCKET_GLOBAL_KEY]) {
    globalThis[SOCKET_GLOBAL_KEY] = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return globalThis[SOCKET_GLOBAL_KEY];
};

/**
 * Cleanly disconnect and discard the socket instance.
 * Call on logout to prevent stale connections.
 */
export const disconnectSocket = () => {
  const socket = globalThis[SOCKET_GLOBAL_KEY];
  if (socket) {
    socket.disconnect();
    globalThis[SOCKET_GLOBAL_KEY] = null;
  }
};
