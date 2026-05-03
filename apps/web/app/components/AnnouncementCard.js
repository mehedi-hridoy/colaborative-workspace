"use client";
import { useState } from "react";
import { useAnnouncementStore } from "../store/announcementStore";

const EMOJIS = ["🔥","👍","🎉","❤️","👀","🚀"];

function Av({ user }) {
  const l = (user?.name || user?.email || "?")[0].toUpperCase();
  return (
    <span className="avatar" style={{ width:32,height:32,fontSize:12 }} title={user?.name||user?.email}>{l}</span>
  );
}

function rel(d) {
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if(m<1) return "just now";
  if(m<60) return `${m}m ago`;
  const h=Math.floor(m/60);
  if(h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function AnnouncementCard({ item }) {
  const { addReaction, addComment, togglePin } = useAnnouncementStore();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [pinning, setPinning] = useState(false);

  const isPdf = (att) => att?.type === "application/pdf" || /\.pdf($|\?)/i.test(att?.url || "") || /\.pdf$/i.test(att?.name || "");

  const handleComment = async () => {
    if (!comment.trim()||posting) return;
    setPosting(true);
    await addComment(item.id, comment.trim());
    setComment(""); setPosting(false);
  };
  const handlePin = async () => {
    if(pinning) return; setPinning(true);
    await togglePin(item.id); setPinning(false);
  };

  const grouped = (item.reactions||[]).reduce((a,r)=>{ a[r.emoji]=(a[r.emoji]||0)+1; return a; },{});

  return (
    <article className="glass-card" style={{
      padding:16,
      borderTop: item.isPinned ? "2px solid #f59e0b" : undefined,
      marginBottom: 12,
    }}>
      {item.isPinned && (
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:"#f59e0b"}}>📌 Pinned</span>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Av user={item.user} />
          <div>
            <p style={{fontSize:13,fontWeight:600,color:"var(--text-1)"}}>{item.user?.name||item.user?.email||"User"}</p>
            <p style={{fontSize:11,color:"var(--text-4)"}}>{rel(item.createdAt)}</p>
          </div>
        </div>
        <button onClick={handlePin} disabled={pinning} className="btn-ghost" style={{padding:"3px 10px",fontSize:11}}>
          {item.isPinned ? "Unpin" : "📌"}
        </button>
      </div>

      <div style={{fontSize:13,lineHeight:1.65,color:"var(--text-2)",marginBottom:12}}
        dangerouslySetInnerHTML={{__html: item.content}} />

      {/* Attachments */}
      {item.attachments && item.attachments.length > 0 && (
        <div style={{marginBottom:12,display:"flex",flexWrap:"wrap",gap:8}}>
          {item.attachments.map(att => {
            const isImage = att.type?.startsWith("image/");
            const fileName = att.name || att.url?.split("/").pop() || "File";
            return isImage ? (
              <a key={att.id} href={att.url} target="_blank" rel="noreferrer">
                <img src={att.url} alt={fileName} style={{maxHeight:200,maxWidth:"100%",borderRadius:10,border:"1px solid var(--border)",objectFit:"cover"}} />
              </a>
            ) : isPdf(att) ? (
              <div key={att.id} style={{width:"100%",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,border:"1px solid var(--border)",background:"var(--bg-input)",fontSize:12,color:"var(--text-2)"}}>
                  <span style={{fontSize:18}}>📄</span>
                  <span style={{fontWeight:600,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fileName}</span>
                  <a href={att.url} target="_blank" rel="noreferrer" style={{fontWeight:700,color:"var(--text-accent)",textDecoration:"none"}}>
                    Open
                  </a>
                </div>
                <iframe
                  src={att.url}
                  title={fileName}
                  style={{width:"100%",height:420,border:"1px solid var(--border)",borderRadius:10,background:"#fff"}}
                />
              </div>
            ) : (
              <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,border:"1px solid var(--border)",background:"var(--bg-input)",fontSize:12,color:"var(--text-2)",textDecoration:"none"}}>
                <span style={{fontSize:18}}>📄</span>
                <span style={{fontWeight:600}}>{fileName}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Reactions */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,marginBottom:10}}>
        {Object.entries(grouped).map(([emoji,count])=>(
          <button key={emoji} onClick={()=>addReaction(item.id,emoji)}
            style={{display:"flex",alignItems:"center",gap:4,background:"var(--bg-tag)",border:"1px solid var(--border)",borderRadius:999,padding:"2px 10px",cursor:"pointer",fontSize:12,color:"var(--text-3)"}}>
            {emoji}<span style={{fontWeight:600}}>{count}</span>
          </button>
        ))}
        <div style={{display:"flex",gap:4,paddingLeft:8,borderLeft:"1px solid var(--border)"}}>
          {EMOJIS.map(e=>(
            <button key={e} onClick={()=>addReaction(item.id,e)}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:14,opacity:0.35,transition:"opacity 150ms"}}
              onMouseEnter={ev=>ev.target.style.opacity="1"} onMouseLeave={ev=>ev.target.style.opacity="0.35"}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div style={{borderTop:"1px solid var(--border)",paddingTop:10}}>
        <button onClick={()=>setShowComments(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--text-3)"}}>
          💬 {item.comments?.length>0 ? `${item.comments.length} comment${item.comments.length>1?"s":""}` : "Comment"}
          <span style={{transform:showComments?"rotate(180deg)":"none",transition:"transform 150ms",display:"inline-block"}}>▾</span>
        </button>
        {showComments && (
          <div style={{marginTop:10}}>
            {(item.comments||[]).map(c=>(
              <div key={c.id} style={{display:"flex",gap:8,marginBottom:8}}>
                <Av user={c.user} />
                <div style={{background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:10,padding:"6px 12px",flex:1}}>
                  <p style={{fontSize:11,fontWeight:600,color:"var(--text-1)"}}>{c.user?.name||c.user?.email}</p>
                  <p style={{fontSize:12,color:"var(--text-2)",marginTop:2}}>{c.message}</p>
                  <p style={{fontSize:10,color:"var(--text-4)",marginTop:3}}>{rel(c.createdAt)}</p>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment…"
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();handleComment();}}}
                disabled={posting} className="glass-input"
                style={{flex:1,padding:"8px 12px",fontSize:12}} />
              <button onClick={handleComment} disabled={!comment.trim()||posting} className="btn-primary">{posting?"…":"Send"}</button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
