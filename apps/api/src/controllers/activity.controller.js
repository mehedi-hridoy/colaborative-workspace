import { prisma } from "../config/db.js";
import { ACTIVITY_TYPES } from "../utils/activityTypes.js";
import { getIO } from "../socket/index.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";

/**
 * POST /api/activity
 * Create a progress update activity for a goal.
 *
 * Derives workspaceId from the goal — never hardcoded.
 */
export const createProgressUpdate = async (req, res) => {
  try {
    const { goalId, message } = req.body;

    // --- Validation ---
    if (!goalId) {
      return res.status(400).json({ msg: "goalId is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ msg: "message is required" });
    }

    // --- Fetch goal to derive workspaceId ---
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { id: true, workspaceId: true },
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    // --- Create activity record ---
    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const activity = await prisma.activity.create({
      data: {
        type: ACTIVITY_TYPES.PROGRESS_UPDATE,
        message: message.trim(),
        userId: req.user.userId,
        workspaceId: goal.workspaceId,
        goalId,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    const io = getIO();
    io.to(`workspace_${goal.workspaceId}`).emit("activity:new", activity);

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/activity/goal/:goalId
 * Fetch the activity feed for a specific goal, newest first.
 */
export const getGoalActivityFeed = async (req, res) => {
  try {
    const { goalId } = req.params;

    // --- Verify goal exists ---
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { id: true, workspaceId: true },
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    // --- Fetch activities ---
    const activities = await prisma.activity.findMany({
      where: { goalId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
