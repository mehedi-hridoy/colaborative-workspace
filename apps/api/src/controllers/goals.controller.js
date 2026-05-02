import { prisma } from "../config/db.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";
import { getGoalStatus } from "../utils/goalStatus.js";

export const getGoals = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const goals = await prisma.goal.findMany({
      where: {
        workspaceId,
      },
      include: {
        milestones: true,
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(goals.map((goal) => ({ ...goal, status: getGoalStatus(goal) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, description, dueDate, workspaceId } = req.body;

    if (!title || !workspaceId) {
      return res.status(400).json({ msg: "Title and workspace ID are required" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "open",
        workspaceId,
        ownerId: req.user.id,
      },
      include: {
        owner: true,
        milestones: true,
      },
    });

    // Log activity for goal creation
    await prisma.activity.create({
      data: {
        type: "GOAL_CREATED",
        message: `created goal '${title}'`,
        userId: req.user.id,
        workspaceId,
        goalId: goal.id,
      },
    });

    res.status(201).json({ ...goal, status: getGoalStatus(goal) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postGoalUpdate = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ msg: "Update message is required" });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { milestones: true },
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const activity = await prisma.activity.create({
      data: {
        type: "GOAL_PROGRESS_UPDATE",
        message: `posted on '${goal.title}': ${message.trim()}`,
        userId: req.user.id,
        workspaceId: goal.workspaceId,
        goalId: goal.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
