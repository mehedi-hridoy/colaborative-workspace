"use client";

import { useMemo } from "react";

// ─── Same permissions matrix as the backend ─────────────────────────────────
const PERMISSIONS = {
  "workspace:invite":     ["ADMIN"],
  "workspace:remove":     ["ADMIN"],
  "workspace:archive":    ["ADMIN"],
  "workspace:changeRole": ["ADMIN"],
  "goal:create":          ["ADMIN", "MEMBER"],
  "goal:edit":            ["ADMIN", "MEMBER"],
  "goal:delete":          ["ADMIN"],
  "task:create":          ["ADMIN", "MEMBER"],
  "task:edit":            ["ADMIN", "MEMBER"],
  "task:delete":          ["ADMIN", "MEMBER"],
  "task:statusUpdate":    ["ADMIN", "MEMBER"],
  "announcement:create":  ["ADMIN", "MEMBER"],
  "announcement:pin":     ["ADMIN"],
  "announcement:react":   ["ADMIN", "MEMBER", "VIEWER"],
  "announcement:comment": ["ADMIN", "MEMBER", "VIEWER"],
  "activity:post":        ["ADMIN", "MEMBER"],
  "read":                 ["ADMIN", "MEMBER", "VIEWER"],
};

/**
 * Hook that returns permission checks based on the user's role.
 * @param {string} role - "ADMIN" | "MEMBER" | "VIEWER" | null
 * @returns {{ can: (perm: string) => boolean, role: string, isAdmin: boolean, isMember: boolean, isViewer: boolean }}
 */
export function usePermissions(role) {
  return useMemo(() => {
    const r = role || "VIEWER";

    const can = (permission) => {
      const allowed = PERMISSIONS[permission];
      return allowed ? allowed.includes(r) : false;
    };

    return {
      can,
      role: r,
      isAdmin: r === "ADMIN",
      isMember: r === "MEMBER",
      isViewer: r === "VIEWER",
      // Shorthand checks for common operations
      canCreateGoal: can("goal:create"),
      canEditGoal: can("goal:edit"),
      canDeleteGoal: can("goal:delete"),
      canCreateTask: can("task:create"),
      canEditTask: can("task:edit"),
      canPostAnnouncement: can("announcement:create"),
      canPinAnnouncement: can("announcement:pin"),
      canInvite: can("workspace:invite"),
      canRemoveMember: can("workspace:remove"),
      canChangeRole: can("workspace:changeRole"),
      canArchive: can("workspace:archive"),
      canPostActivity: can("activity:post"),
    };
  }, [role]);
}

/**
 * Get the user's current role from the workspace object.
 * Handles both old format (workspace.role) and
 * owner detection (workspace.ownerId === userId).
 */
export function getRoleFromWorkspace(workspace, userId) {
  if (!workspace) return null;
  if (workspace.ownerId === userId) return "ADMIN";
  return workspace.role || "MEMBER";
}
