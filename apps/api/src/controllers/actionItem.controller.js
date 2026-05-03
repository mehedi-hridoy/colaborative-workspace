import { prisma } from "../config/db.js";
import { getIO } from "../socket/index.js";
import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";

// ─── Shared include shape ────────────────────────────────────────────────────
const itemInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  goal: { select: { id: true, title: true, workspaceId: true } },
};

const VALID_STATUSES  = ["todo", "in-progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const emitToWorkspace = (workspaceId, event, payload) => {
  try { getIO().to(`workspace_${workspaceId}`).emit(event, payload); } catch {}
};

// ─── POST /api/action-items ───────────────────────────────────────────────────
export const createActionItem = async (req, res) => {
  try {
    const { title, description, goalId, assigneeId, priority, dueDate, status } = req.body;

    if (!title?.trim()) return res.status(400).json({ msg: "Title is required" });
    if (!goalId)        return res.status(400).json({ msg: "goalId is required" });

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { id: true, workspaceId: true },
    });
    if (!goal) return res.status(404).json({ msg: "Goal not found" });

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
      if (!assignee) return res.status(404).json({ msg: "Assignee not found" });
    }

    const resolvedStatus   = VALID_STATUSES.includes(status)     ? status   : "todo";
    const resolvedPriority = VALID_PRIORITIES.includes(priority)  ? priority : "medium";

    const item = await prisma.actionItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        goalId,
        assigneeId: assigneeId || null,
        priority: resolvedPriority,
        status: resolvedStatus,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: itemInclude,
    });

    emitToWorkspace(goal.workspaceId, "task:new", item);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/action-items/goal/:goalId ──────────────────────────────────────
export const getActionItemsByGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { id: true, workspaceId: true },
    });
    if (!goal) return res.status(404).json({ msg: "Goal not found" });

    const hasAccess = await canAccessWorkspace(req.user.userId, goal.workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const items = await prisma.actionItem.findMany({
      where: { goalId },
      include: itemInclude,
      orderBy: [{ createdAt: "desc" }],
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PATCH /api/action-items/:id/status ──────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ msg: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const existing = await prisma.actionItem.findUnique({
      where: { id },
      include: { goal: { select: { workspaceId: true } } },
    });
    if (!existing) return res.status(404).json({ msg: "Action item not found" });

    const hasAccess = await canAccessWorkspace(req.user.userId, existing.goal.workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const item = await prisma.actionItem.update({
      where: { id },
      data: { status },
      include: itemInclude,
    });

    emitToWorkspace(existing.goal.workspaceId, "task:update", item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PATCH /api/action-items/:id ─────────────────────────────────────────────
export const updateActionItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, assigneeId, status } = req.body;

    const existing = await prisma.actionItem.findUnique({
      where: { id },
      include: { goal: { select: { workspaceId: true } } },
    });
    if (!existing) return res.status(404).json({ msg: "Action item not found" });

    const hasAccess = await canAccessWorkspace(req.user.userId, existing.goal.workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const item = await prisma.actionItem.update({
      where: { id },
      data: {
        ...(title     ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(priority && VALID_PRIORITIES.includes(priority) ? { priority } : {}),
        ...(status   && VALID_STATUSES.includes(status)    ? { status }   : {}),
        ...(dueDate  !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
      },
      include: itemInclude,
    });

    emitToWorkspace(existing.goal.workspaceId, "task:update", item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/action-items/:id ────────────────────────────────────────────
export const deleteActionItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.actionItem.findUnique({
      where: { id },
      include: { goal: { select: { workspaceId: true } } },
    });
    if (!existing) return res.status(404).json({ msg: "Action item not found" });

    const hasAccess = await canAccessWorkspace(req.user.userId, existing.goal.workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    await prisma.actionItem.delete({ where: { id } });

    emitToWorkspace(existing.goal.workspaceId, "task:delete", {
      id,
      goalId: existing.goalId,
    });

    res.json({ msg: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
