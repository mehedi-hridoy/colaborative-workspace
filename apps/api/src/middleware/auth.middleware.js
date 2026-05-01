// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.user = { ...user, userId: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};