"use client";

import { useState } from "react";
import { useAnnouncementStore } from "../store/announcementStore";

export default function AnnouncementInput({ workspaceId }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const { createAnnouncement } = useAnnouncementStore();

  const handleSubmit = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    await createAnnouncement(workspaceId, text.trim());
    setText("");
    setPosting(false);
  };

  const insertTag = (tagOpen, tagClose = null) => {
    tagClose = tagClose ?? tagOpen.replace(/</g, '</');
    const textarea = document.getElementById(`announcement-text-${workspaceId}`);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.slice(0, start);
    const sel = text.slice(start, end) || 'Your text';
    const after = text.slice(end);
    const next = before + tagOpen + sel + tagClose + after;
    setText(next);
    // move cursor after inserted block
    const pos = before.length + tagOpen.length + sel.length + tagClose.length;
    setTimeout(() => textarea.setSelectionRange(pos, pos), 0);
  };

  const applyColor = (color) => {
    insertTag(`<span style=\"color:${color}\">`, `</span>`);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" onClick={() => insertTag('<strong>', '</strong>')} className="rounded px-2 py-1 text-xs font-semibold border">B</button>
        <button type="button" onClick={() => insertTag('<em>', '</em>')} className="rounded px-2 py-1 text-xs italic border">I</button>
        <button type="button" onClick={() => insertTag('<h3>', '</h3>')} className="rounded px-2 py-1 text-xs font-semibold border">H3</button>
        <input type="color" onChange={(e) => applyColor(e.target.value)} value="#000000" className="h-8 w-8 border-0 p-0" />
        <span className="text-xs text-slate-400">Tip: select text then click a format button.</span>
      </div>

      <textarea
        id={`announcement-text-${workspaceId}`}
        placeholder="Write an announcement..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        disabled={posting}
        className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400 disabled:text-slate-400"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || posting}
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {posting ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
}
