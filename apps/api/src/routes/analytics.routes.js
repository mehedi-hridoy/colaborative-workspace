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

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Workspace statistics and reports
 */

// GET /api/analytics/:workspaceId — workspace stats snapshot
/**
 * @swagger
 * /api/analytics/{workspaceId}:
 *   get:
 *     summary: Get workspace analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalGoals:
 *                   type: integer
 *                 completedGoals:
 *                   type: integer
 *                 overdueGoals:
 *                   type: integer
 *                 totalMilestones:
 *                   type: integer
 */
router.get("/:workspaceId", protect, getAnalytics);

// GET /api/analytics/:workspaceId/goal-chart — goal completion chart data
/**
 * @swagger
 * /api/analytics/{workspaceId}/goal-chart:
 *   get:
 *     summary: Get goal completion chart data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chart data for goals
 */
router.get("/:workspaceId/goal-chart", protect, getGoalChart);

// GET /api/analytics/:workspaceId/action-item-chart — action item completion chart data
router.get("/:workspaceId/action-item-chart", protect, getActionItemChart);

// GET /api/analytics/:workspaceId/members — member productivity stats
router.get("/:workspaceId/members", protect, getMemberStats);

// GET /api/analytics/:workspaceId/export — CSV export
router.get("/:workspaceId/export", protect, exportData);

export default router;
