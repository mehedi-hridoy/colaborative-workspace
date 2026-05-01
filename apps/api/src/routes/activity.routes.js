import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get activities for workspace
router.get("/:workspaceId", protect, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
