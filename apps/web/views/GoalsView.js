"use client";
import { useState } from "react";
import TopBar from "../app/components/TopBar";
import NotificationBell from "../app/components/NotificationBell";
import KanbanBoard from "../app/components/KanbanBoard";
import ActivityFeed from "../app/components/ActivityFeed";
import PostUpdate from "../app/components/PostUpdate";

const statusMeta = {
  "no-milestones": { label:"Open",    cls:"status-open",    bar:"bg-slate-400 dark:bg-slate-600" },
  "not-started":   { label:"Open",    cls:"status-open",    bar:"bg-violet-500 dark:bg-teal-500" },
  "in-progress":   { label:"Active",  cls:"status-active",  bar:"bg-violet-500 dark:bg-teal-500" },
  overdue:         { label:"Overdue", cls:"status-overdue", bar:"bg-red-500" },
  completed:       { label:"Done",    cls:"status-done",    bar:"bg-emerald-500" },
};
function getState(goal) {
  const ms = goal.milestones || [];
  if (!ms.length) return "no-milestones";
  if (ms.every(m => m.completed)) return "completed";
  if (goal.dueDate && new Date(goal.dueDate) < new Date()) return "overdue";
  if (ms.some(m => m.completed)) return "in-progress";
  return "not-started";
}
function pct(ms) {
  if (!ms?.length) return 0;
  return Math.round((ms.filter(m => m.completed).length / ms.length) * 100);
}

export default function GoalsView({ goals, currentWorkspace, isAdmin, onCreateGoal, onToggleMilestone, onAddMilestone }) {
  const [form, setForm] = useState({ title:"", dueDate:"", status:"open" });
  const [saving, setSaving] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [expanded, setExpanded] = useState({});

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onCreateGoal(form);
    setForm({ title:"", dueDate:"", status:"open" });
    setSaving(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Goals" subtitle="Strategic objectives for the current quarter." searchPlaceholder="Search goals...">
        <NotificationBell />
        {currentWorkspace && isAdmin && (
          <button onClick={() => document.getElementById("goal-form").scrollIntoView({ behavior:"smooth" })}
            className="btn-primary flex items-center gap-1.5 text-xs">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Create New Goal
          </button>
        )}
      </TopBar>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Create form */}
        {currentWorkspace && isAdmin && (
          <div id="goal-form" className="glass-card p-4 flex gap-3 flex-wrap items-end">
            <input placeholder="Goal title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              className="glass-input flex-1 min-w-[200px]" />
            <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))}
              className="glass-input w-44" />
            <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}
              className="rounded-xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900 px-3 py-2.5 text-sm text-slate-700 dark:text-zinc-300 outline-none focus:border-violet-400 dark:focus:border-teal-500">
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
            <button onClick={submit} disabled={saving || !form.title.trim()} className="btn-primary">{saving ? "Adding…" : "+ Add Goal"}</button>
          </div>
        )}

        {!currentWorkspace ? (
          <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🎯</p><p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace</p></div>
        ) : goals.length === 0 ? (
          <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">🚀</p><p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create one above</p></div>
        ) : goals.map(goal => {
          const state = getState(goal);
          const meta = statusMeta[state];
          const progress = pct(goal.milestones);
          const ms = goal.milestones || [];
          const isExpanded = expanded[goal.id] !== false;
          return (
            <article key={goal.id} className={`glass-card overflow-hidden card-in ${state==="overdue"?"!border-red-400/40":""}`}>
              {/* Goal header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">{goal.title}</h2>
                      <span className={meta.cls}>{meta.label}</span>
                    </div>
                    {goal.description && <p className="mt-1 text-sm text-slate-500 dark:text-zinc-500">{goal.description}</p>}
                  </div>
                  <button onClick={() => setExpanded(e=>({...e,[goal.id]:!isExpanded}))}
                    className="btn-ghost text-xs flex-shrink-0">{isExpanded ? "Collapse" : "Expand"}</button>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500 dark:text-zinc-500">PROGRESS</span>
                    <span className="font-black text-slate-700 dark:text-zinc-300">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/30 dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${meta.bar}`} style={{width:`${progress}%`}}/>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400 dark:text-zinc-600">
                    {goal.dueDate && <span>📅 Due {new Date(goal.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/20 dark:border-white/[0.05] grid grid-cols-1 lg:grid-cols-2">
                  {/* Milestones */}
                  <div className="p-5 border-r border-white/20 dark:border-white/[0.05]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-3 flex items-center gap-2">
                      <span>↗</span> Milestones
                    </p>
                    <div className="space-y-2 mb-3">
                      {ms.slice(0,5).map(m => (
                        <label key={m.id} className="flex items-center gap-3 rounded-xl border border-white/30 dark:border-white/[0.06] bg-white/15 dark:bg-zinc-900/50 px-3 py-2.5 cursor-pointer hover:bg-white/25 dark:hover:bg-zinc-800/60 transition">
                          <input type="checkbox" checked={m.completed} onChange={() => onToggleMilestone(goal.id, m.id)}
                            className="h-4 w-4 rounded accent-violet-600 dark:accent-teal-500 flex-shrink-0" />
                          <span className={`text-sm ${m.completed ? "line-through text-slate-400 dark:text-zinc-600" : "text-slate-700 dark:text-zinc-200 font-medium"}`}>{m.title}</span>
                        </label>
                      ))}
                      {ms.length > 5 && <p className="text-xs text-slate-400 dark:text-zinc-600 pl-2 cursor-pointer hover:text-violet-500 dark:hover:text-teal-400">↓ Show {ms.length-5} more milestones</p>}
                    </div>
                    {/* Add milestone */}
                    <div className="flex gap-2">
                      <input value={milestoneInputs[goal.id]||""} onChange={e => setMilestoneInputs(p=>({...p,[goal.id]:e.target.value}))}
                        placeholder="Add step…" onKeyDown={e=>{ if(e.key==="Enter"){onAddMilestone(goal.id, milestoneInputs[goal.id]); setMilestoneInputs(p=>({...p,[goal.id]:""}));}}}
                        className="glass-input flex-1 text-sm py-2" />
                      <button onClick={()=>{ onAddMilestone(goal.id, milestoneInputs[goal.id]); setMilestoneInputs(p=>({...p,[goal.id]:""})); }}
                        disabled={!milestoneInputs[goal.id]?.trim()} className="btn-ghost text-sm">+</button>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 flex items-center gap-2"><span>↻</span> Recent Activity</p>
                    </div>
                    <ActivityFeed goalId={goal.id} />
                    <PostUpdate goalId={goal.id} />
                  </div>
                </div>
              )}

              {/* Kanban */}
              {isExpanded && currentWorkspace && (
                <div className="border-t border-white/20 dark:border-white/[0.05] p-5">
                  <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace.id} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
