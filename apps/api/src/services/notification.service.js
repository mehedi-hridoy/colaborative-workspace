import { prisma } from "../config/db.js";
import { getIO } from "../socket/index.js";

/**
 * Create a notification, store it in DB, then push it via Socket.io
 * to the recipient's private room (`user_<userId>`).
 *
 * Never notifies a user of their own actions (actorId === userId guard).
 */
export const createNotification = async ({
  type,
  message,
  userId,
  actorId,
  workspaceId,
  goalId = null,
}) => {
  // Don't notify users of their own actions
  if (userId === actorId) return null;

  const notification = await prisma.notification.create({
    data: {
      type,
      message,
      userId,
      actorId,
      workspaceId,
      goalId,
    },
    include: {
      actor: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  // Deliver real-time — fire and forget, never throw
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit("notification:new", notification);
  } catch {
    // Socket may not be initialized in tests — safe to ignore
  }

  return notification;
};
