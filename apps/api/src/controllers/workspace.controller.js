import { prisma } from "../config/db.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Name is required" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        color,
        ownerId: req.user.userId, // 🔥 from JWT
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.userId;

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      }
    });

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};