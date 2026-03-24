import React from 'react';
import { Play, Square, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionWidget = ({ 
  user,
  sessionActive, 
  sessionTime, 
  formatTime, 
  onStartSession, 
  onConcludeSession 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
      <div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Research Protocol</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' }}>Protocol #RP-2026-X</div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
         <div className="timer" style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatTime(sessionTime)}</div>
           <div style={{ fontSize: '0.75rem', color: sessionActive ? '#10b981' : '#94a3b8', fontWeight: 700 }}>{sessionActive ? '● RECORDING ACTIVE' : '○ SESSION STANDBY'}</div>
         </div>

         <div style={{ display: 'flex', gap: '0.75rem' }}>
           {!sessionActive ? (
             <button onClick={onStartSession} className="btn btn-primary" style={{ padding: '1rem 1.5rem' }}>
               <Play size={18} fill="white" />
               <span>Start Work Session</span>
             </button>
           ) : (
             <button onClick={onConcludeSession} className="btn btn-primary" style={{ padding: '1rem 1.5rem', background: '#ef4444' }}>
               <Square size={18} fill="white" />
               <span>Conclude Session</span>
             </button>
           )}
           <button onClick={() => navigate(`/employee/${user.id}`)} className="btn btn-outline" style={{ padding: '1rem 1.5rem' }}>
              <Eye size={18} />
              <span>PROTOCOL DETAILS</span>
           </button>
         </div>
      </div>
    </div>
  );
};

export default SessionWidget;
