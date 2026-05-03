"use client";
import { useEffect } from "react";
import { useAnnouncementStore } from "../store/announcementStore";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementFeed({ workspaceId }) {
  const { announcements, loading, fetchAnnouncements, initSocket, cleanupSocket } = useAnnouncementStore();

  useEffect(() => {
    if(!workspaceId) return;
    fetchAnnouncements(workspaceId);
    initSocket(workspaceId);
    return () => cleanupSocket();
  }, [workspaceId]);

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:32,color:"var(--text-4)",fontSize:12}}>
      <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid var(--border)",borderTopColor:"var(--text-accent)",animation:"spin 0.8s linear infinite"}} />
      Loading…
    </div>
  );

  if(announcements.length===0) return (
    <div style={{background:"var(--bg-tag)",border:"1px dashed var(--border)",borderRadius:14,padding:32,textAlign:"center"}}>
      <p style={{fontSize:12,color:"var(--text-4)"}}>No announcements yet — be the first to post!</p>
    </div>
  );

  return (
    <div>
      {announcements.map(a=><AnnouncementCard key={a.id} item={a} />)}
    </div>
  );
}
