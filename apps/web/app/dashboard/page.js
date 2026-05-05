"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "../../lib/icons";
import { API_BASE_URL } from "../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useGoalStore } from "../../store/goalStore";
import PostUpdate from "../components/PostUpdate";
import ActivityFeed from "../components/ActivityFeed";
import AnnouncementFeed from "../components/AnnouncementFeed";
import AnnouncementInput from "../components/AnnouncementInput";
import NotificationBell from "../components/NotificationBell";
import KanbanBoard from "../components/KanbanBoard";
import ThemeToggle from "../components/ThemeToggle";
import StatisticsCards from "../components/StatisticsCards";
import GoalsProgressSection from "../components/GoalsProgressSection";
import TasksOverview from "../components/TasksOverview";
import RichActivityFeed from "../components/RichActivityFeed";
import PinnedAnnouncements from "../components/PinnedAnnouncements";
import GoalCompletionChart from "../components/GoalCompletionChart";
import { getSocket } from "../lib/socket";
import { useNotificationStore } from "../store/notificationStore";
import { useActionItemStore } from "../store/actionItemStore";
import { useAnnouncementStore } from "../store/announcementStore";
import { usePermissions, getRoleFromWorkspace } from "../hooks/usePermissions";

// ── Nav config ────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "Dashboard" },
  { id: "goals", label: "Goals", icon: "Goals" },
  { id: "action-items", label: "Action Items", icon: "ActionItems" },
  { id: "announcements", label: "Announcements", icon: "Announcements" },
  { id: "activity", label: "Activity", icon: "Activity" },
  { id: "notifications", label: "Notifications", icon: "Notifications" },
  { id: "analytics", label: "Analytics", icon: "Analytics" },
  { id: "members", label: "Members", icon: "Members" },
];

const API_URL = API_BASE_URL;

const statusMeta = {
  "no-milestones": { label: "Open", cls: "status-open", bar: "bg-gray-400 dark:bg-gray-600" },
  "not-started": { label: "Open", cls: "status-open", bar: "bg-blue-500 dark:bg-blue-500" },
  "in-progress": { label: "Active", cls: "status-active", bar: "bg-blue-500 dark:bg-blue-500" },
  overdue: { label: "Overdue", cls: "status-overdue", bar: "bg-red-500" },
  completed: { label: "Done", cls: "status-done", bar: "bg-emerald-500" },
};

const isPastDue = (dueDate) => {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

const calculateProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;
  const completed = milestones.filter((milestone) => milestone.completed).length;
  return Math.round((completed / milestones.length) * 100);
};

const getGoalState = (goal) => {
  const milestoneCount = goal.milestones?.length || 0;
  const progress = calculateProgress(goal.milestones);

  if (milestoneCount === 0) {
    if (goal.status === "completed") return "completed";
    if (goal.status === "in-progress") return "in-progress";
    if (isPastDue(goal.dueDate) && goal.status !== "completed") return "overdue";
    return "no-milestones";
  }

  if (progress === 100) return "completed";
  if (isPastDue(goal.dueDate)) return "overdue";
  if (progress === 0) return "not-started";
  return "in-progress";
};

export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceColor, setWorkspaceColor] = useState("#8b5cf6");
  const [creating, setCreating] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDueDate, setGoalDueDate] = useState("");
  const [goalStatus, setGoalStatus] = useState("open");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [creatingMilestones, setCreatingMilestones] = useState({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);


  const { user, loading, fetchUser, logout } = useAuthStore();
  const {
    workspaces,
    setWorkspaces,
    addWorkspace,
    currentWorkspace,
    setCurrentWorkspace,
    loadWorkspace,
    clearWorkspace,
    onlineUsers,
    listenSocket: listenPresenceSocket,
    cleanupSocket: cleanupPresenceSocket,
  } = useWorkspaceStore();
  const { goals, setGoals, addGoal, updateGoal } = useGoalStore();
  const {
    fetchNotifications,
    listenSocket: listenNotificationSocket,
    cleanupSocket: cleanupNotificationSocket,
    reset: resetNotifications,
  } = useNotificationStore();
  const {
    listenSocket: listenTaskSocket,
    cleanupSocket: cleanupTaskSocket,
    reset: resetTasks,
  } = useActionItemStore();

  const currentRole = getRoleFromWorkspace(currentWorkspace, user?.id);
  const { isAdmin, canCreateGoal, canInvite, canRemoveMember, canPostAnnouncement } = usePermissions(currentRole);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    refreshWorkspaces();
    fetchNotifications();
    listenNotificationSocket();
    listenTaskSocket();
    listenPresenceSocket();
    return () => {
      cleanupNotificationSocket();
      cleanupTaskSocket();
      cleanupPresenceSocket();
    };
  }, [user]);

  useEffect(() => {
    if (!currentWorkspace) {
      setGoals([]);
      return;
    }

    const fetchGoals = async () => {
      const res = await fetch(`${API_URL}/goals/${currentWorkspace.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setGoals([]);
        setCurrentWorkspace(null);
        return;
      }

      const data = await res.json();
      setGoals(data);
    };

    fetchGoals();
  }, [currentWorkspace]);

  useEffect(() => {
    if (!currentWorkspace) {
      return;
    }

    const fetchActivities = async () => {
      const res = await fetch(`${API_URL}/activity/${currentWorkspace.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setActivities([]);
        return;
      }

      const data = await res.json();
      setActivities(data);
    };

    fetchActivities();
  }, [currentWorkspace]);

  useEffect(() => {
    if (!currentWorkspace) {
      setAnnouncements([]);
      return;
    }

    const fetchAnnouncements = async () => {
      const res = await fetch(`${API_URL}/announcements/${currentWorkspace.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setAnnouncements([]);
        return;
      }

      const data = await res.json();
      // Filter for pinned announcements
      const pinned = (data || []).filter(a => a.isPinned);
      setAnnouncements(pinned);
    };

    fetchAnnouncements();
  }, [currentWorkspace]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const socket = getSocket();
    socket.emit("join_workspace", currentWorkspace.id);

    return () => {
      socket.emit("leave_workspace", currentWorkspace.id);
    };
  }, [currentWorkspace?.id]);

  const stats = useMemo(() => {
    const completed = goals.filter((goal) => getGoalState(goal) === "completed").length;
    const overdue = goals.filter((goal) => getGoalState(goal) === "overdue").length;
    const active = goals.filter((goal) =>
      ["not-started", "in-progress", "no-milestones"].includes(getGoalState(goal))
    ).length;
    const milestones = goals.reduce((count, goal) => count + (goal.milestones?.length || 0), 0);

    return [
      {
        id: "open",
        label: "Open",
        value: active,
        subtext: currentWorkspace ? currentWorkspace.name : "No workspace selected",
        icon: <Icons.Goals size={20} className="text-violet-500 dark:text-teal-400" />,
        progress: goals.length ? Math.round((active / goals.length) * 100) : 0,
      },
      {
        id: "done",
        label: "Done",
        value: completed,
        subtext: `${completed} completed goals`,
        icon: <Icons.Check size={20} className="text-emerald-500" />,
        progress: goals.length ? Math.round((completed / Math.max(goals.length, 1)) * 100) : 0,
      },
      {
        id: "overdue",
        label: "Overdue",
        value: overdue,
        subtext: overdue ? "Needs attention" : "All on track",
        icon: <Icons.X size={20} className="text-red-500" />,
        progress: goals.length ? Math.round((overdue / Math.max(goals.length, 1)) * 100) : 0,
        barGradient: "bg-gradient-to-r from-red-500 to-orange-500",
      },
      {
        id: "steps",
        label: "Steps",
        value: milestones,
        subtext: "Total milestones",
        icon: <Icons.Menu size={20} className="text-sky-500" />,
        progress: milestones ? 100 : 0,
        barGradient: "bg-gradient-to-r from-sky-500 to-cyan-500",
      },
    ];
  }, [goals, currentWorkspace]);

  const tasksOverviewStats = useMemo(() => {
    const done = goals.reduce((a, g) => a + (g.milestones || []).filter(m => m.completed).length, 0);
    const total = goals.reduce((a, g) => a + (g.milestones || []).length, 0);
    const inProgress = goals.filter(g => getGoalState(g) === "in-progress").length;
    return {
      todo: Math.max(0, total - done),
      inProgress,
      done,
    };
  }, [goals]);

  const visibleGoals = useMemo(() => {
    const rank = {
      overdue: 0,
      "no-milestones": 1,
      "not-started": 2,
      "in-progress": 3,
      completed: 4,
    };

    return [...goals].sort((first, second) => {
      const stateDiff = rank[getGoalState(first)] - rank[getGoalState(second)];
      if (stateDiff !== 0) return stateDiff;
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [goals]);

  const refreshActivity = async () => {
    if (!currentWorkspace) return;

    const res = await fetch(`${API_URL}/activity/${currentWorkspace.id}`, {
      credentials: "include",
    });

    if (res.ok) {
      setActivities(await res.json());
    }
  };

  const refreshWorkspaces = async () => {
    const res = await fetch(`${API_URL}/workspaces`, {
      credentials: "include",
    });

    if (!res.ok) {
      setWorkspaces([]);
      return;
    }

    const data = await res.json();
    setWorkspaces(data);
  };

  const handleCreateWorkspace = async () => {
    if (!name.trim()) return alert("Name required");

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color: workspaceColor,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Create workspace failed:", res.status, res.statusText, errorText);
        throw new Error(`Failed to create workspace (${res.status}): ${errorText.slice(0,100)}`);
      }

      const newWorkspace = await res.json();
      addWorkspace(newWorkspace);
      setCurrentWorkspace(newWorkspace);
      setName("");
      setDescription("");
      setWorkspaceColor("#8b5cf6");
      setShowCreateWs(false);
      await refreshWorkspaces();
    } catch (error) {
      alert("Error creating workspace: " + error.message + "\\nCheck browser console and ensure backend is running at localhost:5000");
    } finally {
      setCreating(false);
    }
  };

  const handleArchiveWorkspace = async () => {
    if (!currentWorkspace) return;

    const confirmArchive = window.confirm(
      "Archive this workspace? You can restore it later, but it will be hidden from the list."
    );

    if (!confirmArchive) return;

    try {
      const res = await fetch(
        `${API_URL}/workspaces/${currentWorkspace.id}/archive`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to archive workspace");
      }

      setCurrentWorkspace(null);
      await refreshWorkspaces();
    } catch (error) {
      alert("Error archiving workspace: " + error.message);
    }
  };

  const handleInviteMember = async () => {
    if (!currentWorkspace) return;

    if (!inviteEmail.trim()) {
      alert("Enter an email to invite");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch(
        `${API_URL}/workspaces/${currentWorkspace.id}/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: inviteEmail.trim(),
            role: inviteRole,
            }),
        }
      );

      const raw = await res.text();
      let data = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { msg: raw || "Unexpected response from server" };
      }

      if (!res.ok) {
        throw new Error(data.msg || data.error || "Failed to invite member");
      }

      setInviteEmail("");
      setInviteRole("MEMBER");
      alert(`Invited ${data.user?.email || inviteEmail} as ${data.role}`);
    } catch (error) {
      alert("Error inviting member: " + error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim() || !currentWorkspace) {
      return alert("Select workspace and enter goal title");
    }

    setCreatingGoal(true);
    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: goalTitle.trim(),
          dueDate: goalDueDate || null,
          workspaceId: currentWorkspace.id,
          status: canCreateGoal ? goalStatus : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create goal");
      }

      const newGoal = await res.json();
      addGoal(newGoal);
      setGoalTitle("");
      setGoalDueDate("");
      setGoalStatus("open");
      await refreshActivity();
    } catch (error) {
      alert("Error creating goal: " + error.message);
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await fetch(`${API_URL}/milestones/${milestoneId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle milestone");
      }

      const updatedMilestone = await res.json();
      const updatedGoal = goals.find((goal) => goal.id === goalId);

      if (updatedGoal) {
        const updatedMilestones = updatedGoal.milestones.map((milestone) =>
          milestone.id === milestoneId ? updatedMilestone : milestone
        );
        updateGoal(goalId, { ...updatedGoal, milestones: updatedMilestones });
      }

      await refreshActivity();
    } catch (error) {
      alert("Error toggling milestone: " + error.message);
    }
  };

  const handleCreateMilestone = async (goalId) => {
    const title = milestoneInputs[goalId]?.trim();
    if (!title) {
      alert("Milestone title cannot be empty");
      return;
    }

    try {
      setCreatingMilestones((current) => ({ ...current, [goalId]: true }));

      const res = await fetch(`${API_URL}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, goalId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create milestone");
      }

      const newMilestone = await res.json();
      const updatedGoal = goals.find((goal) => goal.id === goalId);

      if (updatedGoal) {
        const updatedMilestones = [...(updatedGoal.milestones || []), newMilestone];
        updateGoal(goalId, { ...updatedGoal, milestones: updatedMilestones });
      }

      setMilestoneInputs((current) => ({ ...current, [goalId]: "" }));
      await refreshActivity();
    } catch (error) {
      alert("Error creating milestone: " + error.message);
    } finally {
      setCreatingMilestones((current) => ({ ...current, [goalId]: false }));
    }
  };

  // ── Analytics helpers ──────────────────────────────────────
  const getCurrentWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} — ${fmt(end)}, ${now.getFullYear()}`;
  };

  const handleExportCSV = () => {
    if (!goals.length) return;
    const rows = [["Title", "Status", "Progress", "Due Date"]];
    goals.forEach((g) => {
      const progress = calculateProgress(g.milestones);
      rows.push([g.title, getGoalState(g), `${progress}%`, g.dueDate || "N/A"]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workspace-goals-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleLogout = async () => {
    cleanupNotificationSocket();
    cleanupTaskSocket();
    resetNotifications();
    resetTasks();
    await logout();
    clearWorkspace();
    setGoals([]);
    setActivities([]);
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="aurora-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 dark:border-zinc-700 border-t-blue-500 dark:border-t-blue-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="aurora-bg flex min-h-screen items-center justify-center text-gray-600 dark:text-zinc-400">
        Redirecting…
      </main>
    );
  }

  const dashboardBody = (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <StatisticsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <section className="glass-card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Workspace</p>
              <h2 className="mt-1 text-xl font-black text-slate-800 dark:text-white">
                {currentWorkspace?.name || "Create your first workspace"}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-500">
                {currentWorkspace?.description || "Set up a workspace to unlock goals, announcements, and activity."}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setActiveView("goals")} className="btn-ghost text-xs px-3 py-2">Goals</button>
              <button onClick={() => setActiveView("announcements")} className="btn-ghost text-xs px-3 py-2">Feed</button>
            </div>
          </div>

          {currentWorkspace ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveView("action-items")} className="rounded-2xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 p-4 text-left hover:bg-white/30 dark:hover:bg-zinc-800/70 transition">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Action Items</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Track work in progress</p>
              </button>
              <button onClick={() => setActiveView("activity")} className="rounded-2xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 p-4 text-left hover:bg-white/30 dark:hover:bg-zinc-800/70 transition">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Activity</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">See recent team updates</p>
              </button>
              <button onClick={handleArchiveWorkspace} className="rounded-2xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 p-4 text-left hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Archive workspace</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Hide it from the list</p>
              </button>
              <button onClick={() => setShowCreateWs(true)} className="rounded-2xl border border-dashed border-white/30 dark:border-white/[0.07] bg-white/10 dark:bg-zinc-900/40 p-4 text-left hover:bg-white/20 dark:hover:bg-zinc-800/70 transition">
                <p className="text-sm font-bold text-slate-800 dark:text-white">New workspace</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">Start a fresh space</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-zinc-500">No workspace is selected yet. Create one to load goals, announcements, and activity.</p>
              <div className="grid grid-cols-1 gap-3">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Workspace name" className="glass-input" />
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Workspace description" rows={3} className="glass-input resize-none" />
                <div className="flex items-center gap-3 rounded-2xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 px-3 py-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Accent color</span>
                  <input type="color" value={workspaceColor} onChange={(event) => setWorkspaceColor(event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" />
                </div>
                <button onClick={handleCreateWorkspace} disabled={creating} className="btn-primary w-full">
                  {creating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Overview</p>
              <h2 className="mt-1 text-lg font-black text-slate-800 dark:text-white">Task balance</h2>
            </div>
          </div>
          <TasksOverview stats={tasksOverviewStats} />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Pinned</p>
              <h2 className="mt-1 text-lg font-black text-slate-800 dark:text-white">Announcements</h2>
            </div>
            <button onClick={() => setActiveView("announcements")} className="text-xs font-bold text-violet-600 dark:text-teal-400">View all</button>
          </div>
          <PinnedAnnouncements announcements={announcements} />
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Recent</p>
              <h2 className="mt-1 text-lg font-black text-slate-800 dark:text-white">Activity</h2>
            </div>
            <button onClick={() => setActiveView("activity")} className="text-xs font-bold text-violet-600 dark:text-teal-400">Open feed</button>
          </div>
          <RichActivityFeed activities={activities} />
        </section>
      </div>
    </div>
  );

  return (
    <main className="aurora-bg flex h-screen overflow-hidden text-gray-800 dark:text-slate-200">
      {/* ── SIDEBAR ── */}
      <aside className="glass-sidebar flex h-screen w-[240px] flex-col flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex h-9 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-cyan-500 dark:to-blue-500 shadow-md flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-gray-900 dark:text-white">TeamFlow</p>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Workspace</p>
          </div>
        </div>

        <nav className="flex-none px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = activeView === item.id;
            const IconComponent = Icons[item.icon];
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all text-sm ${active ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold border-l-[3px] border-blue-500 dark:border-blue-500 pl-[9px]" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] font-medium"}`}>
                {IconComponent && <IconComponent size={20} />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Scrollable area for workspaces and upgrade card */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">WORKSPACES</p>
            <button onClick={() => setShowCreateWs(true)} className="text-sm font-bold text-blue-600">+</button>
          </div>
          <div className="space-y-1">
            {workspaces?.slice(0, 4).map(ws => (
              <button key={ws.id} onClick={() => setCurrentWorkspace(ws)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition text-sm ${currentWorkspace?.id === ws.id ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50"}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ws.color || "#60A5FA" }} />{ws.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAllWorkspaces(true)} className="text-sm text-gray-500 mt-2 inline-block">View all workspaces →</button>

          {/* Upgrade card */}
          <div className="mt-4 bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
            <p className="text-sm font-bold text-slate-800">Upgrade your workspace</p>
            <p className="text-xs text-gray-500 mt-1">Unlock advanced features</p>
            <button className="mt-3 w-full py-2 bg-green-500 text-white rounded-md">Upgrade Now</button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/[0.05] p-3 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/[0.07] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-[11px] font-bold text-white flex-shrink-0">
                {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{user.name || "Member"}</p>
                <p className="truncate text-[10px] text-gray-500 dark:text-zinc-500">{currentWorkspace?.name || "No workspace"}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="rounded-lg p-1 text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition flex-shrink-0">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP HEADER ── */}
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-white/[0.05] bg-white dark:bg-black/60 dark:backdrop-blur-xl px-6 py-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-0.5">
              Good morning, {user?.name?.split(" ")[0] || "there"} 👋
            </p>
            <h1 className="text-2xl font-black text-slate-700 dark:text-white capitalize">
              {NAV.find(n => n.id === activeView)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[11px] font-bold text-white">
              {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {dashboardBody}
      </div>
    </main>
  );
}

