import { prisma } from "../config/db.js";
import { isWorkspaceAdmin, denyWorkspaceAccess } from "../utils/workspaceAccess.js";

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
        ownerId: req.user.userId, // from JWT
      },
    });

    await prisma.membership.create({
      data: {
        userId: req.user.userId,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });

    res.status(201).json({ ...workspace, role: "ADMIN" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.userId;

    const workspaces = await prisma.workspace.findMany({
      where: {
        archivedAt: null,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const withRoles = workspaces.map((workspace) => {
      const role =
        workspace.ownerId === userId
          ? "ADMIN"
          : workspace.members[0]?.role || "MEMBER";

      return { ...workspace, role };
    });

    res.json(withRoles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const archiveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const isAdmin = await isWorkspaceAdmin(req.user.userId, workspaceId);
    if (!isAdmin) {
      return denyWorkspaceAccess(res);
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { archivedAt: new Date() },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const isAdmin = await isWorkspaceAdmin(req.user.userId, workspaceId);
    if (!isAdmin) {
      return denyWorkspaceAccess(res);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === user.id) {
      return res.status(409).json({ msg: "User already owns this workspace" });
    }

    const existing = await prisma.membership.findFirst({
      where: { workspaceId, userId: user.id },
    });

    const assignedRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

    const membership = existing
      ? await prisma.membership.update({
          where: { id: existing.id },
          data: { role: assignedRole },
        })
      : await prisma.membership.create({
          data: {
            workspaceId,
            userId: user.id,
            role: assignedRole,
          },
        });

    res.status(201).json({
      id: membership.id,
      role: membership.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};