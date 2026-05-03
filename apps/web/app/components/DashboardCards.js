"use client";

import { Icons } from "../lib/icons";

export function StatCard({ icon: Icon, label, value, change, isPositive = true }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
          {Icon && <Icon size={20} className="text-black" />}
        </div>
        {change && (
          <div className={`text-xs font-medium flex items-center gap-1 ${isPositive ? "text-[#10b981]" : "text-[#b30000]"}`}>
            {isPositive ? "↑" : "↓"} {change}
          </div>
        )}
      </div>
      <p className="text-[#93939f] text-sm mb-2">{label}</p>
      <p className="text-3xl font-normal tracking-tighter">{value}</p>
    </div>
  );
}

export function GoalProgressCard({ goal, progress }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-medium mb-1">{goal.name}</h3>
          <p className="text-xs text-[#93939f]">{goal.description}</p>
        </div>
        <Icons.ChevronRight size={18} className="text-[#93939f]" />
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">{progress}% Complete</span>
          <span className="text-xs text-[#93939f]">Milestones: {goal.milestones || 0}</span>
        </div>
        <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#003c33] to-[#10b981] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Due Date */}
      {goal.dueDate && (
        <p className="text-xs text-[#75758a]">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
      )}
    </div>
  );
}

export function TaskCard({ task }) {
  const statusColors = {
    todo: { bg: "#e5e7eb", text: "#74748a" },
    "in-progress": { bg: "#dbeafe", text: "#1863dc" },
    done: { bg: "#dcfce7", text: "#10b981" },
  };

  const statusColor = statusColors[task.status] || statusColors.todo;

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium flex-1">{task.title}</h4>
        <button className="p-1 hover:bg-[#f5f5f5] rounded transition-colors">
          <Icons.MoreHorizontal size={16} className="text-[#93939f]" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
        >
          {task.status}
        </span>

        {task.priority && (
          <span className="text-xs px-2 py-1 rounded bg-[#fef3c7] text-[#92400e]">
            {task.priority}
          </span>
        )}

        {task.assignee && (
          <div className="ml-auto w-6 h-6 bg-[#003c33] rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">{task.assignee[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnnouncementCardCompact({ announcement }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-[#003c33] rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {announcement.author?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{announcement.author}</p>
            <p className="text-xs text-[#93939f]">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {announcement.pinned && (
          <Icons.Pin size={18} className="text-[#ff7759]" />
        )}
      </div>

      <p className="text-sm text-[#212121] mb-4 line-clamp-3">{announcement.title}</p>

      <div className="flex items-center gap-4 text-xs text-[#93939f]">
        <button className="flex items-center gap-1 hover:text-[#1863dc] transition-colors">
          <Icons.Heart size={16} />
          <span>{announcement.reactions || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[#1863dc] transition-colors">
          <Icons.MessageCircle size={16} />
          <span>{announcement.comments || 0}</span>
        </button>
      </div>
    </div>
  );
}

export function ActivityFeedItem({ activity }) {
  const actionIcons = {
    task_created: Icons.ActionItems,
    goal_created: Icons.Goals,
    announcement: Icons.Announcements,
    comment: Icons.MessageCircle,
  };

  const Icon = actionIcons[activity.type] || Icons.Activity;

  return (
    <div className="flex gap-4 pb-4 border-b border-[#e5e7eb] last:border-0">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-[#f5f5f5] rounded-full flex items-center justify-center">
          <Icon size={16} className="text-[#93939f]" />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.actor}</span>
          <span className="text-[#93939f]"> {activity.action}</span>
        </p>
        <p className="text-xs text-[#75758a] mt-1">{activity.description}</p>
        <p className="text-xs text-[#93939f] mt-2">{activity.timestamp}</p>
      </div>
    </div>
  );
}

// More icons needed
const MoreHorizontal = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

Icons.MoreHorizontal = MoreHorizontal;
