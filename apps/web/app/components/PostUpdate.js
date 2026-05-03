"use client";
import { useState } from "react";
import { useActivityStore } from "../../store/activityStore";

export default function PostUpdate({ goalId, onPostSuccess }) {
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const { postActivity, fetchActivities } = useActivityStore();

  const handlePost = async () => {
    if ((!message.trim() && !attachment) || posting) return;
    setPosting(true);
    const activity = await postActivity(goalId, message.trim());

    if (activity?.id) {
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        formData.append("activityId", activity.id);

        await fetch( `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/file` , {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        await fetchActivities(goalId);
      }

      setMessage("");
      setAttachment(null);
      if (onPostSuccess) onPostSuccess();
    }
    setPosting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  const isImage = attachment?.type?.startsWith("image/");
  const attachmentPreview = isImage ? URL.createObjectURL(attachment) : null;

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
      {attachment && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-white/[0.05]">
          {isImage ? (
            <img src={attachmentPreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm" />
          ) : (
            <div className="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 text-lg flex-shrink-0">
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-500">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button onClick={() => setAttachment(null)} className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Post a progress update… (Enter to send)"
          value={message} onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={posting} className="glass-input"
          style={{ flex: 1, padding: "9px 14px", fontSize: 13 }} />

        <label className="flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition">
          <svg className="w-4 h-4 text-gray-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />
        </label>

        <button onClick={handlePost} disabled={(!message.trim() && !attachment) || posting} className="btn-primary">
          {posting ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />Posting</span> : "Post"}
        </button>
      </div>
    </div>
  );
}
