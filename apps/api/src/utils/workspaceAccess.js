import { prisma } from "../config/db.js";

export const canAccessWorkspace = async (userId, workspaceId) => {
  if (!userId || !workspaceId) return false;

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    select: { id: true },
  });

  return Boolean(workspace);
};

export const denyWorkspaceAccess = (res) =>
  res.status(403).json({ msg: "You do not have access to this workspace" });
