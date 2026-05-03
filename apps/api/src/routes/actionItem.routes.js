import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createActionItem,
  getActionItemsByGoal,
  updateStatus,
  updateActionItem,
  deleteActionItem,
} from "../controllers/actionItem.controller.js";

const router = express.Router();

// POST   /api/action-items          — create
router.post("/", protect, createActionItem);

// GET    /api/action-items/goal/:goalId — list by goal
// NOTE: must be defined BEFORE /:id routes to avoid "goal" being captured as an id
router.get("/goal/:goalId", protect, getActionItemsByGoal);

// PATCH  /api/action-items/:id/status  — status only
router.patch("/:id/status", protect, updateStatus);

// PATCH  /api/action-items/:id         — full update
router.patch("/:id", protect, updateActionItem);

// DELETE /api/action-items/:id
router.delete("/:id", protect, deleteActionItem);

export default router;
