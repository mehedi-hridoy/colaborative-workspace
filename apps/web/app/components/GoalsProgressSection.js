"use client";

export default function GoalsProgressSection({ goals = [], onGoalClick = null }) {
  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📊</span> Goals Progress
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
          Track progress across all company goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.slice(0, 6).map((goal) => {
          const progress = calculateProgress(goal.milestones);
          const milestonesCount = goal.milestones?.length || 0;
          const completedCount = goal.milestones?.filter((m) => m.completed).length || 0;

          return (
            <div
              key={goal.id}
              onClick={() => onGoalClick?.(goal.id)}
              className="glass-card p-4 group glass-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                    {goal.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                    {completedCount}/{milestonesCount} milestones
                  </p>
                </div>
                <span className="text-xl opacity-15">📌</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/30 dark:bg-zinc-800/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 dark:from-teal-500 dark:to-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Due date if available */}
              {goal.dueDate && (
                <p className="text-[10px] text-slate-400 dark:text-zinc-600">
                  📅{" "}
                  {new Date(goal.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: goal.dueDate && new Date(goal.dueDate).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
