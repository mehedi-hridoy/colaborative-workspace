import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { canAccessWorkspace } from "../utils/workspaceAccess.js";

let io;

/**
 * Initialize Socket.io server.
 * Attaches to the existing HTTP server instance.
 *
 * Responsibilities:
 *   - Manage workspace-based rooms
 *   - Handle connection lifecycle
 *   - Validate room joins
 *
 * Socket logic stays HERE — controllers only call getIO() to emit.
 */
const getUserIdFromSocket = (socket) => {
  const cookieHeader = socket.request.headers.cookie || "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // --- Auto-join the user's personal room for notifications ---
    const connectedUserId = getUserIdFromSocket(socket);
    if (connectedUserId) {
      socket.join(`user_${connectedUserId}`);
      console.log(`🔔 ${socket.id} joined user_${connectedUserId}`);
    }
    // --- Online presence tracking ---
    // store socketId -> { userId, workspaceId }
    socket.on("join_workspace", async (workspaceId) => {
      if (!workspaceId) return;

      const userId = getUserIdFromSocket(socket);
      if (!userId) {
        socket.emit("socket:error", { msg: "Unauthorized" });
        return;
      }

      try {
        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { id: true },
        });

        if (!workspace) {
          socket.emit("socket:error", { msg: "Workspace not found" });
          return;
        }

        const hasAccess = await canAccessWorkspace(userId, workspaceId);
        if (!hasAccess) {
          socket.emit("socket:error", { msg: "Forbidden" });
          return;
        }

        socket.join(`workspace_${workspaceId}`);
        socket.data.userId = userId;
        socket.data.workspaceId = workspaceId;
        console.log(`📥 ${socket.id} joined workspace_${workspaceId}`);

        // Emit presence update
        const clients = await io.in(`workspace_${workspaceId}`).fetchSockets();
        const onlineUsers = Array.from(new Set(clients.map((c) => c.data.userId).filter(Boolean)));
        io.to(`workspace_${workspaceId}`).emit("presence:update", onlineUsers);
      } catch (err) {
        console.error("join_workspace error:", err.message);
      }
    });

    // --- Leave a workspace room ---
    socket.on("leave_workspace", async (workspaceId) => {
      if (!workspaceId) return;

      socket.leave(`workspace_${workspaceId}`);
      delete socket.data.workspaceId;
      console.log(`📤 ${socket.id} left workspace_${workspaceId}`);

      // Emit presence update
      const clients = await io.in(`workspace_${workspaceId}`).fetchSockets();
      const onlineUsers = Array.from(new Set(clients.map((c) => c.data.userId).filter(Boolean)));
      io.to(`workspace_${workspaceId}`).emit("presence:update", onlineUsers);
    });

    // --- Disconnect ---
    socket.on("disconnect", async () => {
      console.log("🔌 Socket disconnected:", socket.id);
      if (socket.data.workspaceId) {
        const workspaceId = socket.data.workspaceId;
        const clients = await io.in(`workspace_${workspaceId}`).fetchSockets();
        const onlineUsers = Array.from(new Set(clients.map((c) => c.data.userId).filter(Boolean)));
        io.to(`workspace_${workspaceId}`).emit("presence:update", onlineUsers);
      }
    });
  });

  return io;
};

/**
 * Get the initialized Socket.io server instance.
 * Used by controllers to emit events after DB operations.
 */
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
