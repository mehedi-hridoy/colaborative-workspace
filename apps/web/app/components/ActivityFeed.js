"use client";
import { useEffect } from "react";
import { useActivityStore } from "../../store/activityStore";

const ICONS = { GOAL_CREATED:"🎯", PROGRESS_UPDATE:"💬", MILESTONE_COMPLETED:"✅", GOAL_STATUS_CHANGED:"🔄" };

function rel(d) {
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if(m<1) return "just now";
  if(m<60) return `${m}m`;
  const h=Math.floor(m/60);
  if(h<24) return `${h}h`;
  return `${Math.floor(h/24)}d`;
}

export default function ActivityFeed({ goalId }) {
  const { activitiesByGoal, loadingByGoal, fetchActivities, startGoalActivityListener, stopGoalActivityListener } = useActivityStore();
  const activities = activitiesByGoal[goalId] || [];
  const loading = loadingByGoal[goalId] || false;

  useEffect(() => {
    if (!goalId) return;
    fetchActivities(goalId);
    startGoalActivityListener(goalId);
    return () => stopGoalActivityListener(goalId);
  }, [goalId, fetchActivities, startGoalActivityListener, stopGoalActivityListener]);

  return (
    <div style={{marginTop:16,borderTop:"1px solid var(--border)",paddingTop:14}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
        <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--text-4)"}}>Activity</span>
        {activities.length>0 && <span className="tag">{activities.length}</span>}
      </div>
      {loading ? (
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",color:"var(--text-4)",fontSize:12}}>
          <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid var(--border)",borderTopColor:"var(--text-accent)",animation:"spin 0.8s linear infinite"}} />
          Loading…
        </div>
      ) : activities.length===0 ? (
        <p style={{background:"var(--bg-tag)",border:"1px dashed var(--border)",borderRadius:12,padding:"16px",textAlign:"center",fontSize:12,color:"var(--text-4)"}}>
          No updates yet — post the first one!
        </p>
      ) : (
        <div style={{position:"relative"}}>
          <div className="timeline-line" />
          {activities.map(act=>(
            <div key={act.id} style={{display:"flex",gap:10,paddingBottom:14,paddingLeft:4}}>
              <div style={{position:"relative",zIndex:1,width:24,height:24,borderRadius:"50%",background:"var(--bg-input)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>
                {ICONS[act.type]||"⚡"}
              </div>
              <div style={{flex:1,background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px"}}>
                <p style={{fontSize:12,color:"var(--text-2)"}}>
                  <span style={{fontWeight:600,color:"var(--text-1)"}}>{act.user?.name||act.user?.email||"User"}</span>
                  {" "}{act.message}
                </p>
                <p style={{fontSize:10,color:"var(--text-4)",marginTop:3}}>{rel(act.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
