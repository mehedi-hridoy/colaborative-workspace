"use client";
import { useState, useRef } from "react";
import { API_BASE_URL } from "../lib/constants";
import { useAuthStore } from "../../store/authStore";

export default function AvatarUpload({ size = "md" }) {
  const { user, fetchUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      // Refresh user to get new avatar
      await fetchUser();
    } catch (err) {
      console.error(err);
      alert("Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-lg",
  };

  const dim = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="relative inline-block group">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt="Avatar"
          className={`rounded-full object-cover shadow-sm border border-gray-200 dark:border-white/[0.1] ${dim} group-hover:opacity-75 transition-opacity cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        />
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-sm border border-transparent cursor-pointer group-hover:opacity-80 transition-opacity ${dim}`}
        >
          {uploading ? (
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          ) : (
            (user?.name || user?.email || "U").slice(0, 2).toUpperCase()
          )}
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      
      {/* Tooltip hint on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        <div className="bg-black/50 rounded-full w-full h-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
      </div>
    </div>
  );
}
