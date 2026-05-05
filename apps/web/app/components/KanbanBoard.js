"use client";
import { useState, useEffect } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useActionItemStore } from "../store/actionItemStore";

const COLS = [
  { id:"todo",        label:"To Do",       color:"text-slate-500 dark:text-slate-400",  dot:"bg-slate-400", accent:"border-t-slate-300 dark:border-t-slate-700" },
  { id:"in-progress", label:"In Progress", color:"text-violet-600 dark:text-violet-400", dot:"bg-violet-500", accent:"border-t-violet-400/60 dark:border-t-violet-500/50" },
  { id:"done",        label:"Done",        color:"text-emerald-600 dark:text-emerald-400", dot:"bg-emerald-500", accent:"border-t-emerald-400/60 dark:border-t-emerald-500/50" },
];

const PRI = {
  high:   { label:"High",   cls:"badge-high"   },
  medium: { label:"Med",    cls:"badge-medium"  },
  low:    { label:"Low",    cls:"badge-low"     },
};

function relTime(d) {
  if(!d) return null;
  const days = Math.floor((Date.now()-new Date(d))/86400000);
  return days===0?"Today": days<0?`in ${-days}d`:`${days}d ago`;
}

function Av({ user }) {
  const l=(user?.name||user?.email||"?")[0].toUpperCase();
  return (
    <span title={user?.name||user?.email}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-[10px] font-bold text-white ring-2 ring-white/40 dark:ring-black/40 flex-shrink-0">
      {l}
    </span>
  );
}

/* ── Task Card ──────────────────────────────────────────── */
function TaskCardInner({ item, onDelete, overlay }) {
  const p = PRI[item.priority] || PRI.medium;
  const overdue = item.dueDate && new Date(item.dueDate) < new Date();
  return (
    <div className={`group relative cursor-grab rounded-2xl border bg-white/35 dark:bg-zinc-900 
      backdrop-blur-sm dark:backdrop-blur-none
      p-3.5 shadow-md transition-all select-none
      border-white/50 dark:border-white/[0.07]
      ${overlay ? "rotate-2 scale-105 shadow-2xl ring-2 ring-violet-400/40 dark:ring-teal-500/40" : "hover:-translate-y-0.5 hover:shadow-lg hover:border-white/70 dark:hover:border-white/15"}
      ${item.status==="done" ? "opacity-55" : ""}`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className={p.cls}>{p.label}</span>
        <button onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onDelete(item.id);}}
          className="hidden rounded-md p-1 text-slate-400 dark:text-zinc-600 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 group-hover:flex">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className={`mb-3 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100 ${item.status==="done"?"line-through opacity-50":""}`}>
        {item.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        {item.assignee
          ? <div className="flex items-center gap-1.5"><Av user={item.assignee}/><span className="text-[11px] text-slate-500 dark:text-zinc-500 truncate max-w-[90px]">{item.assignee.name||item.assignee.email}</span></div>
          : <span className="text-[11px] text-slate-400 dark:text-zinc-600">Unassigned</span>
        }
        {item.dueDate && (
          <span className={`text-[11px] font-semibold ${overdue?"text-red-500":"text-slate-400 dark:text-zinc-500"}`}>
            {overdue?"⚠ ":""}{new Date(item.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform:CSS.Translate.toString(transform), opacity:isDragging?0.35:1, touchAction:"none" }}
      {...listeners} {...attributes}>
      <TaskCardInner item={item} onDelete={onDelete} />
    </div>
  );
}

/* ── Kanban Column ──────────────────────────────────────── */
function KanbanCol({ col, items, onDelete }) {
  const { isOver, setNodeRef } = useDroppable({ id: col.id });
  return (
    <div className="flex flex-col min-h-0">
      <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5
        bg-white/20 dark:bg-zinc-900/80 border border-white/40 dark:border-white/[0.06]
        backdrop-blur-sm dark:backdrop-blur-none`}>
        <span className={`h-2 w-2 rounded-full ${col.dot}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${col.color}`}>{col.label}</span>
        <span className="ml-auto rounded-full bg-white/30 dark:bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-zinc-400">
          {items.length}
        </span>
      </div>
      <div ref={setNodeRef} className={`flex-1 min-h-[120px] space-y-2.5 rounded-2xl p-2 transition-all border-2 ${
        isOver
          ? "border-violet-400/50 dark:border-teal-500/50 bg-violet-50/30 dark:bg-teal-500/[0.04]"
          : "border-dashed border-white/25 dark:border-white/[0.04]"}`}>
        {items.length===0 && !isOver && (
          <div className="flex h-full min-h-[80px] items-center justify-center rounded-xl border border-dashed border-white/30 dark:border-white/[0.06]">
            <p className="text-[11px] text-slate-400 dark:text-zinc-600">Drop here</p>
          </div>
        )}
        {items.map(item=><DraggableCard key={item.id} item={item} onDelete={onDelete}/>)}
      </div>
    </div>
  );
}

/* ── Create Task Form ───────────────────────────────────── */
function CreateForm({ goalId, workspaceId, members, onCreated, onCancel }) {
  const { createItem } = useActionItemStore();
  const [form, setForm] = useState({ title:"", priority:"medium", dueDate:"", assigneeId:"", status:"todo" });
  const [saving, setSaving] = useState(false);
  const h = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async e => {
    e.preventDefault();
    if(!form.title.trim()) return;
    setSaving(true);
    const r = await createItem({...form, goalId, assigneeId:form.assigneeId||undefined, dueDate:form.dueDate||undefined});
    setSaving(false);
    if(r) onCreated(r);
  };
  return (
    <form onSubmit={submit} className="mb-4 rounded-2xl border border-white/40 dark:border-white/[0.08] bg-white/30 dark:bg-zinc-900 backdrop-blur-md dark:backdrop-blur-none p-4 shadow-xl card-in">
      <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">New Task</h4>
      <div className="space-y-2.5">
        <input required placeholder="Task title *" value={form.title} onChange={e=>h("title",e.target.value)}
          className="glass-input" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {key:"priority", opts:[["low","🟢 Low"],["medium","🟡 Med"],["high","🔴 High"]]},
            {key:"status",   opts:[["todo","To Do"],["in-progress","In Progress"],["done","Done"]]},
          ].map(({key,opts})=>(
            <select key={key} value={form[key]} onChange={e=>h(key,e.target.value)}
              className="rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-900 px-2 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 outline-none focus:border-violet-400 dark:focus:border-teal-500 backdrop-blur-sm dark:backdrop-blur-none">
              {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <input type="date" value={form.dueDate} onChange={e=>h("dueDate",e.target.value)}
            className="rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-900 px-2 py-2 text-xs text-slate-700 dark:text-zinc-300 outline-none focus:border-violet-400 dark:focus:border-teal-500 backdrop-blur-sm" />
          <select value={form.assigneeId} onChange={e=>h("assigneeId",e.target.value)}
            className="rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-900 px-2 py-2 text-xs text-slate-700 dark:text-zinc-300 outline-none focus:border-violet-400 dark:focus:border-teal-500 backdrop-blur-sm">
            <option value="">Unassigned</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.name||m.email}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={saving||!form.title.trim()} className="btn-primary">{saving?"Adding…":"Add Task"}</button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

/* ── List View ──────────────────────────────────────────── */
function ListView({ items, onStatusChange, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/40 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 backdrop-blur-sm dark:backdrop-blur-none">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/30 dark:border-white/[0.06]">
            {["Task","Priority","Status","Assignee","Due",""].map(h=>(
              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item=>{
            const p=PRI[item.priority]||PRI.medium;
            const overdue=item.dueDate&&new Date(item.dueDate)<new Date();
            return (
              <tr key={item.id} className="group border-b border-white/20 dark:border-white/[0.04] transition hover:bg-white/20 dark:hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-zinc-200 max-w-[180px]">
                  <span className={item.status==="done"?"line-through opacity-50":""}>{item.title}</span>
                </td>
                <td className="px-4 py-3"><span className={p.cls}>{p.label}</span></td>
                <td className="px-4 py-3">
                  <select value={item.status} onChange={e=>onStatusChange(item.id,e.target.value)}
                    className="rounded-lg border border-white/30 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-800 px-2 py-1 text-[10px] text-slate-700 dark:text-zinc-300 outline-none">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {item.assignee
                    ? <div className="flex items-center gap-1.5"><Av user={item.assignee}/><span className="text-slate-600 dark:text-zinc-400">{item.assignee.name||item.assignee.email}</span></div>
                    : <span className="text-slate-400 dark:text-zinc-600">—</span>}
                </td>
                <td className={`px-4 py-3 font-semibold ${overdue?"text-red-500":"text-slate-500 dark:text-zinc-500"}`}>
                  {item.dueDate?new Date(item.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={()=>onDelete(item.id)}
                    className="hidden rounded-md p-1 text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 group-hover:flex">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Board ─────────────────────────────────────────── */
export default function KanbanBoard({ goalId, workspaceId }) {
  const { itemsByGoal, loading, fetchByGoal, updateStatus, deleteItem } = useActionItemStore();
  const [view, setView]       = useState("kanban");
  const [showForm, setShowForm] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [members, setMembers] = useState([]);

  const items = itemsByGoal[goalId] || [];
  const isLoading = loading[goalId];
  const total = items.length;
  const done  = items.filter(i=>i.status==="done").length;
  const pct   = total ? Math.round((done/total)*100) : 0;

  const sensors = useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}));

  useEffect(()=>{ if(goalId) fetchByGoal(goalId); },[goalId]);
  useEffect(()=>{
    if(!workspaceId) return;
    fetch(`http://localhost:5000/api/workspaces/${workspaceId}/members`,{credentials:"include"})
      .then(r=>r.ok?r.json():[]).then(setMembers).catch(()=>{});
  },[workspaceId]);

  const onDragStart = ({active}) => setActiveItem(items.find(i=>i.id===active.id)||null);
  const onDragEnd = async ({active,over}) => {
    setActiveItem(null);
    if(!over||active.id===over.id) return;
    const newStatus=over.id;
    const task=items.find(i=>i.id===active.id);
    if(!task||task.status===newStatus) return;
    useActionItemStore.setState(s=>({itemsByGoal:{...s.itemsByGoal,[goalId]:(s.itemsByGoal[goalId]||[]).map(i=>i.id===active.id?{...i,status:newStatus}:i)}}));
    await updateStatus(active.id,newStatus);
  };

  const handleCreated = item => {
    setShowForm(false);
    useActionItemStore.setState(s=>{
      const ex=s.itemsByGoal[goalId]||[];
      if(ex.some(i=>i.id===item.id)) return s;
      return {itemsByGoal:{...s.itemsByGoal,[goalId]:[item,...ex]}};
    });
  };

  const handleDelete = async id => {
    if(!confirm("Delete this task?")) return;
    await deleteItem(id,goalId);
  };

  return (
    <div className="mt-5 border-t border-white/25 dark:border-white/[0.05] pt-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-violet-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
            </svg>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Action Items</h4>
          </div>
          {total>0 && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/40 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 dark:from-teal-500 dark:to-emerald-500 transition-all duration-500" style={{width:`${pct}%`}}/>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500">{done}/{total}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Board/List toggle */}
          <div className="flex overflow-hidden rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/20 dark:bg-zinc-900">
            {["kanban","list"].map(v=>(
              <button key={v} onClick={()=>setView(v)}
                className={`px-3 py-1.5 text-[11px] font-bold transition ${view===v
                  ? "bg-violet-600 dark:bg-teal-600 text-white"
                  : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"}`}>
                {v==="kanban"?"⊞ Board":"☰ List"}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(p=>!p)}
            className="flex items-center gap-1.5 rounded-xl border border-violet-400/40 dark:border-teal-500/30 bg-violet-50/50 dark:bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-teal-400 transition hover:bg-violet-100/60 dark:hover:bg-teal-500/20">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Task
          </button>
        </div>
      </div>

      {showForm && <CreateForm goalId={goalId} workspaceId={workspaceId} members={members} onCreated={handleCreated} onCancel={()=>setShowForm(false)}/>}

      {isLoading && (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400 dark:text-zinc-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 dark:border-zinc-700 border-t-violet-500 dark:border-t-teal-500"/>
          Loading tasks…
        </div>
      )}

      {!isLoading && total===0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-white/30 dark:border-white/[0.06] bg-white/10 dark:bg-transparent py-10 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-500">No tasks yet</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">Click <strong className="text-violet-600 dark:text-teal-400">New Task</strong> to get started</p>
        </div>
      )}

      {!isLoading && total>0 && view==="kanban" && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {COLS.map(col=>(
              <KanbanCol key={col.id} col={col} onDelete={handleDelete} items={items.filter(i=>i.status===col.id)}/>
            ))}
          </div>
          <DragOverlay dropAnimation={{duration:200,easing:"cubic-bezier(0.18,0.67,0.6,1.22)"}}>
            {activeItem && <TaskCardInner item={activeItem} onDelete={()=>{}} overlay/>}
          </DragOverlay>
        </DndContext>
      )}

      {!isLoading && total>0 && view==="list" && (
        <ListView items={items} onStatusChange={updateStatus} onDelete={handleDelete}/>
      )}
    </div>
  );
}
