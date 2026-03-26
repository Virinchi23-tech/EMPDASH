import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { 
  LogIn, LogOut, Clock, Calendar, History, Activity, Timer, ChevronRight, RefreshCw, User, Search, Filter, ShieldCheck, XCircle, AlertCircle, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Offline');
  
  const [adminFilters, setAdminFilters] = useState({ date: '', employee: '' });

  const isAdmin = user?.role === 'Admin';

  const fetchData = useCallback(async (isClear = false) => {
    try {
      console.log('📡 [Attendance] Initializing Data Acquisition Lifecycle...');
      setLoading(true);
      
      const filtersToUse = isClear ? { date: '', employee: '' } : adminFilters;

      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/me'),
        api.get('/attendance/history')
      ]);

      console.log('📦 [Attendance] Today Pulse Logic:', todayRes.data);
      console.log('📦 [Attendance] Historical Records:', historyRes.data);

      if (todayRes.data.success) {
        setTodayRecord(todayRes.data.data);
        setCurrentStatus(todayRes.data.data?.status || 'Offline');
      }

      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }

      if (isAdmin) {
        const queryParams = new URLSearchParams();
        if (filtersToUse.date) queryParams.append('date', filtersToUse.date);
        if (filtersToUse.employee) queryParams.append('emp_id', filtersToUse.employee);
        
        console.log('🛠️ [Attendance] Admin Telemetry Query:', queryParams.toString());
        const allRes = await api.get(`/attendance/all?${queryParams.toString()}`);
        console.log('📦 [Attendance] Global Personnel Data:', allRes.data);
        
        if (allRes.data.success) {
          setAllAttendance(allRes.data.data);
        }
      }
    } catch (err) {
      console.error('🔥 [Attendance] Sync Failure:', err.message);
      toast.error('Identity sync error. Database cloud tunnel failed.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminFilters]);

  useEffect(() => {
    fetchData();
    let interval;
    if (isAdmin) {
      interval = setInterval(() => fetchData(), 60000); 
    }
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAction = async (action) => {
    try {
      console.log(`🚀 [Attendance] Triggering Lifecycle Action: ${action}`);
      setBtnLoading(true);
      const endpoint = action === 'check-in' ? '/attendance/checkin' : '/attendance/checkout';
      const res = await api.post(endpoint);
      
      console.log('✅ [Attendance] Action Successful:', res.data);
      toast.success(res.data.message);
      
      // Mandatory registry reload
      window.location.reload(); // Hard reload or wait and fetch
    } catch (err) {
      const msg = err.response?.data?.message || 'Operational handshake failed';
      console.error('❌ [Attendance] Action Rejected:', msg);
      toast.error(msg);
    } finally {
      setBtnLoading(false);
    }
  };

  const clearFilters = () => {
    setAdminFilters({ date: '', employee: '' });
    fetchData(true);
  };

  if (!user) return <div className="p-20 text-center font-black animate-pulse text-gray-300 text-3xl italic">Synchronizing Primary Node...</div>;

  const isCheckedIn = currentStatus === 'Checked In';
  const isCheckedOut = currentStatus === 'Checked Out';

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900 px-4 md:px-0">
      {/* Dynamic Header actions */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-12 bg-white rounded-[60px] border-2 border-slate-50 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-[0_5px_20px_rgba(37,99,235,0.4)]"></div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Security Loop</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-[11px] flex items-center gap-4">
             <div className={`w-3.5 h-3.5 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 shadow-inner'}`} />
             Registry Lifecycle Activity &bull; Candidate: <span className="text-blue-600 font-black">{user.name} ({user.emp_id})</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-8 mt-12 lg:mt-0 relative z-10 w-full lg:w-auto">
           <div className={`px-14 py-8 rounded-[40px] flex flex-col items-center justify-center min-w-[280px] border shadow-inner transition-all w-full sm:w-auto
             ${isCheckedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
               isCheckedOut ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
              <span className="text-[11px] uppercase font-black tracking-[0.4em] mb-3 opacity-40 italic">Registry Status</span>
              <span className="text-4xl font-black uppercase tracking-tighter italic leading-none">{currentStatus}</span>
           </div>
           
           <div className="flex flex-wrap gap-5 w-full sm:w-auto justify-center">
                <button 
                  disabled={isCheckedIn || isCheckedOut || btnLoading}
                  onClick={() => handleAction('check-in')}
                  className={`w-full sm:w-auto p-7 px-12 rounded-[35px] shadow-3xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-5
                    ${(isCheckedIn || isCheckedOut) ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200 opacity-60' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                >
                  <LogIn size={32} strokeWidth={3} />
                  <span className="text-xl font-black uppercase tracking-[0.2em] leading-none">Arrival</span>
                </button>

                <button 
                  disabled={!isCheckedIn || btnLoading}
                  onClick={() => handleAction('check-out')}
                  className={`w-full sm:w-auto p-7 px-12 rounded-[35px] shadow-3xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-5
                    ${(!isCheckedIn) ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200 opacity-60' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'}`}
                >
                  <LogOut size={32} strokeWidth={3} />
                  <span className="text-xl font-black uppercase tracking-[0.2em] leading-none">Departure</span>
                </button>
           </div>
        </div>
      </motion.div>

      {/* Primary Registry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white rounded-[60px] border border-slate-100 shadow-3xl overflow-hidden min-h-[700px] flex flex-col"
           >
              <div className="p-14 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-blue-50/10 gap-10">
                 <div className="flex items-center gap-10">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-[40px] flex items-center justify-center shadow-4xl shadow-blue-200"><History size={48} /></div>
                    <div>
                       <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none select-none">Registry Audit Log</h2>
                       <p className="text-[12px] font-black text-slate-400 tracking-[0.5em] uppercase mt-4 italic">{isAdmin ? 'Enterprise Multi-Node History Telemetry' : 'Personal Lifecycle Activity Stream'}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                   <button onClick={clearFilters} className="p-5 bg-slate-50 text-slate-400 rounded-3xl border border-slate-100 hover:text-indigo-600 transition-all shadow-inner group" title="Clear All Filters"><RotateCcw size={28} className="group-active:rotate-180 transition-transform" /></button>
                   <button onClick={() => fetchData()} className="p-5 bg-white text-slate-400 rounded-3xl border border-slate-100 hover:text-blue-600 transition-all shadow-sm"><RefreshCw size={28} className={loading ? 'animate-spin' : ''} /></button>
                 </div>
              </div>

              <div className="p-12 flex-1">
                 {isAdmin ? (
                   <div className="space-y-12">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 bg-slate-50/40 p-10 rounded-[50px] border border-slate-100/50">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Audit Timestamp</label>
                           <input type="date" value={adminFilters.date} onChange={e => setAdminFilters(prev => ({...prev, date: e.target.value}))} className="w-full p-6 bg-white border border-slate-100 rounded-[30px] font-black focus:border-blue-600 outline-none shadow-sm text-md font-mono" />
                        </div>
                        <div className="space-y-3 sm:col-span-2">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Identify Target (ID or Name)</label>
                           <div className="relative">
                              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                              <input placeholder="Query emp_id or global name..." value={adminFilters.employee} onChange={e => setAdminFilters(prev => ({...prev, employee: e.target.value}))} className="w-full pl-16 p-6 bg-white border border-slate-100 rounded-[30px] font-black focus:border-blue-600 outline-none shadow-sm text-md placeholder:font-serif italic" />
                           </div>
                        </div>
                     </div>

                     <div className="overflow-x-auto pb-10">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[13px] font-black text-slate-300 uppercase tracking-[0.4em] border-b-2 border-slate-50">
                                <th className="pb-10 px-8 italic">Personnel</th>
                                <th className="pb-10 px-8 italic">Audit-Date</th>
                                <th className="pb-10 px-8 italic text-blue-600">Cycle-IN</th>
                                <th className="pb-10 px-8 italic text-red-500">Cycle-OUT</th>
                                <th className="pb-10 px-8 text-right italic text-indigo-500 font-serif">Utilization</th>
                                <th className="pb-10 px-8 text-right italic">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {allAttendance.length > 0 ? allAttendance.map((record) => (
                               <tr key={record.id} className="group hover:bg-blue-50/30 transition-all border-l-[10px] border-transparent hover:border-blue-600">
                                  <td className="py-10 px-8">
                                     <div className="flex items-center gap-8">
                                        <div className="relative">
                                           <div className="w-16 h-16 rounded-[25px] bg-slate-50 border-2 border-white flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all text-xl shadow-inner font-serif italic">
                                              {record.employee_name ? record.employee_name[0] : '?'}
                                           </div>
                                           {record.status === 'Checked In' && (
                                              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white animate-pulse shadow-2xl ring-4 ring-emerald-500/10" />
                                           )}
                                        </div>
                                        <div>
                                           <p className="font-black text-slate-900 text-lg whitespace-nowrap leading-none mb-3 italic uppercase tracking-tighter">{record.employee_name || 'Personnel'}</p>
                                           <p className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] font-mono select-all bg-blue-50/50 px-2 py-0.5 rounded-lg inline-block transition-all group-hover:bg-blue-100">{record.employee_id}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="py-10 px-8 font-black text-slate-400 text-sm italic font-mono">{record.date}</td>
                                  <td className="py-10 px-8 font-black text-slate-900 text-lg font-mono tracking-tight">{record.check_in_time || '--:--'}</td>
                                  <td className="py-10 px-8 font-black text-slate-900 text-lg font-mono tracking-tight">{record.check_out_time || '--:--'}</td>
                                  <td className="py-10 px-8 text-right">
                                     <span className="px-5 py-2 bg-slate-900 rounded-2xl text-[11px] font-black text-white italic shadow-lg shadow-slate-300">{record.total_hours ? parseFloat(record.total_hours).toFixed(2) : '0.00'}h</span>
                                  </td>
                                  <td className="py-10 px-8 text-right">
                                     <span className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest border-2 transition-all ${
                                       record.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                       record.status === 'Checked Out' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                       'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                                     }`}>
                                        {record.status}
                                     </span>
                                  </td>
                               </tr>
                             )) : (
                               <tr><td colSpan="6" className="py-48 text-center text-slate-200 font-black uppercase tracking-[2em] italic text-3xl opacity-20 select-none font-serif">Registry Audit Empty</td></tr>
                             )}
                          </tbody>
                       </table>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-12">
                      {history.length > 0 ? history.map((record, i) => (
                        <div key={i} className="bg-white p-12 rounded-[55px] border-2 border-slate-50 hover:shadow-4xl hover:-translate-y-3 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16 border-l-[15px] border-transparent hover:border-indigo-600 bg-gradient-to-br from-white to-slate-50/50">
                           <div className="flex items-center gap-12">
                              <div className="w-24 h-24 bg-slate-100 rounded-[35px] border-4 border-white shadow-2xl flex flex-col items-center justify-center group-hover:bg-indigo-600 transition-all scale-100 group-hover:scale-110">
                                 <span className="text-[12px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-100 transition-colors italic">Audit</span>
                                 <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-white transition-colors font-serif">{record.date.split('-')[2]}</span>
                              </div>
                              <div>
                                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic font-serif">{new Date(record.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                 <div className="flex items-center gap-6 mt-6">
                                    <Clock size={20} className="text-slate-200" />
                                    <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none select-all">Secure_Record_Index:: {record.id}</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-wrap gap-16 items-center justify-center">
                              <div className="text-center group/time">
                                 <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 group-hover/time:text-blue-500 transition-colors italic">Pulse-In</p>
                                 <p className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{record.check_in_time || '--:--'}</p>
                              </div>
                              <div className="text-center group/time">
                                 <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 group-hover/time:text-red-500 transition-colors italic">Pulse-Out</p>
                                 <p className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{record.check_out_time || '--:--'}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 italic">Shift-Net</p>
                                 <p className="text-3xl font-black text-indigo-600 tracking-tighter underline underline-offset-[12px] decoration-indigo-100 decoration-[6px] italic">{record.total_hours ? parseFloat(record.total_hours).toFixed(2) : '0.00'}h</p>
                              </div>
                              <div className="bg-slate-100 px-10 py-7 rounded-[35px] border-2 border-white shadow-inner group-hover:bg-white transition-all min-w-[200px] text-center border-t-8 border-t-transparent group-hover:border-t-indigo-300 flex flex-col justify-center">
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic leading-none">Security Cycle</p>
                                 <p className="text-md font-black text-slate-900 tracking-[0.3em] uppercase italic leading-none">{record.status}</p>
                              </div>
                           </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none py-40 grayscale space-y-12 bg-slate-50/20 rounded-[50px] border-2 border-dashed border-slate-100">
                           <XCircle size={160} className="text-slate-200 group-hover:rotate-12 transition-transform duration-700" />
                           <div className="space-y-6">
                             <h3 className="text-5xl font-black text-slate-300 uppercase tracking-[1em] italic select-none">No Attendance Found</h3>
                             <p className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5em] underline decoration-indigo-500 underline-offset-[16px] decoration-[5px] opacity-60 font-serif">Neural Registry Active for Global Node {user.emp_id}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </motion.div>
        </div>

        {/* Global Statistics Panel */}
        <div className="space-y-16">
           <motion.div 
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-slate-900 p-20 rounded-[80px] shadow-5xl text-white relative overflow-hidden group border-r-[35px] border-blue-600 border-l-[2px] border-white/5"
           >
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] group-hover:scale-150 transition-all duration-[2000ms] pointer-events-none"></div>
              <div className="relative space-y-20">
                 <div className="flex justify-between items-start">
                    <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-white/90 font-serif">Lifecycle Audits</h2>
                    <RotateCcw size={60} className="text-blue-500 animate-spin-slow opacity-60" />
                 </div>
                 
                 <div className="space-y-24">
                    <div className="text-center relative">
                       <p className="text-slate-500 font-black uppercase tracking-[0.8em] text-[12px] mb-10 italic leading-none">Total Observed Handshakes</p>
                       <p className="text-[200px] font-black tracking-tighter text-white drop-shadow-[0_40px_40px_rgba(37,99,235,0.6)] leading-none select-none italic font-serif">
                          {isAdmin ? allAttendance.length : history.length}
                       </p>
                    </div>

                    <div className="bg-white/5 p-16 rounded-[50px] border border-white/10 flex justify-between items-center group-hover:bg-white/10 transition-all cursor-crosshair group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                        <div className="space-y-6">
                            <p className="text-[12px] font-black text-blue-500 uppercase tracking-[0.5em] italic">System Registry</p>
                            <p className="text-4xl font-black tracking-tighter leading-none uppercase italic text-white/80 font-serif">Synchronized</p>
                        </div>
                        <div className="w-20 h-20 rounded-[35px] bg-blue-600 flex items-center justify-center shadow-4xl shadow-blue-500/50 group-hover:rotate-[20deg] transition-all"><ShieldCheck size={40} /></div>
                    </div>
                 </div>
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-white p-20 rounded-[70px] border-2 border-slate-50 shadow-3xl flex flex-col items-center relative overflow-hidden text-center gap-14 group hover:shadow-emerald-100 transition-all duration-700"
           >
               <div className="w-40 h-40 bg-slate-50 rounded-[55px] flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all scale-100 group-hover:scale-105 duration-500"><Activity size={90} className="animate-pulse opacity-80" /></div>
               <div className="space-y-8">
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none font-serif">Neural Integrity</h2>
                 <p className="text-[12px] font-black text-slate-300 leading-relaxed uppercase tracking-[0.5em] max-w-[320px] italic">Active cloud sync established for node <span className="text-indigo-600 select-none underline decoration-4 underline-offset-8">{user.emp_id}</span> via Global Turso Logic Grid</p>
               </div>
               <div className="flex flex-wrap justify-center gap-6 group-hover:rotate-[-2deg] transition-all">
                  <div className="px-8 py-4 bg-slate-900 rounded-3xl text-[11px] font-black uppercase tracking-widest text-white shadow-2xl border border-slate-800 italic">Audit-Level-0</div>
                  <div className="px-8 py-4 bg-blue-600 rounded-3xl text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-100 italic font-serif">AES-X-256</div>
               </div>
           </motion.div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Attendance;
