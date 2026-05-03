"use client";

export default function RichActivityFeed({ activities = [] }) {
  const getInitials = (name, email) => {
    const displayName = name || email || "U";
    return displayName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTime = (date) => {
    const now = new Date();
    const actDate = new Date(date);
    const diffMs = now - actDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return actDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-gray-400 dark:text-zinc-600">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {activities.slice(0, 6).map((activity, idx) => {
        const user = activity.user || {};
        const initials = getInitials(user.name, user.email);

        return (
          <div
            key={activity.id || idx}
            className="flex gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition group"
          >
            {/* User Avatar */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {initials}
              </div>
            </div>

            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">
                {activity.message || "took an action"}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-1">
                {formatTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
