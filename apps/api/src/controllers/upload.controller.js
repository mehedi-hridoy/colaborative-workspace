import { prisma } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Upload Avatar — save locally
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    if (req.file.size > 5 * 1024 * 1024) return res.status(400).json({ msg: "File size exceeds 5MB limit" });

    const ext = path.extname(req.file.originalname || ".png");
    const storedName = `avatar_${req.user.userId}_${Date.now()}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, storedName), req.file.buffer);

    const baseUrl = process.env.API_URL || "http://localhost:5000";
    const avatarUrl = `${baseUrl}/api/files/${storedName}`;
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: avatarUrl },
    });

    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    res.status(500).json({ msg: "Error uploading avatar" });
  }
};

// Upload any file — save locally, return URL via /api/files/
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    if (req.file.size > 10 * 1024 * 1024) return res.status(400).json({ msg: "File size exceeds 10MB limit" });

    const { goalId, activityId, announcementId } = req.body;
    const originalName = req.file.originalname || `file_${Date.now()}`;
    const ext = path.extname(originalName);
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const storedName = `${uniqueId}${ext}`;

    // Write to disk
    fs.writeFileSync(path.join(UPLOADS_DIR, storedName), req.file.buffer);
    console.log(`📁 Saved: ${originalName} → ${storedName} (${req.file.size} bytes)`);

    const baseUrl = process.env.API_URL || "http://localhost:5000";
    const fileUrl = `${baseUrl}/api/files/${storedName}`;

    const data = {
      url: fileUrl,
      type: req.file.mimetype,
      name: originalName,
      userId: req.user.userId,
    };
    if (goalId) data.goalId = goalId;
    if (activityId) data.activityId = activityId;
    if (announcementId) data.announcementId = announcementId;

    const file = await prisma.attachment.create({ data });
    res.json(file);
  } catch (err) {
    console.error("uploadFile error:", err);
    res.status(500).json({ msg: "Error uploading file" });
  }
};
