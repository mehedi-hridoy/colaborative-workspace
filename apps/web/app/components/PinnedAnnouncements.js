"use client";

export default function PinnedAnnouncements({ announcements = [] }) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-gray-400 dark:text-zinc-600">No pinned announcements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.slice(0, 3).map((announcement) => {
        const author = announcement.author || {};
        const initials = (author.name || author.email || "U")
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        const likes = announcement.likes || 0;
        const comments = announcement.comments || 0;
        const shares = announcement.shares || 0;

        return (
          <div
            key={announcement.id}
            className="rounded-md border border-gray-200 dark:border-white/[0.08] bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900/50 dark:to-zinc-900/30 p-3.5 hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-sm transition group"
          >
            {/* Header with author */}
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-400 dark:to-orange-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                  {author.name || "Team"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                  {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button className="text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                ⋯
              </button>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 leading-tight">
              {announcement.title}
            </h4>

            {/* Description */}
            {announcement.description && (
              <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-snug">
                {announcement.description}
              </p>
            )}

            {/* Attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2 custom-scrollbar">
                {announcement.attachments.map(att => (
                  att.type.startsWith("image/") ? (
                    <img key={att.id} src={att.url} alt="Attachment" className="h-16 w-auto rounded object-cover border border-gray-200 dark:border-zinc-700 shadow-sm" />
                  ) : (
                    <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-16 w-16 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 text-xs text-blue-500 hover:underline flex-shrink-0">
                      📄 File
                    </a>
                  )
                ))}
              </div>
            )}

            {/* Engagement Metrics */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-zinc-600 pt-2 border-t border-gray-100 dark:border-white/[0.05]">
              <span className="flex items-center gap-1.5 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer">
                <span>❤️</span>
                <span className="font-medium">{likes}</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition cursor-pointer">
                <span>💬</span>
                <span className="font-medium">{comments}</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-green-500 dark:hover:text-green-400 transition cursor-pointer">
                <span>↗️</span>
                <span className="font-medium">{shares}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
