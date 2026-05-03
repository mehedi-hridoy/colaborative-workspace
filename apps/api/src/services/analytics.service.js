import { prisma } from "../config/db.js";

/**
 * Get workspace analytics snapshot
 * - Total goals
 * - Goals completed this week
 * - Goals overdue
 * - Action items by status
 * - Completed action items this week
 */
export const getWorkspaceAnalytics = async (workspaceId) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total goals in workspace
  const totalGoals = await prisma.goal.count({
    where: { workspaceId },
  });

  // Goals completed this week
  const goalsCompletedWeek = await prisma.goal.count({
    where: {
      workspaceId,
      status: "completed",
      updatedAt: { gte: weekAgo },
    },
  });

  // Goals overdue (not completed, dueDate in the past)
  const goalsOverdue = await prisma.goal.count({
    where: {
      workspaceId,
      status: { not: "completed" },
      dueDate: { lt: now },
    },
  });

  // Action items by status
  const actionItemsByStatus = await prisma.actionItem.groupBy({
    by: ["status"],
    where: { goal: { workspaceId } },
    _count: true,
  });

  // Completed action items this week
  const actionItemsCompletedWeek = await prisma.actionItem.count({
    where: {
      status: "done",
      updatedAt: { gte: weekAgo },
      goal: { workspaceId },
    },
  });

  // Total action items
  const totalActionItems = await prisma.actionItem.count({
    where: { goal: { workspaceId } },
  });

  // Action items overdue
  const actionItemsOverdue = await prisma.actionItem.count({
    where: {
      goal: { workspaceId },
      status: { not: "done" },
      dueDate: { lt: now },
    },
  });

  // Members count
  const membersCount = await prisma.membership.count({
    where: { workspaceId },
  });

  // Active members (who created activity this week)
  const activeMembers = await prisma.activity.findMany({
    where: {
      workspaceId,
      createdAt: { gte: weekAgo },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  return {
    totalGoals,
    goalsCompletedWeek,
    goalsOverdue,
    actionItemsCompleted: actionItemsByStatus.find((s) => s.status === "done")?._count || 0,
    actionItemsInProgress: actionItemsByStatus.find((s) => s.status === "in-progress")?._count || 0,
    actionItemsTodo: actionItemsByStatus.find((s) => s.status === "todo")?._count || 0,
    actionItemsCompletedWeek,
    totalActionItems,
    actionItemsOverdue,
    membersCount,
    activeMembers: activeMembers.length,
  };
};

/**
 * Get goal completion chart data (last 4 weeks)
 * Returns daily completed goals for the past 4 weeks
 */
export const getGoalCompletionChart = async (workspaceId) => {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Completed goals with their completion date
  const completedGoals = await prisma.goal.findMany({
    where: {
      workspaceId,
      status: "completed",
      updatedAt: { gte: fourWeeksAgo },
    },
    select: { updatedAt: true },
  });

  // Group by date
  const dateMap = new Map();
  completedGoals.forEach((goal) => {
    const dateStr = goal.updatedAt.toISOString().split("T")[0];
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });

  // Generate all dates in the range and format for chart
  const chartData = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      completed: dateMap.get(dateStr) || 0,
    });
  }

  return chartData;
};

/**
 * Get action item completion chart data (last 4 weeks)
 */
export const getActionItemCompletionChart = async (workspaceId) => {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const completedItems = await prisma.actionItem.findMany({
    where: {
      goal: { workspaceId },
      status: "done",
      updatedAt: { gte: fourWeeksAgo },
    },
    select: { updatedAt: true },
  });

  const dateMap = new Map();
  completedItems.forEach((item) => {
    const dateStr = item.updatedAt.toISOString().split("T")[0];
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });

  const chartData = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      completed: dateMap.get(dateStr) || 0,
    });
  }

  return chartData;
};

/**
 * Get member productivity stats
 */
export const getMemberProductivity = async (workspaceId) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const members = await prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  const stats = await Promise.all(
    members.map(async (m) => {
      const activitiesWeek = await prisma.activity.count({
        where: {
          userId: m.user.id,
          workspaceId,
          createdAt: { gte: weekAgo },
        },
      });

      const itemsCompleted = await prisma.actionItem.count({
        where: {
          assigneeId: m.user.id,
          status: "done",
          updatedAt: { gte: weekAgo },
        },
      });

      const goalsOwned = await prisma.goal.count({
        where: {
          ownerId: m.user.id,
          workspaceId,
        },
      });

      return {
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        activitiesWeek,
        itemsCompletedWeek: itemsCompleted,
        goalsOwned,
      };
    })
  );

  return stats;
};

/**
 * Export workspace data as CSV
 */
export const exportWorkspaceDataCSV = async (workspaceId) => {
  // Get all data needed
  const [goals, actionItems, announcements, activities, members] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      include: { owner: { select: { name: true, email: true } }, milestones: true },
    }),
    prisma.actionItem.findMany({
      where: { goal: { workspaceId } },
      include: { goal: { select: { title: true } }, assignee: { select: { name: true, email: true } } },
    }),
    prisma.announcement.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activity.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.membership.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  // Build CSV content
  let csv = "GOALS\n";
  csv += "Title,Owner,Status,Due Date,Milestones Completed,Created At\n";
  goals.forEach((g) => {
    const milestonesCompleted = g.milestones.filter((m) => m.completed).length;
    const totalMilestones = g.milestones.length;
    csv += `"${g.title}","${g.owner.name}","${g.status}","${
      g.dueDate ? g.dueDate.toISOString().split("T")[0] : ""
    }","${milestonesCompleted}/${totalMilestones}","${g.createdAt.toISOString().split("T")[0]}"\n`;
  });

  csv += "\n\nACTION ITEMS\n";
  csv += "Title,Goal,Assignee,Priority,Status,Due Date,Created At\n";
  actionItems.forEach((a) => {
    csv += `"${a.title}","${a.goal.title}","${a.assignee?.name || "unassigned"}","${a.priority}","${a.status}","${
      a.dueDate ? a.dueDate.toISOString().split("T")[0] : ""
    }","${a.createdAt.toISOString().split("T")[0]}"\n`;
  });

  csv += "\n\nANNOUNCEMENTS\n";
  csv += "Author,Content,Created At\n";
  announcements.forEach((a) => {
    csv += `"${a.user.name}","${a.content.replace(/"/g, '""')}","${a.createdAt.toISOString().split("T")[0]}"\n`;
  });

  csv += "\n\nMEMBERS\n";
  csv += "Name,Email\n";
  members.forEach((m) => {
    csv += `"${m.user.name}","${m.user.email}"\n`;
  });

  csv += "\n\nACTIVITY LOG\n";
  csv += "User,Activity,Date\n";
  activities.forEach((a) => {
    csv += `"${a.user.name}","${a.message}","${a.createdAt.toISOString()}"\n`;
  });

  return csv;
};
