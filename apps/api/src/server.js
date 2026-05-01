import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});