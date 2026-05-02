import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/auth.middleware.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";
import { calculateGoalProgress, getGoalStatus } from "../utils/goalStatus.js";

const router = express.Router();

// Create milestone
router.post("/", protect, async (req, res) => {
  const { title, goalId } = req.body;

  if (!title || !goalId) {
    return res.status(400).json({ msg: "Title and goalId required" });
  }

  try {
    // Get goal to get workspace info
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        goalId,
      },
    });

    const goalWithMilestones = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { milestones: true },
    });

    await prisma.goal.update({
      where: { id: goalId },
      data: { status: getGoalStatus(goalWithMilestones) },
    });

    // Log activity for milestone creation
    await prisma.activity.create({
      data: {
        type: "MILESTONE_CREATED",
        message: `added step '${title}' to '${goal.title}'`,
        userId: req.user.userId,
        workspaceId: goal.workspaceId,
        goalId: goal.id,
      },
    });

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get milestones by goal
router.get("/:goalId", protect, async (req, res) => {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: req.params.goalId },
      select: { workspaceId: true },
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const milestones = await prisma.milestone.findMany({
      where: { goalId: req.params.goalId },
    });

    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle complete
router.put("/:id", protect, async (req, res) => {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: req.params.id },
      include: {
        goal: true,
      },
    });

    if (!milestone) {
      return res.status(404).json({ msg: "Milestone not found" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, milestone.goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const updated = await prisma.milestone.update({
      where: { id: req.params.id },
      data: {
        completed: !milestone.completed,
      },
    });

    const goalWithMilestones = await prisma.goal.findUnique({
      where: { id: milestone.goal.id },
      include: { milestones: true },
    });

    const status = getGoalStatus(goalWithMilestones);

    await prisma.goal.update({
      where: { id: milestone.goal.id },
      data: { status },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "MILESTONE_UPDATED",
        message: `updated '${milestone.goal.title}' progress to ${calculateGoalProgress(
          goalWithMilestones.milestones
        )}%`,
        userId: req.user.userId,
        workspaceId: milestone.goal.workspaceId,
        goalId: milestone.goal.id,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
