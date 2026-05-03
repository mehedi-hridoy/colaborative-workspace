import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import crypto from "crypto";

// Generate refresh token and store in database
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed, name }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Invalid credentials" });

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" } // Shorter expiry for access token
    );

    const refreshToken = await generateRefreshToken(user.id);

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ msg: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ msg: "Logged out successfully" });
};

/**
 * POST /api/auth/refresh
 * Refresh the access token using the refresh token
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

    // Find and validate refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true } } },
    });

    if (!tokenRecord) return res.status(401).json({ msg: "Invalid refresh token" });

    // Check expiry
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      res.clearCookie("refreshToken");
      return res.status(401).json({ msg: "Refresh token expired" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: tokenRecord.user.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ msg: "Token refreshed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};