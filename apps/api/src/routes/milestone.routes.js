import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create milestone
router.post("/", protect, async (req, res) => {
  const { title, goalId } = req.body;

  if (!title || !goalId) {
    return res.status(400).json({ msg: "Title and goalId required" });
  }

  try {
    const milestone = await prisma.milestone.create({
      data: {
        title,
        goalId,
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
    });

    const updated = await prisma.milestone.update({
      where: { id: req.params.id },
      data: {
        completed: !milestone.completed,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;