import { prisma } from "../config/db.js";

export const getGoals = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const goals = await prisma.goal.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, description, workspaceId } = req.body;

    if (!title || !workspaceId) {
      return res.status(400).json({ msg: "Title and workspace ID are required" });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        status: "pending",
        workspaceId,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
