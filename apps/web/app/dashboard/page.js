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
import { getSocket } from "../lib/socket";

const API_URL = "http://localhost:5000/api";

const statusMeta = {
  "no-milestones": {
    label: "Open",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
    bar: "bg-slate-300",
  },
  "not-started": {
    label: "Open",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
    bar: "bg-teal-700",
  },
  "in-progress": {
    label: "Open",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
    bar: "bg-teal-700",
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-50 text-red-700 ring-red-200",
    bar: "bg-red-500",
  },
  completed: {
    label: "Done",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
  },
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
  const [workspaceColor, setWorkspaceColor] = useState("#0f766e");
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
    await logout();
    clearWorkspace();
    setGoals([]);
    setActivities([]);
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        Redirecting...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-screen-2xl grid-cols-1 lg:grid-cols-[300px_1fr_340px]">
        <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Team Hub
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Logout
            </button>
          </div>

          <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name || "Workspace member"}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Workspaces</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                {workspaces.length}
              </span>
            </div>

            <div className="space-y-2">
              {workspaces.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  No workspaces yet
                </p>
              ) : (
                workspaces.map((workspace) => {
                  const active = currentWorkspace?.id === workspace.id;

                  return (
                    <button
                      key={workspace.id}
                      onClick={() => setCurrentWorkspace(workspace)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition ${
                        active
                          ? "border-teal-600 bg-teal-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: workspace.color || "#0f766e" }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-900">
                            {workspace.name}
                          </span>
                          {workspace.description && (
                            <span className="block truncate text-xs text-slate-500">
                              {workspace.description}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Create Workspace</h2>
            <div className="space-y-3">
              <input
                placeholder="Workspace name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5">
                <span className="text-sm text-slate-600">Accent color</span>
                <input
                  type="color"
                  value={workspaceColor}
                  onChange={(event) => setWorkspaceColor(event.target.value)}
                  className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                />
              </div>
              <button
                onClick={handleCreateWorkspace}
                disabled={creating}
                className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {creating ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </section>
        </aside>

        <section className="px-5 py-5 sm:px-7 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {currentWorkspace ? "Current workspace" : "No workspace selected"}
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                {currentWorkspace?.name || "Select a workspace"}
              </h2>
              {currentWorkspace?.description && (
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  {currentWorkspace.description}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-1">
              <h3 className="text-base font-semibold">New Goal</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_190px_150px_auto]">
              <input
                placeholder={currentWorkspace ? "Goal title" : "Select a workspace first"}
                value={goalTitle}
                onChange={(event) => setGoalTitle(event.target.value)}
                disabled={!currentWorkspace}
                className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
              />
              <input
                type="date"
                value={goalDueDate}
                onChange={(event) => setGoalDueDate(event.target.value)}
                disabled={!currentWorkspace}
                className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
              />
              <select
                value={goalStatus}
                onChange={(event) => setGoalStatus(event.target.value)}
                disabled={!currentWorkspace || !isAdmin}
                className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
              >
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Done</option>
              </select>
              <button
                onClick={handleCreateGoal}
                disabled={!currentWorkspace || creatingGoal}
                className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {creatingGoal ? "Adding..." : "Add Goal"}
              </button>
            </div>
          </section>

          {currentWorkspace && isAdmin && (
            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-base font-semibold">Workspace Admin</h3>
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <input
                  type="email"
                  placeholder="Invite by email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  onClick={handleInviteMember}
                  disabled={inviting}
                  className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {inviting ? "Inviting..." : "Invite"}
                </button>
              </div>
              <button
                onClick={handleArchiveWorkspace}
                className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Archive Workspace
              </button>
            </section>
          )}

          {!currentWorkspace ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-semibold">Choose a workspace to begin</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Goals and milestones are scoped to the workspace you select.
              </p>
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-semibold">No goals yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Create the first shared goal for this workspace.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-base font-semibold">Goals</h3>
                </div>
                <p className="text-sm text-slate-500">{goals.length} total</p>
              </div>

              {visibleGoals.map((goal) => {
                const progress = calculateProgress(goal.milestones);
                const state = getGoalState(goal);
                const meta = statusMeta[state];
                const milestoneCount = goal.milestones?.length || 0;
                const completedMilestones =
                  goal.milestones?.filter((milestone) => milestone.completed).length || 0;
                const dueDateLabel = goal.dueDate
                  ? new Date(goal.dueDate).toLocaleDateString()
                  : "No due date";

                return (
                  <article
                    key={goal.id}
                    className={`rounded-lg border bg-white p-5 shadow-sm ${
                      state === "overdue" ? "border-red-200" : "border-slate-200"
                    }`}
                  >
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{goal.title}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          {goal.owner?.name && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                              {goal.owner.name}
                            </span>
                          )}
                          {goal.dueDate && (
                            <span
                              className={`rounded-full px-2.5 py-1 font-medium ${
                                state === "overdue"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {dueDateLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.classes}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {milestoneCount > 0 && (
                      <div className="mb-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">Progress</span>
                          <span className="font-semibold">
                            {completedMilestones}/{milestoneCount}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${meta.bar}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {milestoneCount > 0 && (
                      <div className="space-y-2">
                        {goal.milestones?.map((milestone) => (
                          <label
                            key={milestone.id}
                            className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => handleToggleMilestone(goal.id, milestone.id)}
                              className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                            />
                            <span
                              className={
                                milestone.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-700"
                              }
                            >
                              {milestone.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        placeholder="Add step"
                        value={milestoneInputs[goal.id] || ""}
                        onChange={(event) =>
                          setMilestoneInputs((current) => ({
                            ...current,
                            [goal.id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleCreateMilestone(goal.id);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      />
                      <button
                        onClick={() => handleCreateMilestone(goal.id)}
                        disabled={creatingMilestones[goal.id]}
                        className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {creatingMilestones[goal.id] ? "Adding..." : "Add Step"}
                      </button>
                    </div>

                    <PostUpdate goalId={goal.id} onPostSuccess={refreshActivity} />

                    <ActivityFeed goalId={goal.id} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="border-t border-slate-200 bg-white px-5 py-5 lg:border-l lg:border-t-0 lg:overflow-y-auto lg:max-h-screen">
          {/* Announcements */}
          {currentWorkspace ? (
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <h2 className="text-base font-semibold">Announcements</h2>
              </div>
              <div className="mb-3">
                <AnnouncementInput workspaceId={currentWorkspace.id} />
              </div>
              <AnnouncementFeed workspaceId={currentWorkspace.id} />
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="mb-3 text-base font-semibold">Announcements</h2>
              <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                Select a workspace to see announcements.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="mb-5 border-t border-slate-200" />

          {/* Activity */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Activity</h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
              {activities.length}
            </span>
          </div>

          {!currentWorkspace ? (
            <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
              Select a workspace to see activity.
            </p>
          ) : activities.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
              No activity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm leading-5 text-slate-700">
                    <span className="font-semibold text-slate-950">
                      {activity.user?.name || "User"}
                    </span>{" "}
                    {activity.message}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
