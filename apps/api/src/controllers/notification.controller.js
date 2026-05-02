import { prisma } from "../config/db.js";

/**
 * GET /api/notifications
 * Returns all notifications for the authenticated user, newest first.
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      include: {
        actor: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // cap to last 50 for performance
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read (must belong to the requester).
 */
export const markOneRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark ALL unread notifications for the authenticated user as read.
 */
export const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ msg: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
