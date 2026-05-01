import express from "express";
import { getGoals, createGoal } from "../controllers/goals.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST create a new goal (must come first before parameterized route)
router.post("/", protect, createGoal);

// GET goals for a workspace
router.get("/:workspaceId", protect, getGoals);

export default router;
