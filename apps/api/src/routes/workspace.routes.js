import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  archiveWorkspace,
  inviteMember,
} from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);
router.post("/:workspaceId/invite", protect, inviteMember);
router.patch("/:workspaceId/archive", protect, archiveWorkspace);



export default router;