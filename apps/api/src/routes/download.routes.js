import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { prisma } from "../config/db.js";
import { canAccessWorkspace } from "../utils/workspaceAccess.js";
import https from "https";
import http from "http";

const router = express.Router();

/**
 * GET /api/download/:attachmentId
 * Proxy download for files stored in Cloudinary
 * Avoids direct Cloudinary domain access issues
 */
router.get("/:attachmentId", protect, async (req, res) => {
  const { attachmentId } = req.params;
  console.log(`📥 Download request for attachment: ${attachmentId}`);

  try {
    // Fetch attachment from DB
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        goal: { select: { workspaceId: true } },
        announcement: { select: { workspaceId: true } },
        activity: { select: { workspaceId: true } },
      },
    });

    if (!attachment) {
      console.error(`❌ Attachment not found: ${attachmentId}`);
      return res.status(404).json({ msg: "File not found" });
    }

    console.log(`✓ Attachment found: ${attachment.name}, URL: ${attachment.url}`);

    // Determine workspace and check access
    const workspaceId =
      attachment.goal?.workspaceId ||
      attachment.announcement?.workspaceId ||
      attachment.activity?.workspaceId;

    console.log(`✓ Workspace ID: ${workspaceId}`);

    if (workspaceId) {
      const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
      if (!hasAccess) {
        console.error(`❌ Access denied for user ${req.user.userId} to workspace ${workspaceId}`);
        return res.status(403).json({ msg: "Access denied" });
      }
      console.log(`✓ Access granted`);
    }

    // Fetch file from Cloudinary
    const fileUrl = new URL(attachment.url);
    const protocol = fileUrl.protocol === "https:" ? https : http;

    console.log(`📡 Fetching from Cloudinary: ${attachment.url}`);

    const cloudinaryRequest = protocol.get(attachment.url, (fileResponse) => {
      console.log(`📥 Cloudinary response status: ${fileResponse.statusCode}`);

      if (fileResponse.statusCode !== 200) {
        console.error(`❌ Cloudinary returned status ${fileResponse.statusCode}`);
        if (!res.writableEnded) {
          return res.status(500).json({ msg: "Failed to fetch file from Cloudinary" });
        }
        return;
      }

      // Set proper headers for download
      const fileName = attachment.name || `download_${Date.now()}`;
      res.setHeader("Content-Type", attachment.type || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Cache-Control", "public, max-age=86400");

      console.log(`✓ Streaming file: ${fileName}`);
      fileResponse.pipe(res);
    });

    cloudinaryRequest.on("error", (err) => {
      console.error(`❌ Cloudinary fetch error:`, err.message);
      if (!res.writableEnded) {
        res.status(500).json({ msg: "Failed to fetch file from Cloudinary" });
      }
    });

    res.on("error", (err) => {
      console.error(`❌ Response error:`, err.message);
    });
  } catch (err) {
    console.error(`❌ Download error:`, err.message);
    if (!res.writableEnded) {
      res.status(500).json({ msg: "Download failed", error: err.message });
    }
  }
});

export default router;
