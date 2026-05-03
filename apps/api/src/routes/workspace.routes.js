import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  archiveWorkspace,
  inviteMember,
  getWorkspaceMembers,
  changeMemberRole,
  removeMember,
  getMyRole,
} from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management and membership
 */

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created successfully
 */
router.post("/", protect, createWorkspace);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for the current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get("/", protect, getWorkspaces);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/invite:
 *   post:
 *     summary: Invite a member to a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Member invited successfully
 */
router.post("/:workspaceId/invite", protect, inviteMember);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/archive:
 *   patch:
 *     summary: Archive a workspace
 *     tags: [Workspaces]
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
 *         description: Workspace archived
 */
router.patch("/:workspaceId/archive", protect, archiveWorkspace);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   get:
 *     summary: Get members of a workspace
 *     tags: [Workspaces]
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
 *         description: List of members
 */
router.get("/:workspaceId/members", protect, getWorkspaceMembers);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}/role:
 *   patch:
 *     summary: Change a member's role
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/:workspaceId/members/:memberId/role", protect, changeMemberRole);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
router.delete("/:workspaceId/members/:memberId", protect, removeMember);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/my-role:
 *   get:
 *     summary: Get the current user's role in a workspace
 *     tags: [Workspaces]
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
 *         description: User's role
 */
router.get("/:workspaceId/my-role", protect, getMyRole);


export default router;