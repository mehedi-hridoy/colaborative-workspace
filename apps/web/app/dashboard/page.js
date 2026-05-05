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

const API_URL = `${API_BASE_URL}/api`;

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
      { label: "Open", value: active },
      { label: "Done", value: completed },
      { label: "Overdue", value: overdue },
      { label: "Steps", value: milestones },
    ];
  }, [goals]);

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
      setWorkspaceColor("#0f766e");
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

  return (
    <main className="aurora-bg flex h-screen overflow-hidden text-gray-800 dark:text-slate-200">
      {/* ── SIDEBAR ── */}
      <aside className="glass-sidebar flex h-screen w-[240px] flex-col flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-cyan-500 dark:to-blue-500 shadow-md flex-shrink-0">
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
          <div className="hidden md:flex justify-center flex-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900/50 border border-transparent dark:border-white/[0.05] text-sm text-gray-500 dark:text-gray-400 w-full max-w-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span>Search anything...</span>
              <span className="ml-auto text-[10px] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm border border-gray-200 dark:border-zinc-700">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Date Picker */}
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-transparent text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
              <span className="text-gray-400 dark:text-gray-500">📅</span>
              {getCurrentWeekRange()}
              <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <NotificationBell />
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-bold text-white">
              {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── VIEW CONTENT ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ DASHBOARD VIEW ══ */}
          {activeView === "dashboard" && (
            <div className="p-6 space-y-6">

              {!currentWorkspace ? (
                <div className="glass-card p-16 text-center">
                  <div className="flex justify-center mb-6">
                    <Icons.Dashboard size={56} className="text-violet-400 dark:text-teal-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-4">
                    Select a workspace from the sidebar
                  </p>
<button
                    onClick={() => setShowCreateWs(true)}
                    disabled={creating}
                    className="btn-primary opacity-75 cursor-not-allowed" 
                    title={creating ? "Creating..." : "Create new workspace"}
                  >
                    {creating ? "Creating..." : "Create Workspace"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
                  {/* Left Column: Stats + Goals Progress + Action Items */}
                  <div className="space-y-6 min-w-0">
                    {/* Statistics Cards */}
                    <StatisticsCards
                      stats={[
                        {
                          id: "total-goals",
                          label: "Total Goals",
                          value: goals.length,
                          subtext:
                            goals.length === 1
                              ? "1 goal"
                              : `${goals.length} goals`,
                          icon: <Icons.Goals size={24} className="text-blue-500 dark:text-blue-400" />,
                          progress: Math.min(100, goals.length * 10),
                          barGradient:
                            "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600",
                        },
                        {
                          id: "tasks-completed",
                          label: "Tasks Completed",
                          value: goals.reduce(
                            (a, g) =>
                              (g.milestones || []).filter((m) => m.completed)
                                .length + a,
                            0
                          ),
                          subtext: "milestones done",
                          icon: <Icons.Check size={24} className="text-emerald-500 dark:text-emerald-400" />,
                          progress: 60,
                          barGradient:
                            "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600",
                        },
                        {
                          id: "overdue-tasks",
                          label: "Overdue Tasks",
                          value: goals.filter((g) => getGoalState(g) === "overdue")
                            .length,
                          subtext: "critical priority",
                          icon: <Icons.Activity size={24} className="text-red-500 dark:text-red-400" />,
                          progress: Math.min(
                            100,
                            goals.filter((g) => getGoalState(g) === "overdue")
                              .length * 20
                          ),
                          barGradient:
                            "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500 dark:to-red-600",
                        },
                        {
                          id: "team-members",
                          label: "Team Members",
                          value: currentWorkspace.members?.length || 1,
                          subtext: "in workspace",
                          icon: <Icons.Members size={24} className="text-purple-500 dark:text-purple-400" />,
                          progress: 75,
                          barGradient:
                            "bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-500 dark:to-cyan-600",
                        },
                      ]}
                    />

                      {/* Goals Progress Section */}
                      {visibleGoals.length > 0 && (
                        <div className="glass-card p-6">
                          <GoalsProgressSection
                            goals={visibleGoals.slice(0, 6)}
                            onGoalClick={(goalId) => {
                              setActiveView("goals");
                            }}
                          />
                        </div>
                      )}

                      {/* Action Items Preview */}
                      {visibleGoals.length > 0 && (
                        <div className="glass-card p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Icons.ActionItems size={20} className="text-gray-600 dark:text-gray-400" /> Action Items
                            </h3>
                            <button
                              onClick={() => setActiveView("action-items")}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              View All →
                            </button>
                          </div>
                          <KanbanBoard goalId={visibleGoals[0].id} workspaceId={currentWorkspace.id} />
                        </div>
                      )}
                  </div>

                  {/* Right Sidebar — sticky */}
                  <aside className="hidden xl:block min-w-0">
                    <div className="sticky top-0 space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 pb-4 custom-scrollbar">
                      {/* Activity Feed */}
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icons.Activity size={18} className="text-gray-600 dark:text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity Feed</h3>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <button onClick={() => setActiveView("activity")} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View all</button>
                        </div>
                        <RichActivityFeed activities={activities} />
                      </div>

                      {/* Pinned Announcements */}
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>📌</span> Pinned Announcements
                          </h3>
                          <button onClick={() => setActiveView("announcements")} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View all</button>
                        </div>
                        <PinnedAnnouncements announcements={announcements} />
                      </div>

                      {/* Tasks Overview */}
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icons.FileText size={18} className="text-gray-600 dark:text-gray-400" /> Tasks Overview
                          </h3>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-500">This Week</span>
                        </div>
                        <TasksOverview stats={tasksOverviewStats} />
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          )}

              {/* ══ ANALYTICS VIEW ══ */}
              {activeView === "analytics" && (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Workspace Analytics</h2>
                    <div className="flex justify-end items-center gap-3">
                      <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-transparent text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-transparent text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                        <span className="text-gray-400 dark:text-gray-500">📅</span>
                        {getCurrentWeekRange()}
                        <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </div>

                  {!currentWorkspace ? (
                    <div className="glass-card p-16 text-center">
                      <p className="text-5xl mb-4">🏢</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-4">
                        Select a workspace to view analytics
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Statistics Cards */}
                      <StatisticsCards
                        stats={[
                          {
                            id: "total-goals",
                            label: "Total Goals",
                            value: goals.length,
                            subtext:
                              goals.length === 1
                                ? "1 goal"
                                : `${goals.length} goals`,
                            icon: <Icons.Goals size={24} className="text-blue-500 dark:text-blue-400" />,
                            progress: Math.min(100, goals.length * 10),
                            barGradient:
                              "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600",
                          },
                          {
                            id: "tasks-completed",
                            label: "Tasks Completed",
                            value: goals.reduce(
                              (a, g) =>
                                (g.actionItems || []).filter((item) => item.status === "done")
                                  .length + a,
                              0
                            ),
                            subtext: "total completed",
                            icon: <Icons.Check size={24} className="text-emerald-500 dark:text-emerald-400" />,
                            progress: 60,
                            barGradient:
                              "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600",
                          },
                          {
                            id: "overdue-tasks",
                            label: "Overdue Tasks",
                            value: goals.filter((g) => getGoalState(g) === "overdue")
                              .length,
                            subtext: "critical priority",
                            icon: <Icons.Activity size={24} className="text-red-500 dark:text-red-400" />,
                            progress: Math.min(
                              100,
                              goals.filter((g) => getGoalState(g) === "overdue")
                                .length * 20
                            ),
                            barGradient:
                              "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500 dark:to-red-600",
                          },
                          {
                            id: "team-members",
                            label: "Team Members",
                            value: currentWorkspace.members?.length || 1,
                            subtext: `${onlineUsers.length} online`,
                            icon: <Icons.Members size={24} className="text-purple-500 dark:text-purple-400" />,
                            progress: currentWorkspace.members?.length ? Math.min(100, Math.round((onlineUsers.length / currentWorkspace.members.length) * 100)) : 100,
                            barGradient:
                              "bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-500 dark:to-cyan-600",
                          },
                        ]}
                      />

                      {/* Goal Completion Chart */}
                      {goals.length > 0 && (
                        <GoalCompletionChart goals={goals} />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ══ GOALS VIEW ══ */}
              {activeView === "goals" && (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-700 dark:text-white">Company Milestones</h2>
                      <p className="text-gray-500 dark:text-zinc-400 mt-1">Strategic objectives for the current quarter.</p>
                    </div>
                    {currentWorkspace && canCreateGoal && (
                      <button onClick={() => document.getElementById("goal-form").scrollIntoView({ behavior: "smooth" })} className="btn-primary flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Create New Goal
                      </button>
                    )}
                  </div>
                  {currentWorkspace && canCreateGoal && (
                    <div id="goal-form" className="glass-card p-4 mb-6 flex gap-3 flex-wrap items-end">
                      <input placeholder="Goal title" value={goalTitle} onChange={e => setGoalTitle(e.target.value)} className="glass-input flex-1 min-w-[180px]" />
                      <input type="date" value={goalDueDate} onChange={e => setGoalDueDate(e.target.value)} className="glass-input w-40" />
                      <select value={goalStatus} onChange={e => setGoalStatus(e.target.value)} className="rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-3 py-2.5 text-sm text-gray-700 dark:text-zinc-300 outline-none">
                        <option value="open">Open</option><option value="in-progress">In Progress</option><option value="completed">Done</option>
                      </select>
                      <button onClick={handleCreateGoal} disabled={creatingGoal || !goalTitle.trim()} className="btn-primary">{creatingGoal ? "Adding…" : "Add Goal"}</button>
                    </div>
                  )}
                  {!currentWorkspace ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🎯</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace first</p></div>
                  ) : visibleGoals.length === 0 ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🚀</p><p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create one above</p></div>
                  ) : (
                    <div className="space-y-5">
                      {visibleGoals.map(goal => {
                        const state = getGoalState(goal);
                        const meta = statusMeta[state];
                        const progress = calculateProgress(goal.milestones);
                        const ms = goal.milestones || [];
                        return (
                          <article key={goal.id} className={`glass-card overflow-hidden ${state === "overdue" ? "!border-red-400/40 dark:!border-red-500/30" : ""}`}>
                            <div className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{goal.title}</h3>
                                    <span className={meta.cls}>{meta.label}</span>
                                  </div>
                                  {goal.description && <p className="text-sm text-gray-500 dark:text-zinc-500">{goal.description}</p>}
                                </div>
                              </div>
                              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-zinc-500">PROGRESS</span>
                                <span className="text-gray-700 dark:text-zinc-300">{progress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/30 dark:bg-zinc-800 overflow-hidden mb-2">
                                <div className={`h-full rounded-full transition-all duration-700 ${meta.bar}`} style={{ width: `${progress}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-600">
                                {goal.dueDate && <span>📅 Due {new Date(goal.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                              </div>
                            </div>
                            {/* 2-col: Milestones + Activity */}
                            <div className="border-t border-white/20 dark:border-white/[0.05] grid grid-cols-1 lg:grid-cols-2">
                              <div className="p-5 border-r border-white/20 dark:border-white/[0.05]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3">↗ MILESTONES</p>
                                <div className="space-y-2 mb-3">
                                  {ms.map(m => (
                                    <label key={m.id} className="flex items-center gap-3 rounded-xl border border-white/30 dark:border-white/[0.06] bg-white/15 dark:bg-zinc-900/50 px-3 py-2.5 cursor-pointer hover:bg-white/25 dark:hover:bg-zinc-800/60 transition">
                                      <input type="checkbox" checked={m.completed} onChange={() => handleToggleMilestone(goal.id, m.id)} className="h-4 w-4 rounded accent-blue-600 dark:accent-blue-500 flex-shrink-0" />
                                      <span className={`text-sm ${m.completed ? "line-through text-gray-400 dark:text-zinc-600" : "text-gray-700 dark:text-zinc-200 font-medium"}`}>{m.title}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input value={milestoneInputs[goal.id] || ""} onChange={e => setMilestoneInputs(p => ({ ...p, [goal.id]: e.target.value }))} placeholder="Add step…"
                                    onKeyDown={e => { if (e.key === "Enter") handleCreateMilestone(goal.id); }} className="glass-input flex-1 text-sm py-2" />
                                  <button onClick={() => handleCreateMilestone(goal.id)} disabled={!milestoneInputs[goal.id]?.trim() || creatingMilestones[goal.id]} className="btn-ghost">+</button>
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">↻ RECENT ACTIVITY</p>
                                </div>
                                <ActivityFeed goalId={goal.id} />
                                <PostUpdate goalId={goal.id} onPostSuccess={refreshActivity} />
                              </div>
                            </div>
                            {/* Kanban */}
                            <div className="border-t border-white/20 dark:border-white/[0.05] p-5">
                              <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace?.id} />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══ ACTION ITEMS VIEW ══ */}
              {activeView === "action-items" && (
                <div className="p-6">
                  {!currentWorkspace ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">☰</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace to see tasks</p></div>
                  ) : visibleGoals.length === 0 ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">✓</p><p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create goals first</p></div>
                  ) : (
                    <div className="space-y-8">
                      {visibleGoals.map(goal => (
                        <div key={goal.id}>
                          <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">{goal.title}</h2>
                            <div className="h-px flex-1 bg-white/25 dark:bg-white/[0.05]" />
                          </div>
                          <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace.id} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ ANNOUNCEMENTS VIEW ══ */}
              {activeView === "announcements" && (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] h-full">
                  <div className="overflow-y-auto p-6 border-r border-white/20 dark:border-white/[0.05]">
                    <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">Team Feed</h2>
                      <p className="text-gray-500 dark:text-zinc-400 mt-1">Stay updated with the latest team broadcasts.</p>
                    </div>
                    {currentWorkspace ? (
                      <>
                        <div className="mb-4"><AnnouncementInput workspaceId={currentWorkspace.id} /></div>
                        <div className="mb-3 border-b border-white/20 dark:border-white/[0.05] pb-3">
                          <button className="text-sm font-bold text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-500 pb-1">Recent</button>
                        </div>
                        <AnnouncementFeed workspaceId={currentWorkspace.id} />
                      </>
                    ) : (
                      <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">📢</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace first</p></div>
                    )}
                  </div>
                  <div className="overflow-y-auto p-6 space-y-4">
                    <div className="flex items-center gap-2"><h3 className="text-sm font-black text-slate-700 dark:text-zinc-300">Live Activity</h3><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /></div>
                    {activities.slice(0, 8).map(a => (
                      <div key={a.id} className="flex gap-3">
                        <div className="flex h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 items-center justify-center text-[11px] font-bold text-white flex-shrink-0">{(a.user?.name || "?")[0].toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{a.user?.name || "User"}</p>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">{a.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-xs text-center text-gray-400 dark:text-zinc-600 py-8 border border-dashed border-white/25 dark:border-white/[0.06] rounded-xl">No activity yet</p>}
                  </div>
                </div>
              )}

              {/* ══ ACTIVITY VIEW ══ */}
              {activeView === "activity" && (
                <div className="p-6 max-w-3xl">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Workspace Activity</h2>
                  {activities.length === 0 ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">⚡</p><p className="font-bold text-slate-700 dark:text-zinc-300">No activity yet</p></div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/25 dark:bg-white/[0.06]" />
                      <div className="space-y-4">
                        {activities.map(a => (
                          <div key={a.id} className="flex gap-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-[10px] font-bold text-white flex-shrink-0 relative z-10">{(a.user?.name || "?")[0].toUpperCase()}</div>
                            <div className="glass-card flex-1 p-3">
                              <p className="text-sm text-slate-700 dark:text-zinc-300"><span className="font-bold text-slate-800 dark:text-white">{a.user?.name || "User"}</span> {a.message}</p>
                              <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ NOTIFICATIONS VIEW ══ */}
              {activeView === "notifications" && (
                <div className="p-6 max-w-2xl">
                  <h2 className="text-2xl font-black text-slate-700 dark:text-white mb-6">Notifications</h2>
                  <div className="glass-card p-10 text-center"><p className="text-4xl mb-3">🔔</p><p className="text-gray-500 dark:text-zinc-400">Check the bell icon for live notifications</p></div>
                </div>
              )}

              {/* ══ MEMBERS VIEW ══ */}
              {activeView === "members" && (
                <div className="p-6 max-w-3xl">
                  <h2 className="text-2xl font-black text-slate-700 dark:text-white mb-6">Workspace Members</h2>
                  {!currentWorkspace ? (
                    <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">👥</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace first</p></div>
                  ) : (
                    <div className="space-y-3">
                      {(currentWorkspace.members || []).length === 0 ? (
                        <div className="glass-card p-10 text-center">
                          <p className="text-4xl mb-3">👤</p>
                          <p className="text-gray-500 dark:text-zinc-400">No members data available</p>
                        </div>
                      ) : (
                        currentWorkspace.members.map((member, i) => (
                          <div key={member.id || i} className="glass-card flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white flex-shrink-0">
                              {(member.user?.name || member.user?.email || "U").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{member.user?.name || "Member"}</p>
                              <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{member.user?.email || ""}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${member.role === "ADMIN" ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"}`}>
                              {member.role || "MEMBER"}
                            </span>
                            {onlineUsers.includes(member.userId || member.user?.id) && (
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Online" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ══ WORKSPACE MANAGEMENT (floating panel) ══ */}
              {activeView === "dashboard" && (
                <div className="px-6 pb-6">
                  <details className="glass-card">
                    <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 dark:text-zinc-300 select-none">⚙ Workspace Management</summary>
                    <div className="p-4 border-t border-white/20 dark:border-white/[0.05] space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">Create New Workspace</p>
                        <input placeholder="Workspace name" value={name} onChange={e => setName(e.target.value)} className="glass-input" />
                        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="glass-input resize-none" />
                        <div className="flex items-center justify-between rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-3 py-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">Accent color</span>
                          <input type="color" value={workspaceColor} onChange={e => setWorkspaceColor(e.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent" />
                        </div>
                        <button onClick={handleCreateWorkspace} disabled={creating} className="btn-primary w-full">{creating ? "Creating…" : "Create Workspace"}</button>
                      </div>
                      {currentWorkspace && canInvite && (
                        <div className="space-y-2 border-t border-white/20 dark:border-white/[0.05] pt-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">Invite Member</p>
                          <div className="flex gap-2">
                            <input type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="glass-input flex-1" />
                            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-2 py-2 text-sm text-gray-700 dark:text-zinc-300 outline-none">
                              <option value="MEMBER">Member</option><option value="ADMIN">Admin</option>
                            </select>
                            <button onClick={handleInviteMember} disabled={inviting} className="btn-ghost">{inviting ? "…" : "Invite"}</button>
                          </div>
                          <button onClick={handleArchiveWorkspace} className="rounded-xl border border-red-400/30 dark:border-red-500/25 bg-red-50/50 dark:bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-500/20 transition">Archive Workspace</button>
                        </div>
                      )}
                      <div className="space-y-1 border-t border-white/20 dark:border-white/[0.05] pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">Your Workspaces</p>
                        {workspaces.map(ws => (
                          <button key={ws.id} onClick={() => setCurrentWorkspace(ws)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition text-sm ${currentWorkspace?.id === ws.id ? "bg-blue-100/60 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold" : "text-gray-600 dark:text-zinc-400 hover:bg-white/20 dark:hover:bg-white/[0.04]"}`}>
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: ws.color || "#8b5cf6" }} />{ws.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              )}

            </div>
      </div>

        {/* View All Workspaces Modal */}
        {showAllWorkspaces && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAllWorkspaces(false)} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-lg w-[420px] max-h-[80vh] overflow-y-auto p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Workspaces</h3>
                <button onClick={() => setShowAllWorkspaces(false)} className="text-gray-500">✕</button>
              </div>
              <div className="space-y-2">
                {workspaces?.map(ws => (
                  <button key={ws.id} onClick={() => { setCurrentWorkspace(ws); setShowAllWorkspaces(false); }} className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${currentWorkspace?.id === ws.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-gray-50"}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ws.color || "#60A5FA" }} />{ws.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

    </main>
  );
}
