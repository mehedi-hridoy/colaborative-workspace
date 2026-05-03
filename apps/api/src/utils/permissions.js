import { prisma } from "../config/db.js";

// ─── Role hierarchy: ADMIN > MEMBER > VIEWER ────────────────────────────────
const ROLES = { ADMIN: 3, MEMBER: 2, VIEWER: 1 };

// ─── Permissions matrix ─────────────────────────────────────────────────────
const PERMISSIONS = {
  // Workspace management
  "workspace:invite":     ["ADMIN"],
  "workspace:remove":     ["ADMIN"],
  "workspace:archive":    ["ADMIN"],
  "workspace:changeRole": ["ADMIN"],

  // Goals
  "goal:create":          ["ADMIN", "MEMBER"],
  "goal:edit":            ["ADMIN", "MEMBER"],
  "goal:delete":          ["ADMIN"],

  // Action Items
  "task:create":          ["ADMIN", "MEMBER"],
  "task:edit":            ["ADMIN", "MEMBER"],
  "task:delete":          ["ADMIN", "MEMBER"],
  "task:statusUpdate":    ["ADMIN", "MEMBER"],

  // Announcements
  "announcement:create":  ["ADMIN", "MEMBER"],
  "announcement:pin":     ["ADMIN"],
  "announcement:react":   ["ADMIN", "MEMBER", "VIEWER"],
  "announcement:comment": ["ADMIN", "MEMBER", "VIEWER"],

  // Activity
  "activity:post":        ["ADMIN", "MEMBER"],

  // Read-only — everyone
  "read":                 ["ADMIN", "MEMBER", "VIEWER"],
};

/**
 * Get a user's role in a workspace.
 * Returns "ADMIN" | "MEMBER" | "VIEWER" | null
 */
export const getUserRole = async (userId, workspaceId) => {
  if (!userId || !workspaceId) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  // Workspace owner is always ADMIN
  if (workspace?.ownerId === userId) return "ADMIN";

  const membership = await prisma.membership.findFirst({
    where: { workspaceId, userId },
    select: { role: true },
  });

  return membership?.role || null;
};

/**
 * Check if a user has a specific permission in a workspace.
 */
export const hasPermission = async (userId, workspaceId, permission) => {
  const role = await getUserRole(userId, workspaceId);
  if (!role) return false;

  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;

  return allowedRoles.includes(role);
};

/**
 * Express middleware factory — checks permission before proceeding.
 * Reads workspaceId from req.params.workspaceId, req.body.workspaceId,
 * or req.query.workspaceId.
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ msg: "workspaceId is required" });
    }

    const allowed = await hasPermission(req.user.userId, workspaceId, permission);
    if (!allowed) {
      return res.status(403).json({
        msg: "You do not have permission to perform this action",
        required: permission,
      });
    }

    // Attach role to request for downstream use
    req.userRole = await getUserRole(req.user.userId, workspaceId);
    next();
  };
};

/**
 * Get all permissions for a role (used by frontend).
 */
export const getPermissionsForRole = (role) => {
  const perms = {};
  for (const [key, roles] of Object.entries(PERMISSIONS)) {
    perms[key] = roles.includes(role);
  }
  return perms;
};

export { PERMISSIONS, ROLES };
