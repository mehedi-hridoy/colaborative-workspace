import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

console.log("AUTH ROUTES LOADED");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;