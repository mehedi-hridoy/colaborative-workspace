import express from "express";
import { getGoals, createGoal, postGoalUpdate, deleteGoal } from "../controllers/goals.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST create a new goal (must come first before parameterized route)
/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Goal tracking and progress updates
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - workspaceId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
router.post("/", protect, createGoal);

/**
 * @swagger
 * /api/goals/{goalId}/updates:
 *   post:
 *     summary: Post a progress update for a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updateText
 *             properties:
 *               updateText:
 *                 type: string
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Update posted
 */
router.post("/:goalId/updates", protect, postGoalUpdate);

/**
 * @swagger
 * /api/goals/{workspaceId}:
 *   get:
 *     summary: Get all goals for a workspace
 *     tags: [Goals]
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
 *         description: List of goals
 */
router.get("/:workspaceId", protect, getGoals);

/**
 * @swagger
 * /api/goals/{goalId}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal deleted
 */
router.delete("/:goalId", protect, deleteGoal);


export default router;
