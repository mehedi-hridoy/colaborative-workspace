"use client";
import { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "../store/notificationStore";

const TYPE_META = {
  COMMENT:  { icon: "💬", label: "Comment"  },
  REACTION: { icon: "🎉", label: "Reaction" },
  MENTION:  { icon: "✦",  label: "Mention"  },
};

function rel(d) {
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if(s<60) return "just now";
  const m=Math.floor(s/60); if(m<60) return `${m}m ago`;
  const h=Math.floor(m/60); if(h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = () => { const n=!open; setOpen(n); if(n) fetchNotifications(); };
  const unread = notifications.filter(n=>!n.isRead);
  const read   = notifications.filter(n=> n.isRead);

  return (
    <>
      <style>{`
        @keyframes nb-in { from{opacity:0;transform:translateY(-10px) scale(0.96)} to{opacity:1;transform:none} }
        @keyframes nb-ping { 75%,100%{transform:scale(2);opacity:0} }
        .nb-in { animation: nb-in 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .nb-ping { animation: nb-ping 1.4s ease infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{position:"relative"}} ref={ref}>
        {/* Bell button */}
        <button id="notification-bell-btn" onClick={toggle} aria-label="Notifications"
          style={{
            position:"relative", width:36, height:36, borderRadius:"50%",
            border:"1px solid var(--border)",
            background: open ? "rgba(var(--accent-rgb),0.15)" : "var(--bg-tag)",
            backdropFilter:"blur(var(--blur))",
            color:"var(--text-2)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 150ms ease",
          }}
        >
          <svg style={{width:17,height:17}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && <>
            <span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",borderRadius:999,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",padding:"0 3px",zIndex:2}}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
            <span className="nb-ping" style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"rgba(239,68,68,0.5)",zIndex:1}} />
          </>}
        </button>

        {/* Dropdown */}
        {open && (
          <div id="notification-dropdown" className="nb-in" style={{
            position:"absolute", right:0, top:44, zIndex:999,
            width:360, borderRadius:18,
            border:"1px solid var(--border)",
            background:"var(--bg-card)",
            backdropFilter:"blur(24px)",
            boxShadow:"var(--shadow-hover)",
            overflow:"hidden",
          }}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:700,color:"var(--text-1)"}}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{background:"rgba(239,68,68,0.15)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.3)",borderRadius:999,padding:"1px 8px",fontSize:10,fontWeight:700}}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {unreadCount > 0 && (
                  <button id="mark-all-read-btn" onClick={markAllRead}
                    style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--text-accent)"}}>
                    <svg style={{width:11,height:11}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Mark all read
                  </button>
                )}
                <button onClick={()=>setOpen(false)}
                  style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-4)",fontSize:16,lineHeight:1,padding:"2px 6px"}}>✕</button>
              </div>
            </div>

            {/* Body */}
            <div style={{maxHeight:440,overflowY:"auto"}}>
              {loading ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"48px 0",color:"var(--text-4)"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid var(--border)",borderTopColor:"var(--text-accent)",animation:"spin 0.8s linear infinite"}} />
                  <p style={{fontSize:12}}>Loading…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"48px 24px",textAlign:"center"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:"var(--bg-tag)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔔</div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:"var(--text-1)"}}>All caught up!</p>
                    <p style={{fontSize:11,color:"var(--text-4)",marginTop:4,lineHeight:1.6}}>Notifications appear here when someone<br/>comments, reacts, or mentions you.</p>
                  </div>
                </div>
              ) : (
                <>
                  {unread.length > 0 && (
                    <div>
                      <p style={{padding:"8px 18px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--text-4)",background:"var(--bg-tag)"}}>New</p>
                      {unread.map(n=><NItem key={n.id} n={n} onClick={()=>markAsRead(n.id)} />)}
                    </div>
                  )}
                  {read.length > 0 && (
                    <div>
                      <p style={{padding:"8px 18px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--text-4)",background:"var(--bg-tag)"}}>Earlier</p>
                      {read.map(n=><NItem key={n.id} n={n} onClick={()=>{}} />)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",borderTop:"1px solid var(--border)",background:"var(--bg-input)"}}>
                <p style={{fontSize:10,color:"var(--text-4)"}}>{notifications.length} total · {unreadCount} unread</p>
                <button onClick={fetchNotifications}
                  style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--text-3)"}}>
                  ↻ Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function NItem({ n, onClick }) {
  const meta = TYPE_META[n.type] || { icon:"🔔", label: n.type };
  const name = n.actor?.name || n.actor?.email || "Someone";
  return (
    <div onClick={onClick} style={{
      display:"flex", gap:12, padding:"12px 18px", cursor:"pointer",
      background: n.isRead ? "transparent" : "rgba(var(--accent-rgb),0.05)",
      borderBottom:"1px solid var(--border)",
      transition:"background 120ms",
    }}
    onMouseEnter={e=>e.currentTarget.style.background="var(--bg-card-hover)"}
    onMouseLeave={e=>e.currentTarget.style.background=n.isRead?"transparent":"rgba(var(--accent-rgb),0.05)"}
    >
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,rgba(var(--accent-rgb),1),rgba(var(--accent-rgb),0.5))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>
          {name[0].toUpperCase()}
        </div>
        <span style={{position:"absolute",bottom:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"var(--bg-card)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>
          {meta.icon}
        </span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:12,lineHeight:1.5,color:"var(--text-2)"}}>
          <span style={{fontWeight:700,color:"var(--text-1)"}}>{name}</span>{" "}{n.message}
        </p>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
          <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-accent)"}}>{meta.label}</span>
          <span style={{fontSize:10,color:"var(--text-4)"}}>{rel(n.createdAt)}</span>
        </div>
      </div>
      {!n.isRead && <span style={{width:7,height:7,borderRadius:"50%",background:"var(--text-accent)",flexShrink:0,marginTop:4}} />}
    </div>
  );
}
