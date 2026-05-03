"use client";
import { Icons } from "../lib/icons";
import TopBar from "../app/components/TopBar";
import NotificationBell from "../app/components/NotificationBell";
import KanbanBoard from "../app/components/KanbanBoard";

export default function ActionItemsView({ goals, currentWorkspace }) {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Action Items" subtitle="Manage and track all tasks across your workspace." searchPlaceholder="Search tasks...">
        <NotificationBell />
      </TopBar>

      <div className="flex-1 overflow-y-auto p-6">
        {!currentWorkspace ? (
          <div className="glass-card p-16 text-center">
            <div className="flex justify-center mb-4">
              <Icons.Menu size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace to see tasks</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="flex justify-center mb-4">
              <Icons.Check size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-bold text-slate-700 dark:text-zinc-300">No goals yet — create goals first to manage tasks</p>
          </div>
        ) : (
          <div className="space-y-8">
            {goals.map(goal => (
              <div key={goal.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">{goal.title}</h2>
                  <div className="h-px flex-1 bg-white/25 dark:bg-white/[0.06]" />
                </div>
                <KanbanBoard goalId={goal.id} workspaceId={currentWorkspace.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
