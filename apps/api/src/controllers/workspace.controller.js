import { prisma } from "../config/db.js";
import { isWorkspaceAdmin, canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";
import { getUserRole } from "../utils/permissions.js";

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

    const assignedRole = ["ADMIN", "MEMBER", "VIEWER"].includes(role) ? role : "MEMBER";

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

// ─── GET /api/workspaces/:workspaceId/members ────────────────────────────────
export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) return denyWorkspaceAccess(res);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!workspace) return res.status(404).json({ msg: "Workspace not found" });

    // Deduplicate: owner + all members
    const seen = new Set();
    const members = [];

    const push = (user, role) => {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        members.push({ ...user, role });
      }
    };

    push(workspace.owner, "ADMIN");
    workspace.members.forEach((m) => push(m.user, m.role));

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PATCH /api/workspaces/:workspaceId/members/:memberId/role ────────────────
export const changeMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role. Must be ADMIN, MEMBER, or VIEWER" });
    }

    const isAdmin = await isWorkspaceAdmin(req.user.userId, workspaceId);
    if (!isAdmin) return denyWorkspaceAccess(res);

    // Cannot change the owner's role
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    const membership = await prisma.membership.findUnique({
      where: { id: memberId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!membership || membership.workspaceId !== workspaceId) {
      return res.status(404).json({ msg: "Member not found" });
    }

    if (membership.userId === workspace?.ownerId) {
      return res.status(403).json({ msg: "Cannot change the workspace owner's role" });
    }

    const updated = await prisma.membership.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/workspaces/:workspaceId/members/:memberId ────────────────────
export const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const isAdmin = await isWorkspaceAdmin(req.user.userId, workspaceId);
    if (!isAdmin) return denyWorkspaceAccess(res);

    const membership = await prisma.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.workspaceId !== workspaceId) {
      return res.status(404).json({ msg: "Member not found" });
    }

    // Cannot remove workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (membership.userId === workspace?.ownerId) {
      return res.status(403).json({ msg: "Cannot remove the workspace owner" });
    }

    await prisma.membership.delete({ where: { id: memberId } });
    res.json({ msg: "Member removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/workspaces/:workspaceId/my-role ────────────────────────────────
export const getMyRole = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const role = await getUserRole(req.user.userId, workspaceId);
    if (!role) return res.status(403).json({ msg: "Not a member" });

    const { getPermissionsForRole } = await import("../utils/permissions.js");
    res.json({ role, permissions: getPermissionsForRole(role) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};