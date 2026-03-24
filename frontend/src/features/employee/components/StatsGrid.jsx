import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-3">
      <div className="card">
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
           <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '10px' }}><Clock style={{ color: '#0ea5e9' }} /></div>
           <div style={{ fontWeight: 700 }}>Avg. Work Duration</div>
         </div>
         <div style={{ fontSize: '2rem', fontWeight: 800 }}>08:24 <span style={{ fontSize: '0.875rem', color: '#10b981' }}>+4%</span></div>
      </div>
      <div className="card">
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
           <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '10px' }}><Calendar style={{ color: '#f59e0b' }} /></div>
           <div style={{ fontWeight: 700 }}>Research Meetings</div>
         </div>
         <div style={{ fontSize: '2rem', fontWeight: 800 }}>12 <span style={{ fontSize: '0.875rem', color: '#64748b' }}>this month</span></div>
      </div>
      <div className="card">
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
           <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '10px' }}><CheckCircle2 style={{ color: '#10b981' }} /></div>
           <div style={{ fontWeight: 700 }}>Tasks Completed</div>
         </div>
         <div style={{ fontSize: '2rem', fontWeight: 800 }}>45 <span style={{ fontSize: '0.875rem', color: '#10b981' }}>On track</span></div>
      </div>
    </div>
  );
};

export default StatsGrid;
