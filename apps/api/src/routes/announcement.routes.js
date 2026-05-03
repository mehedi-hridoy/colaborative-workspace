import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  addReaction,
  addComment,
  togglePin,
} from "../controllers/announcement.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Workspace-wide announcements and interactions
 */

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create a new announcement
 *     tags: [Announcements]
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
 *               - content
 *               - workspaceId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created
 */
router.post("/", protect, createAnnouncement);

/**
 * @swagger
 * /api/announcements/{workspaceId}:
 *   get:
 *     summary: Get all announcements for a workspace
 *     tags: [Announcements]
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
 *         description: List of announcements
 */
router.get("/:workspaceId", protect, getAnnouncements);

/**
 * @swagger
 * /api/announcements/{id}/react:
 *   post:
 *     summary: Toggle reaction on an announcement
 *     tags: [Announcements]
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
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction toggled
 */
router.post("/:id/react", protect, addReaction);

/**
 * @swagger
 * /api/announcements/{id}/comment:
 *   post:
 *     summary: Add a comment to an announcement
 *     tags: [Announcements]
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post("/:id/comment", protect, addComment);

/**
 * @swagger
 * /api/announcements/{id}/pin:
 *   patch:
 *     summary: Toggle pinned status (Admin only)
 *     tags: [Announcements]
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
 *         description: Pin status toggled
 */
router.patch("/:id/pin", protect, togglePin);


export default router;
