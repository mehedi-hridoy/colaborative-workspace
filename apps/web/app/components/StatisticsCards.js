"use client";

export default function StatisticsCards({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.id} className="glass-card p-5 group glass-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-2">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.subtext && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {stat.subtext}
                  </span>
                )}
              </div>
            </div>
            {stat.icon && (
              <span className="text-2xl opacity-10 group-hover:opacity-20 transition">
                {stat.icon}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {stat.progress !== undefined && (
            <>
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-500">
                <span>PROGRESS</span>
                <span>{stat.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/30 dark:bg-zinc-800/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stat.barGradient || "bg-gradient-to-r from-violet-500 to-purple-600 dark:from-teal-500 dark:to-emerald-500"
                  }`}
                  style={{ width: `${Math.min(stat.progress, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
