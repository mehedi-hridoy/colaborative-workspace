import cloudinary from "../config/cloudinary.js";
import { prisma } from "../config/db.js";

// Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Validate size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ msg: "File size exceeds 5MB limit" });
    }

    cloudinary.uploader.upload_stream(
      { folder: "avatars" },
      async (error, result) => {
        if (error) return res.status(500).json({ msg: "Upload failed" });

        await prisma.user.update({
          where: { id: req.user.userId },
          data: { avatar: result.secure_url },
        });

        res.json({ avatar: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ msg: "Error uploading avatar" });
  }
};

// Generic File Upload for Attachments
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { goalId, activityId, announcementId } = req.body;

    // Validate size (max 10MB for general files)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ msg: "File size exceeds 10MB limit" });
    }

    // Determine the correct Cloudinary resource_type:
    // - "image" for images
    // - "video" for video/audio
    // - "raw" for everything else (PDF, DOC, DOCX, TXT, etc.)
    const mime = req.file.mimetype || "";
    let resourceType = "raw";
    if (mime.startsWith("image/")) resourceType = "image";
    else if (mime.startsWith("video/") || mime.startsWith("audio/")) resourceType = "video";

    const uploadOptions = {
      folder: "attachments",
      resource_type: resourceType,
    };

    // For raw files, preserve the original extension so Cloudinary serves them correctly
    if (resourceType === "raw" && req.file.originalname) {
      // Extract file extension
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      // Clean filename (remove extension, sanitize)
      const cleanName = req.file.originalname
        .replace(/\.[^.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9._-]/g, "_"); // Sanitize
      
      // Set public_id with sanitized name and explicit format
      uploadOptions.public_id = `${Date.now()}_${cleanName}`;
      uploadOptions.format = ext; // Explicitly set format to preserve extension
      uploadOptions.unique_filename = true; // Ensure uniqueness
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ msg: "Upload failed", error: error.message });
        }

        const data = {
          url: result.secure_url,
          type: req.file.mimetype,
          name: req.file.originalname || null,
          userId: req.user.userId,
        };

        if (goalId) data.goalId = goalId;
        if (activityId) data.activityId = activityId;
        if (announcementId) data.announcementId = announcementId;

        const file = await prisma.attachment.create({
          data,
        });

        res.json(file);
      }
    ).end(req.file.buffer);
  } catch (err) {
    console.error("uploadFile error:", err);
    res.status(500).json({ msg: "Error uploading file" });
  }
};
