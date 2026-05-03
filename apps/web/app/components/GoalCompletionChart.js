"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GoalCompletionChart({ goals }) {
  const data = useMemo(() => {
    return goals.map((goal) => {
      const totalMilestones = goal.milestones?.length || 0;
      const completedMilestones =
        goal.milestones?.filter((m) => m.completed).length || 0;
      const progress =
        totalMilestones === 0
          ? 0
          : Math.round((completedMilestones / totalMilestones) * 100);

      return {
        name: goal.title.length > 15 ? goal.title.substring(0, 15) + "..." : goal.title,
        Progress: progress,
      };
    });
  }, [goals]);

  if (!goals || goals.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Goal Completion Progress
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" opacity={0.2} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.8)",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#10B981" }}
            />
            <Bar
              dataKey="Progress"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
