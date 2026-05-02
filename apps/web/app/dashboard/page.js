"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getSocket } from "../lib/socket";
import { useNotificationStore } from "../store/notificationStore";
import { useActionItemStore } from "../store/actionItemStore";

// ── Nav config ────────────────────────────────────────────
const NAV = [
  { id:"dashboard",     label:"Dashboard",    icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  { id:"goals",         label:"Goals",        icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { id:"action-items",  label:"Action Items", icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { id:"announcements", label:"Announcements",icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg> },
  { id:"activity",      label:"Activity",     icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
  { id:"notifications", label:"Notifications",icon:<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
];

const API_URL = "http://localhost:5000/api";

const statusMeta = {
  "no-milestones": { label: "Open",    cls: "status-open",    bar: "bg-slate-400 dark:bg-slate-600" },
  "not-started":   { label: "Open",    cls: "status-open",    bar: "bg-violet-500 dark:bg-teal-500" },
  "in-progress":   { label: "Active",  cls: "status-active",  bar: "bg-violet-500 dark:bg-teal-500" },
  overdue:         { label: "Overdue", cls: "status-overdue",  bar: "bg-red-500"                    },
  completed:       { label: "Done",    cls: "status-done",     bar: "bg-emerald-500"                },
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
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [creatingMilestones, setCreatingMilestones] = useState({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showCreateWs, setShowCreateWs] = useState(false);

  const { user, loading, fetchUser, logout } = useAuthStore();
  const {
    workspaces,
    setWorkspaces,
    addWorkspace,
    currentWorkspace,
    setCurrentWorkspace,
    loadWorkspace,
    clearWorkspace,
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

  const isAdmin =
    Boolean(currentWorkspace?.role === "ADMIN") ||
    Boolean(currentWorkspace?.ownerId && currentWorkspace?.ownerId === user?.id);

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
    return () => {
      cleanupNotificationSocket();
      cleanupTaskSocket();
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
        throw new Error("Failed to create workspace");
      }

      const newWorkspace = await res.json();
      addWorkspace(newWorkspace);
      setCurrentWorkspace(newWorkspace);
      setName("");
      setDescription("");
      setWorkspaceColor("#0f766e");
      await refreshWorkspaces();
    } catch (error) {
      alert("Error creating workspace: " + error.message);
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
          status: isAdmin ? goalStatus : undefined,
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 dark:border-zinc-700 border-t-violet-500 dark:border-t-teal-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="aurora-bg flex min-h-screen items-center justify-center text-slate-600 dark:text-zinc-400">
        Redirecting…
      </main>
    );
  }

  return (
    <main className="aurora-bg flex h-screen overflow-hidden text-slate-800 dark:text-slate-200">
      {/* ── SIDEBAR ── */}
      <aside className="glass-sidebar flex h-screen w-[220px] flex-col flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/20 dark:border-white/[0.05]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 dark:from-teal-600 dark:to-teal-800 shadow-lg flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black tracking-tight text-slate-800 dark:text-white">PRODUCTIVITYOS</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-zinc-500">Team Workspace</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all text-sm ${active ? "bg-violet-100/70 dark:bg-teal-500/10 text-violet-700 dark:text-teal-400 font-bold border-l-[3px] border-violet-500 dark:border-teal-500 pl-[9px]" : "text-slate-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/[0.05] font-medium"}`}>
                <span className={active ? "text-violet-600 dark:text-teal-400" : "text-slate-400 dark:text-zinc-500"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/20 dark:border-white/[0.05] p-3 space-y-2">
          <div className="flex items-center justify-between px-1"><ThemeToggle /><NotificationBell /></div>
          {user && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/20 dark:bg-zinc-900 border border-white/30 dark:border-white/[0.07] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[11px] font-bold text-white flex-shrink-0">
                {(user.name||user.email||"U").slice(0,2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{user.name||"Member"}</p>
                <p className="truncate text-[10px] text-slate-500 dark:text-zinc-500">{currentWorkspace?.name||"No workspace"}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="rounded-lg p-1 text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition flex-shrink-0">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP HEADER ── */}
        <header className="flex items-center justify-between gap-4 border-b border-white/20 dark:border-white/[0.05] bg-white/10 dark:bg-black/60 backdrop-blur-xl px-6 py-3 flex-shrink-0">
          <h1 className="text-xl font-black text-slate-800 dark:text-white capitalize">
            {NAV.find(n => n.id === activeView)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
              <input placeholder="Search..." className="pl-9 pr-4 py-1.5 rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-900 text-sm text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 outline-none focus:border-violet-400 dark:focus:border-teal-500 w-52 backdrop-blur-sm" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[11px] font-bold text-white">
              {(user?.name||user?.email||"U").slice(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── VIEW CONTENT ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ DASHBOARD VIEW ══ */}
          {activeView === "dashboard" && (
            <div className="p-6 space-y-6">
              {/* Welcome header */}
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  Welcome back, {user?.name?.split(" ")[0] || "there"}.
                </h2>
                <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
                  Here's what's happening in your workspace today.
                </p>
              </div>

              {!currentWorkspace ? (
                <div className="glass-card p-16 text-center">
                  <p className="text-5xl mb-4">🏢</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-4">
                    Select a workspace from the sidebar
                  </p>
                  <button
                    onClick={() => setShowCreateWs(true)}
                    className="btn-primary"
                  >
                    Create Workspace
                  </button>
                </div>
              ) : (
                <>
                  {/* Statistics Cards - Top Section */}
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
                        icon: "📊",
                        progress: Math.min(100, goals.length * 10),
                        barGradient:
                          "bg-gradient-to-r from-violet-500 to-purple-600 dark:from-teal-500 dark:to-emerald-500",
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
                        icon: "✓",
                        progress: 60,
                        barGradient:
                          "bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-500 dark:to-teal-600",
                      },
                      {
                        id: "overdue-tasks",
                        label: "Overdue Tasks",
                        value: goals.filter((g) => getGoalState(g) === "overdue")
                          .length,
                        subtext: "critical priority",
                        icon: "⚠️",
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
                        icon: "👥",
                        progress: 75,
                        barGradient:
                          "bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-500 dark:to-cyan-600",
                      },
                    ]}
                  />

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Goals Progress + Action Items */}
                    <div className="lg:col-span-2 space-y-6">
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
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>☐</span> Action Items
                            </h3>
                            <button
                              onClick={() => setActiveView("action-items")}
                              className="text-xs font-bold text-violet-600 dark:text-teal-400 hover:text-violet-800 dark:hover:text-teal-300"
                            >
                              View All →
                            </button>
                          </div>
                          <div className="space-y-2">
                            {visibleGoals.slice(0, 2).map((goal) => (
                              <div key={goal.id} className="border-l-4 border-violet-400 dark:border-teal-400 pl-4 py-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {goal.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-500">
                                  {(goal.milestones || []).filter((m) => !m.completed).length} pending
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Activity Feed + Pinned Announcements */}
                    <div className="space-y-6">
                      {/* Activity Feed */}
                      <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Activity Feed
                          </h3>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                          {activities.slice(0, 5).map((a) => (
                            <div key={a.id} className="flex gap-2.5">
                              <span className="h-2 w-2 rounded-full bg-violet-500 dark:bg-teal-500 mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-700 dark:text-zinc-300">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {a.user?.name || "User"}
                                  </span>{" "}
                                  {a.message}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">
                                  {new Date(a.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {activities.length === 0 && (
                            <p className="text-xs text-slate-400 dark:text-zinc-600">
                              No activity yet
                            </p>
                          )}
                        </div>
                        {activities.length > 0 && (
                          <button
                            onClick={() => setActiveView("activity")}
                            className="mt-4 w-full rounded-xl border border-white/30 dark:border-white/[0.07] py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-teal-400 transition"
                          >
                            View All Activity
                          </button>
                        )}
                      </div>

                      {/* Pinned Announcements */}
                      <div className="glass-card p-6">
                        <div className="mb-4">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📌</span> Announcements
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveView("announcements")}
                          className="w-full rounded-xl border border-white/30 dark:border-white/[0.07] bg-white/15 dark:bg-white/[0.05] py-3 text-sm font-bold text-violet-600 dark:text-teal-400 hover:bg-white/25 dark:hover:bg-white/10 transition"
                        >
                          + View Team Feed
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ GOALS VIEW ══ */}
          {activeView === "goals" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Company Milestones</h2>
                  <p className="text-slate-500 dark:text-zinc-400 mt-1">Strategic objectives for the current quarter.</p>
                </div>
                {currentWorkspace && isAdmin && (
                  <button onClick={()=>document.getElementById("goal-form").scrollIntoView({behavior:"smooth"})} className="btn-primary flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Create New Goal
                  </button>
                )}
              </div>
              {currentWorkspace && isAdmin && (
                <div id="goal-form" className="glass-card p-4 mb-6 flex gap-3 flex-wrap items-end">
                  <input placeholder="Goal title" value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} className="glass-input flex-1 min-w-[180px]"/>
                  <input type="date" value={goalDueDate} onChange={e=>setGoalDueDate(e.target.value)} className="glass-input w-40"/>
                  <select value={goalStatus} onChange={e=>setGoalStatus(e.target.value)} className="rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-3 py-2.5 text-sm text-slate-700 dark:text-zinc-300 outline-none">
                    <option value="open">Open</option><option value="in-progress">In Progress</option><option value="completed">Done</option>
                  </select>
                  <button onClick={handleCreateGoal} disabled={creatingGoal||!goalTitle.trim()} className="btn-primary">{creatingGoal?"Adding…":"Add Goal"}</button>
                </div>
              )}
              {!currentWorkspace ? (
                <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🎯</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace first</p></div>
              ) : visibleGoals.length===0 ? (
                <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🚀</p><p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create one above</p></div>
              ) : (
                <div className="space-y-5">
                  {visibleGoals.map(goal => {
                    const state = getGoalState(goal);
                    const meta = statusMeta[state];
                    const progress = calculateProgress(goal.milestones);
                    const ms = goal.milestones||[];
                    return (
                      <article key={goal.id} className={`glass-card overflow-hidden ${state==="overdue"?"!border-red-400/40 dark:!border-red-500/30":""}`}>
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{goal.title}</h3>
                                <span className={meta.cls}>{meta.label}</span>
                              </div>
                              {goal.description && <p className="text-sm text-slate-500 dark:text-zinc-500">{goal.description}</p>}
                            </div>
                          </div>
                          <div className="mb-1 flex items-center justify-between text-xs font-bold">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500">PROGRESS</span>
                            <span className="text-slate-700 dark:text-zinc-300">{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/30 dark:bg-zinc-800 overflow-hidden mb-2">
                            <div className={`h-full rounded-full transition-all duration-700 ${meta.bar}`} style={{width:`${progress}%`}}/>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-600">
                            {goal.dueDate && <span>📅 Due {new Date(goal.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                          </div>
                        </div>
                        {/* 2-col: Milestones + Activity */}
                        <div className="border-t border-white/20 dark:border-white/[0.05] grid grid-cols-1 lg:grid-cols-2">
                          <div className="p-5 border-r border-white/20 dark:border-white/[0.05]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-3">↗ MILESTONES</p>
                            <div className="space-y-2 mb-3">
                              {ms.map(m=>(
                                <label key={m.id} className="flex items-center gap-3 rounded-xl border border-white/30 dark:border-white/[0.06] bg-white/15 dark:bg-zinc-900/50 px-3 py-2.5 cursor-pointer hover:bg-white/25 dark:hover:bg-zinc-800/60 transition">
                                  <input type="checkbox" checked={m.completed} onChange={()=>handleToggleMilestone(goal.id,m.id)} className="h-4 w-4 rounded accent-violet-600 dark:accent-teal-500 flex-shrink-0"/>
                                  <span className={`text-sm ${m.completed?"line-through text-slate-400 dark:text-zinc-600":"text-slate-700 dark:text-zinc-200 font-medium"}`}>{m.title}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input value={milestoneInputs[goal.id]||""} onChange={e=>setMilestoneInputs(p=>({...p,[goal.id]:e.target.value}))} placeholder="Add step…"
                                onKeyDown={e=>{if(e.key==="Enter")handleCreateMilestone(goal.id);}} className="glass-input flex-1 text-sm py-2"/>
                              <button onClick={()=>handleCreateMilestone(goal.id)} disabled={!milestoneInputs[goal.id]?.trim()||creatingMilestones[goal.id]} className="btn-ghost">+</button>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">↻ RECENT ACTIVITY</p>
                            </div>
                            <ActivityFeed goalId={goal.id}/>
                            <PostUpdate goalId={goal.id} onPostSuccess={refreshActivity}/>
                          </div>
                        </div>
                        {/* Kanban */}
                        <div className="border-t border-white/20 dark:border-white/[0.05] p-5">
                          <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace?.id}/>
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
              ) : visibleGoals.length===0 ? (
                <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">✓</p><p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create goals first</p></div>
              ) : (
                <div className="space-y-8">
                  {visibleGoals.map(goal=>(
                    <div key={goal.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white">{goal.title}</h2>
                        <div className="h-px flex-1 bg-white/25 dark:bg-white/[0.05]"/>
                      </div>
                      <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace.id}/>
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
                  <p className="text-slate-500 dark:text-zinc-400 mt-1">Stay updated with the latest team broadcasts.</p>
                </div>
                {currentWorkspace ? (
                  <>
                    <div className="mb-4"><AnnouncementInput workspaceId={currentWorkspace.id}/></div>
                    <div className="mb-3 border-b border-white/20 dark:border-white/[0.05] pb-3">
                      <button className="text-sm font-bold text-violet-700 dark:text-teal-400 border-b-2 border-violet-500 dark:border-teal-500 pb-1">Recent</button>
                    </div>
                    <AnnouncementFeed workspaceId={currentWorkspace.id}/>
                  </>
                ) : (
                  <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">📢</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace first</p></div>
                )}
              </div>
              <div className="overflow-y-auto p-6 space-y-4">
                <div className="flex items-center gap-2"><h3 className="text-sm font-black text-slate-700 dark:text-zinc-300">Live Activity</h3><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/></div>
                {activities.slice(0,8).map(a=>(
                  <div key={a.id} className="flex gap-3">
                    <div className="flex h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 items-center justify-center text-[11px] font-bold text-white flex-shrink-0">{(a.user?.name||"?")[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{a.user?.name||"User"}</p>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{a.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {activities.length===0 && <p className="text-xs text-center text-slate-400 dark:text-zinc-600 py-8 border border-dashed border-white/25 dark:border-white/[0.06] rounded-xl">No activity yet</p>}
              </div>
            </div>
          )}

          {/* ══ ACTIVITY VIEW ══ */}
          {activeView === "activity" && (
            <div className="p-6 max-w-3xl">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Workspace Activity</h2>
              {activities.length===0 ? (
                <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">⚡</p><p className="font-bold text-slate-700 dark:text-zinc-300">No activity yet</p></div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/25 dark:bg-white/[0.06]"/>
                  <div className="space-y-4">
                    {activities.map(a=>(
                      <div key={a.id} className="flex gap-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[10px] font-bold text-white flex-shrink-0 relative z-10">{(a.user?.name||"?")[0].toUpperCase()}</div>
                        <div className="glass-card flex-1 p-3">
                          <p className="text-sm text-slate-700 dark:text-zinc-300"><span className="font-bold text-slate-800 dark:text-white">{a.user?.name||"User"}</span> {a.message}</p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
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
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Notifications</h2>
              <div className="glass-card p-10 text-center"><p className="text-4xl mb-3">🔔</p><p className="text-slate-500 dark:text-zinc-400">Check the bell icon for live notifications</p></div>
            </div>
          )}

          {/* ══ WORKSPACE MANAGEMENT (floating panel) ══ */}
          {activeView === "dashboard" && (
            <div className="px-6 pb-6">
              <details className="glass-card">
                <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 dark:text-zinc-300 select-none">⚙ Workspace Management</summary>
                <div className="p-4 border-t border-white/20 dark:border-white/[0.05] space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Create New Workspace</p>
                    <input placeholder="Workspace name" value={name} onChange={e=>setName(e.target.value)} className="glass-input"/>
                    <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} rows={2} className="glass-input resize-none"/>
                    <div className="flex items-center justify-between rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-3 py-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Accent color</span>
                      <input type="color" value={workspaceColor} onChange={e=>setWorkspaceColor(e.target.value)} className="h-7 w-8 cursor-pointer border-0 bg-transparent"/>
                    </div>
                    <button onClick={handleCreateWorkspace} disabled={creating} className="btn-primary w-full">{creating?"Creating…":"Create Workspace"}</button>
                  </div>
                  {currentWorkspace && isAdmin && (
                    <div className="space-y-2 border-t border-white/20 dark:border-white/[0.05] pt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Invite Member</p>
                      <div className="flex gap-2">
                        <input type="email" placeholder="Email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="glass-input flex-1"/>
                        <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-2 py-2 text-sm text-slate-700 dark:text-zinc-300 outline-none">
                          <option value="MEMBER">Member</option><option value="ADMIN">Admin</option>
                        </select>
                        <button onClick={handleInviteMember} disabled={inviting} className="btn-ghost">{inviting?"…":"Invite"}</button>
                      </div>
                      <button onClick={handleArchiveWorkspace} className="rounded-xl border border-red-400/30 dark:border-red-500/25 bg-red-50/50 dark:bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-500/20 transition">Archive Workspace</button>
                    </div>
                  )}
                  <div className="space-y-1 border-t border-white/20 dark:border-white/[0.05] pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-2">Your Workspaces</p>
                    {workspaces.map(ws=>(
                      <button key={ws.id} onClick={()=>setCurrentWorkspace(ws)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition text-sm ${currentWorkspace?.id===ws.id?"bg-violet-100/60 dark:bg-teal-500/10 text-violet-700 dark:text-teal-400 font-bold":"text-slate-600 dark:text-zinc-400 hover:bg-white/20 dark:hover:bg-white/[0.04]"}`}>
                        <span className="h-2.5 w-2.5 rounded-full" style={{background:ws.color||"#8b5cf6"}}/>{ws.name}
                      </button>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
