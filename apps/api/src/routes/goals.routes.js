import express from "express";
import { getGoals, createGoal, postGoalUpdate } from "../controllers/goals.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST create a new goal (must come first before parameterized route)
router.post("/", protect, createGoal);

// POST progress update for a goal
router.post("/:goalId/updates", protect, postGoalUpdate);

// GET goals for a workspace
router.get("/:workspaceId", protect, getGoals);

export default router;
