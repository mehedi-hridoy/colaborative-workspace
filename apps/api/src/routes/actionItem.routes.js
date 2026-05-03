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

/**
 * @swagger
 * tags:
 *   name: Action Items
 *   description: Task management with Kanban support
 */

// POST   /api/action-items          — create
/**
 * @swagger
 * /api/action-items:
 *   post:
 *     summary: Create a new action item
 *     tags: [Action Items]
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
 *               - goalId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               goalId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *     responses:
 *       201:
 *         description: Action item created
 */
router.post("/", protect, createActionItem);

// GET    /api/action-items/goal/:goalId — list by goal
// NOTE: must be defined BEFORE /:id routes to avoid "goal" being captured as an id
/**
 * @swagger
 * /api/action-items/goal/{goalId}:
 *   get:
 *     summary: Get action items for a goal
 *     tags: [Action Items]
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
 *         description: List of action items
 */
router.get("/goal/:goalId", protect, getActionItemsByGoal);

// PATCH  /api/action-items/:id/status  — status only
/**
 * @swagger
 * /api/action-items/{id}/status:
 *   patch:
 *     summary: Update action item status
 *     tags: [Action Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", protect, updateStatus);

// PATCH  /api/action-items/:id         — full update
/**
 * @swagger
 * /api/action-items/{id}:
 *   patch:
 *     summary: Update action item details
 *     tags: [Action Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action item updated
 */
router.patch("/:id", protect, updateActionItem);

// DELETE /api/action-items/:id
/**
 * @swagger
 * /api/action-items/{id}:
 *   delete:
 *     summary: Delete action item
 *     tags: [Action Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Action item deleted
 */
router.delete("/:id", protect, deleteActionItem);

export default router;
