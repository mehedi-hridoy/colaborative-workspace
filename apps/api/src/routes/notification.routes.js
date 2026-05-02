import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markOneRead,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// GET /api/notifications — list all for current user
router.get("/", protect, getNotifications);

// PATCH /api/notifications/read-all — mark all as read
// NOTE: must be defined BEFORE /:id/read to avoid "read-all" being captured as an :id
router.patch("/read-all", protect, markAllRead);

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", protect, markOneRead);

export default router;
