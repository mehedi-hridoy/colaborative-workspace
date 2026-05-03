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

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);
router.post("/:workspaceId/invite", protect, inviteMember);
router.patch("/:workspaceId/archive", protect, archiveWorkspace);
router.get("/:workspaceId/members", protect, getWorkspaceMembers);
router.patch("/:workspaceId/members/:memberId/role", protect, changeMemberRole);
router.delete("/:workspaceId/members/:memberId", protect, removeMember);
router.get("/:workspaceId/my-role", protect, getMyRole);

export default router;