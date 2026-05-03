import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import { uploadAvatar, uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/avatar", protect, upload.single("file"), uploadAvatar);
router.post("/file", protect, upload.single("file"), uploadFile);

export default router;
