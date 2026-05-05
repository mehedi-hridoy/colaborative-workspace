"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/constants";
import { useActionItemStore } from "../store/actionItemStore";

const PRIORITY_META = {
  low:    { label: "Low",    classes: "bg-slate-100 text-slate-600" },
  medium: { label: "Medium", classes: "bg-amber-100 text-amber-700" },
  high:   { label: "High",   classes: "bg-red-100 text-red-700"    },
};

const STATUS_COLUMNS = [
  { id: "todo",        label: "To Do",       color: "border-slate-300", dot: "bg-slate-400"   },
  { id: "in-progress", label: "In Progress", color: "border-blue-300",  dot: "bg-blue-500"    },
  { id: "done",        label: "Done",        color: "border-emerald-300",dot: "bg-emerald-500" },
];

function Avatar({ user, size = "sm" }) {
  const label = (user?.name || user?.email || "?")[0].toUpperCase();
  const sz = size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs";
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-teal-600 font-bold text-white ${sz}`} title={user?.name || user?.email}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.medium;
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${m.classes}`}>{m.label}</span>;
}

function dueDateDisplay(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const isOverdue = d < new Date() && d.toDateString() !== new Date().toDateString();
  return (
    <span className={`text-[10px] font-medium ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
      {isOverdue ? "⚠ " : "📅 "}{d.toLocaleDateString()}
    </span>
  );
}

// ─── Task Card ───────────────────────────────────────────────────────────────
function TaskCard({ item, goalId, onStatusChange, onDelete }) {
  const [moving, setMoving] = useState(false);

  const statusOptions = STATUS_COLUMNS.filter((c) => c.id !== item.status);

  const handleMove = async (newStatus) => {
    setMoving(true);
    await onStatusChange(item.id, newStatus);
    setMoving(false);
  };

  return (
    <div className={`group relative rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md ${
      item.status === "done" ? "opacity-70" : ""
    }`}>
      {/* Priority + delete */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <PriorityBadge priority={item.priority} />
        <button
          onClick={() => onDelete(item.id, goalId)}
          className="hidden rounded p-0.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500 group-hover:block"
          title="Delete task"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <p className={`mb-2 text-sm font-medium leading-snug text-slate-800 ${item.status === "done" ? "line-through text-slate-400" : ""}`}>
        {item.title}
      </p>

      {item.description && (
        <p className="mb-2 text-xs text-slate-500 line-clamp-2">{item.description}</p>
      )}

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {item.assignee && <Avatar user={item.assignee} />}
          {item.assignee && <span className="text-[10px] text-slate-500">{item.assignee.name || item.assignee.email}</span>}
        </div>
        {dueDateDisplay(item.dueDate)}
      </div>

      {/* Move to buttons */}
      {statusOptions.length > 0 && (
        <div className="mt-2 flex gap-1 border-t border-slate-100 pt-2">
          {statusOptions.map((col) => (
            <button
              key={col.id}
              disabled={moving}
              onClick={() => handleMove(col.id)}
              className="flex-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40"
            >
              → {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────
function CreateForm({ goalId, workspaceId, members, onCreated, onCancel }) {
  const { createItem } = useActionItemStore();
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium",
    status: "todo", dueDate: "", assigneeId: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const result = await createItem({
      ...form,
      goalId,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate || undefined,
    });
    setSaving(false);
    if (result) { onCreated(result); setForm({ title: "", description: "", priority: "medium", status: "todo", dueDate: "", assigneeId: "" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">New Action Item</h4>
      <div className="space-y-2.5">
        <input
          required placeholder="Task title *"
          value={form.title} onChange={(e) => set("title", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <textarea
          placeholder="Description (optional)" rows={2}
          value={form.description} onChange={(e) => set("description", e.target.value)}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-teal-500">
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-teal-500">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-teal-500"
          />
          <select value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-teal-500">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name || m.email}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={saving || !form.title.trim()}
          className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
          {saving ? "Adding…" : "Add Task"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function ActionItemBoard({ goalId, workspaceId }) {
  const { itemsByGoal, loading, fetchByGoal, updateStatus, deleteItem } = useActionItemStore();
  const [view, setView] = useState("kanban");
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);

  const items = itemsByGoal[goalId] || [];
  const isLoading = loading[goalId];

  useEffect(() => {
    if (!goalId) return;
    fetchByGoal(goalId);
  }, [goalId]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/members`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers)
      .catch(() => {});
  }, [workspaceId]);

  const handleCreated = (item) => {
    setShowForm(false);
    // Socket will add it; but add optimistically too
    useActionItemStore.setState((s) => {
      const existing = s.itemsByGoal[goalId] || [];
      if (existing.some((i) => i.id === item.id)) return s;
      return { itemsByGoal: { ...s.itemsByGoal, [goalId]: [item, ...existing] } };
    });
  };

  const handleDelete = async (id, gid) => {
    if (!confirm("Delete this task?")) return;
    await deleteItem(id, gid);
  };

  const total   = items.length;
  const done    = items.filter((i) => i.status === "done").length;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {/* ── Header ── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-700">Action Items</h4>
          {total > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {done}/{total} done
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {["kanban", "list"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                  view === v ? "bg-teal-700 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}>
                {v === "kanban" ? "⊞ Kanban" : "☰ List"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm((p) => !p)}
            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100">
            + Add Task
          </button>
        </div>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="mb-4">
          <CreateForm goalId={goalId} workspaceId={workspaceId} members={members}
            onCreated={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
          Loading tasks…
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && total === 0 && !showForm && (
        <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          No tasks yet — click <strong>+ Add Task</strong> to create one.
        </p>
      )}

      {/* ── KANBAN VIEW ── */}
      {!isLoading && total > 0 && view === "kanban" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATUS_COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.status === col.id);
            return (
              <div key={col.id} className={`rounded-xl border-2 ${col.color} bg-slate-50/60 p-3`}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                  <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm">
                    {colItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colItems.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-[10px] text-slate-400">
                      No tasks
                    </p>
                  ) : (
                    colItems.map((item) => (
                      <TaskCard key={item.id} item={item} goalId={goalId}
                        onStatusChange={updateStatus} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!isLoading && total > 0 && view === "list" && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Task", "Priority", "Status", "Assignee", "Due Date", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="group bg-white transition hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[180px]">
                    <span className={item.status === "done" ? "line-through text-slate-400" : ""}>
                      {item.title}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><PriorityBadge priority={item.priority} /></td>
                  <td className="px-3 py-2.5">
                    <select value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10px] outline-none focus:border-teal-400">
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    {item.assignee
                      ? <div className="flex items-center gap-1.5"><Avatar user={item.assignee} /><span className="text-slate-500">{item.assignee.name || item.assignee.email}</span></div>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5">{item.dueDate ? dueDateDisplay(item.dueDate) : <span className="text-slate-300">—</span>}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => handleDelete(item.id, goalId)}
                      className="hidden rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500 group-hover:block">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
