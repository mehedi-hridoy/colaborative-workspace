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

dotenv.config();

const app = express();

// middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/announcements", announcementRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

// start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});