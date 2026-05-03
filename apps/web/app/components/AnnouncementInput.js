"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAnnouncementStore } from "../store/announcementStore";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AnnouncementInput({ workspaceId }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const { createAnnouncement, fetchAnnouncements } = useAnnouncementStore();

  const handleSubmit = async () => {
    // Strip HTML tags to check if it's actually empty
    const plainText = text.replace(/<[^>]*>?/gm, "").trim();
    if ((!plainText && !attachment) || posting) return;

    setPosting(true);
    setUploadError("");
    const ann = await createAnnouncement(workspaceId, text);

    // Upload attachment if any
    if (attachment && ann?.id) {
      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("announcementId", ann.id);

      try {
        const uploadRes = await fetch("http://localhost:5000/api/upload/file", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.error("File upload failed:", uploadRes.status, errData);
          setUploadError(errData.msg || "File upload failed");
        }
      } catch (err) {
        console.error("File upload error:", err);
        setUploadError("Network error uploading file");
      }
      // Refresh announcements to show the new attachment
      await fetchAnnouncements(workspaceId);
    }

    setText("");
    setAttachment(null);
    setPosting(false);
  };

  const isImage = attachment?.type?.startsWith("image/");
  const attachmentPreview = useMemo(() => {
    if (!attachment) return null;
    return isImage ? URL.createObjectURL(attachment) : null;
  }, [attachment, isImage]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <div className="glass-card flex flex-col" style={{ marginBottom: 12, padding: "14px", overflow: "hidden" }}>
      <div className="quill-dark-wrapper" style={{ minHeight: "120px" }}>
        <ReactQuill
          theme="snow"
          value={text}
          onChange={setText}
          modules={modules}
          placeholder="Share an announcement with your team…"
          readOnly={posting}
        />
      </div>

      {attachment && (
        <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-white/[0.05]">
          {isImage ? (
            <img src={attachmentPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm" />
          ) : (
            <div className="flex items-center justify-center h-12 w-12 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 text-xl flex-shrink-0">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {uploadError && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            ⚠️ {uploadError}
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <div>
          <label className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-gray-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            Attach File
            <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={(!text.replace(/<[^>]*>?/gm, "").trim() && !attachment) || posting}
          className="btn-primary"
        >
          {posting ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
              Posting…
            </span>
          ) : "Post Announcement"}
        </button>
      </div>
    </div>
  );
}
