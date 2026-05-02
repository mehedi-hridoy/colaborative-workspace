"use client";

import { useEffect } from "react";
import { useActivityStore } from "../../store/activityStore";

export default function ActivityFeed({ goalId }) {
  const {
    activitiesByGoal,
    loadingByGoal,
    fetchActivities,
    startGoalActivityListener,
    stopGoalActivityListener,
  } = useActivityStore();

  const activities = activitiesByGoal[goalId] || [];
  const loading = loadingByGoal[goalId] || false;

  useEffect(() => {
    if (!goalId) return;

    fetchActivities(goalId);
    startGoalActivityListener(goalId);

    return () => {
      stopGoalActivityListener(goalId);
    };
  }, [goalId, fetchActivities, startGoalActivityListener, stopGoalActivityListener]);

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-2 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
          />
        </svg>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Activity Feed
        </h4>
        {activities.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {activities.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-3">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-xs text-slate-400">Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
          No updates yet. Post the first one!
        </p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group rounded-md bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100"
            >
              <div className="flex items-start gap-2.5">
                {/* Avatar circle */}
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
                  {(
                    activity.user?.name ||
                    activity.user?.email ||
                    "U"
                  )
                    .slice(0, 1)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {activity.user?.name || activity.user?.email || "User"}
                    </span>{" "}
                    {activity.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
