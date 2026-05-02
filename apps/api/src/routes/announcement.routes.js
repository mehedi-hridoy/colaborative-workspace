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

// POST /api/announcements — create announcement
router.post("/", protect, createAnnouncement);

// GET /api/announcements/:workspaceId — list workspace announcements
router.get("/:workspaceId", protect, getAnnouncements);

// POST /api/announcements/:id/react — toggle reaction
router.post("/:id/react", protect, addReaction);

// POST /api/announcements/:id/comment — add comment
router.post("/:id/comment", protect, addComment);

// PATCH /api/announcements/:id/pin — toggle pin (admin only)
router.patch("/:id/pin", protect, togglePin);

export default router;
