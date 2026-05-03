import { canAccessWorkspace, denyWorkspaceAccess } from "../utils/workspaceAccess.js";
import {
  getWorkspaceAnalytics,
  getGoalCompletionChart,
  getActionItemCompletionChart,
  getMemberProductivity,
  exportWorkspaceDataCSV,
} from "../services/analytics.service.js";

/**
 * GET /api/analytics/:workspaceId
 * Get workspace analytics snapshot
 */
export const getAnalytics = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const analytics = await getWorkspaceAnalytics(workspaceId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/analytics/:workspaceId/goal-chart
 * Get goal completion chart data
 */
export const getGoalChart = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const chartData = await getGoalCompletionChart(workspaceId);
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/analytics/:workspaceId/action-item-chart
 * Get action item completion chart data
 */
export const getActionItemChart = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const chartData = await getActionItemCompletionChart(workspaceId);
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/analytics/:workspaceId/members
 * Get member productivity stats
 */
export const getMemberStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const stats = await getMemberProductivity(workspaceId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/analytics/:workspaceId/export
 * Export workspace data as CSV
 */
export const exportData = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const hasAccess = await canAccessWorkspace(req.user.userId, workspaceId);
    if (!hasAccess) {
      return denyWorkspaceAccess(res);
    }

    const csv = await exportWorkspaceDataCSV(workspaceId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="workspace-${workspaceId}-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
