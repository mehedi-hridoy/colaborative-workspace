import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getAnalytics,
  getGoalChart,
  getActionItemChart,
  getMemberStats,
  exportData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// GET /api/analytics/:workspaceId — workspace stats snapshot
router.get("/:workspaceId", protect, getAnalytics);

// GET /api/analytics/:workspaceId/goal-chart — goal completion chart data
router.get("/:workspaceId/goal-chart", protect, getGoalChart);

// GET /api/analytics/:workspaceId/action-item-chart — action item completion chart data
router.get("/:workspaceId/action-item-chart", protect, getActionItemChart);

// GET /api/analytics/:workspaceId/members — member productivity stats
router.get("/:workspaceId/members", protect, getMemberStats);

// GET /api/analytics/:workspaceId/export — CSV export
router.get("/:workspaceId/export", protect, exportData);

export default router;
