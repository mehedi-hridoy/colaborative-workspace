import { prisma } from "../config/db.js";
import { getIO } from "../socket/index.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";

// --- Shared include shape for consistent responses ---
const announcementInclude = {
  user: {
    select: { id: true, name: true, email: true, avatar: true },
  },
  reactions: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  comments: {
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  },
};

/**
 * POST /api/announcements
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { content, workspaceId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ msg: "Content is required" });
    }
    if (!workspaceId) {
      return res.status(400).json({ msg: "workspaceId is required" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const announcement = await prisma.announcement.create({
      data: {
        content: content.trim(),
        userId: req.user.userId,
        workspaceId,
      },
      include: announcementInclude,
    });

    // Emit real-time event
    try {
      const io = getIO();
      io.to(`workspace_${workspaceId}`).emit("announcement:new", announcement);
    } catch {}

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/announcements/:workspaceId
 */
export const getAnnouncements = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const announcements = await prisma.announcement.findMany({
      where: { workspaceId },
      include: announcementInclude,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/announcements/:id/react
 */
export const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ msg: "emoji is required" });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, workspaceId: true },
    });

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    // Toggle: remove if exists, add if not
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_announcementId_emoji: {
          userId: req.user.userId,
          announcementId: id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: {
          emoji,
          userId: req.user.userId,
          announcementId: id,
        },
      });
    }

    // Fetch updated announcement with all relations
    const updated = await prisma.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });

    // Emit real-time event
    try {
      const io = getIO();
      io.to(`workspace_${announcement.workspaceId}`).emit("announcement:reaction", updated);
    } catch {}

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/announcements/:id/comment
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ msg: "message is required" });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, workspaceId: true },
    });

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    await prisma.comment.create({
      data: {
        message: message.trim(),
        userId: req.user.userId,
        announcementId: id,
      },
    });

    // Fetch updated announcement with all relations
    const updated = await prisma.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });

    // Emit real-time event
    try {
      const io = getIO();
      io.to(`workspace_${announcement.workspaceId}`).emit("announcement:comment", updated);
    } catch {}

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/announcements/:id/pin
 */
export const togglePin = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, isPinned: true, workspaceId: true },
    });

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    // Only workspace owner or admin can pin
    const workspace = await prisma.workspace.findUnique({
      where: { id: announcement.workspaceId },
      select: { ownerId: true },
    });

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        workspaceId: announcement.workspaceId,
        role: "ADMIN",
      },
    });

    if (workspace.ownerId !== req.user.userId && !membership) {
      return res.status(403).json({ msg: "Only admins can pin announcements" });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isPinned: !announcement.isPinned },
      include: announcementInclude,
    });

    // Emit real-time event
    try {
      const io = getIO();
      io.to(`workspace_${announcement.workspaceId}`).emit("announcement:pin", updated);
    } catch {}

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
