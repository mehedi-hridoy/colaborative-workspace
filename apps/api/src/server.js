import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import milestoneRoutes from "./routes/milestone.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import actionItemRoutes from "./routes/actionItem.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import filesRoutes from "./routes/files.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { corsOriginValidator } from "./config/cors.js";


dotenv.config();

const app = express();

// middleware
app.use(cors({ credentials: true, origin: corsOriginValidator }));
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/action-items", actionItemRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/files", filesRoutes);

// Swagger documentation
app.use("/api/docs", swaggerUi.serve);
app.get("/api/docs", swaggerUi.setup(swaggerSpec));


app.get("/api/test", (req, res) => {
  res.send("API test route works!");
});



// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

// start server
const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing process and try again.`);
    process.exit(1);
  }

  console.error("Server error:", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});