import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import milestoneRoutes from "./routes/milestone.routes.js";
import activityRoutes from "./routes/activity.routes.js";

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

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});