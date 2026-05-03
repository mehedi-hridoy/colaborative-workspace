"use client";

export default function TasksOverview({ stats = { todo: 0, inProgress: 0, done: 0 } }) {
  const total = stats.todo + stats.inProgress + stats.done || 1;
  const donePct = Math.round((stats.done / total) * 100);
  const inPct = Math.round((stats.inProgress / total) * 100);
  const todoPct = 100 - donePct - inPct;

  const size = 120;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const doneOffset = circumference * (1 - donePct / 100);
  const inOffset = circumference * (1 - (donePct + inPct) / 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        {/* Chart */}
        <div className="flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
            <g transform={`translate(${size/2},${size/2})`}>
              {/* Background circle */}
              <circle r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
              {/* Done segment */}
              {donePct > 0 && (
                <circle 
                  r={radius} 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth={stroke} 
                  strokeDasharray={`${circumference * donePct / 100} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              )}
              {/* In Progress segment */}
              {inPct > 0 && (
                <circle 
                  r={radius} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth={stroke} 
                  strokeDasharray={`${circumference * inPct / 100} ${circumference}`}
                  strokeDashoffset={-circumference * donePct / 100}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              )}
              {/* Todo segment */}
              {todoPct > 0 && (
                <circle 
                  r={radius} 
                  fill="none" 
                  stroke="#9ca3af" 
                  strokeWidth={stroke} 
                  strokeDasharray={`${circumference * todoPct / 100} ${circumference}`}
                  strokeDashoffset={-circumference * (donePct + inPct) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              )}
              {/* Center text */}
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dy="0.3em" 
                className="fill-gray-900 dark:fill-white text-sm font-black"
              >
                {donePct}%
              </text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Done</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{stats.done}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-gray-500 dark:text-zinc-400">{donePct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">In Progress</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{stats.inProgress}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-gray-500 dark:text-zinc-400">{inPct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-gray-400" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Todo</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{stats.todo}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-gray-500 dark:text-zinc-400">{todoPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
