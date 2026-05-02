import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/auth.middleware.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";
import {
  createProgressUpdate,
  getGoalActivityFeed,
} from "../controllers/activity.controller.js";

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/activity — create a progress update
// ──────────────────────────────────────────────
router.post("/", protect, createProgressUpdate);

// ──────────────────────────────────────────────
// GET /api/activity/goal/:goalId — activity feed per goal
// ──────────────────────────────────────────────
router.get("/goal/:goalId", protect, getGoalActivityFeed);

// ──────────────────────────────────────────────
// GET /api/activity/:workspaceId — activities for a workspace
// (existing route — preserved)
// ──────────────────────────────────────────────
router.get("/:workspaceId", protect, async (req, res) => {
  try {
    const hasAccess = await canAccessWorkspace(req.user.userId, req.params.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const activities = await prisma.activity.findMany({
      where: {
        workspaceId: req.params.workspaceId,
        ...(req.query.goalId ? { goalId: req.query.goalId } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
