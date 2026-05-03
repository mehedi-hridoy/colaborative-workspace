import express from "express";
import { register, login, logout, refresh } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

console.log("AUTH ROUTES LOADED");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;