import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { 
  LogIn, LogOut, Clock, Calendar, History, Activity, Timer, ChevronRight, RefreshCw, User, Search, Filter, ShieldCheck, XCircle, AlertCircle
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

  const fetchData = useCallback(async () => {
    try {
      console.log('📡 [Attendance] Initializing Data Acquisition Lifecycle...');
      setLoading(true);
      
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
        if (adminFilters.date) queryParams.append('date', adminFilters.date);
        if (adminFilters.employee) queryParams.append('emp_id', adminFilters.employee);
        
        console.log('🛠️ [Attendance] Admin Telemetry Query:', queryParams.toString());
        const allRes = await api.get(`/attendance/all?${queryParams.toString()}`);
        console.log('📦 [Attendance] Global Personnel Data:', allRes.data);
        
        if (allRes.data.success) {
          setAllAttendance(allRes.data.data);
        }
      }
    } catch (err) {
      console.error('🔥 [Attendance] Synchronization Handshake Failed:', err.message);
      if (err.response) console.error('🔴 API Response Error:', err.response.data);
      toast.error('Identity sync error. Check console for neural details.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminFilters]);

  useEffect(() => {
    fetchData();
    let interval;
    if (isAdmin) {
      interval = setInterval(fetchData, 60000); 
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
      
      // Auto-refresh registry
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operational handshake failed';
      console.error('❌ [Attendance] Action Rejected:', msg);
      toast.error(msg);
    } finally {
      setBtnLoading(false);
    }
  };

  if (!user) return <div className="p-20 text-center font-black animate-pulse text-gray-300 text-3xl">Synchronizing User Node...</div>;

  const isCheckedIn = currentStatus === 'Checked In';
  const isCheckedOut = currentStatus === 'Checked Out';

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900 px-4 md:px-0">
      {/* Header Actions */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-12 bg-white rounded-[50px] border border-slate-100 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-[0_4px_15px_rgba(37,99,235,0.3)]"></div>
        <div className="relative z-10 space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Work Pulse</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
             Secure Endpoint Monitoring &bull; Identity Verfied: <span className="text-blue-600 font-black">{user.name}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-10 lg:mt-0 relative z-10 w-full lg:w-auto">
           <div className={`px-12 py-6 rounded-[30px] flex flex-col items-center justify-center min-w-[240px] border shadow-inner transition-all w-full sm:w-auto
             ${isCheckedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
               isCheckedOut ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] mb-2 opacity-50 italic">Live Logic Status</span>
              <span className="text-3xl font-black uppercase tracking-tighter italic">{currentStatus}</span>
           </div>
           
           <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-center">
                <button 
                  disabled={isCheckedIn || isCheckedOut || btnLoading}
                  onClick={() => handleAction('check-in')}
                  className={`w-full sm:w-auto p-6 px-10 rounded-[30px] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4
                    ${(isCheckedIn || isCheckedOut) ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                >
                  <LogIn size={28} />
                  <span className="text-lg font-black uppercase tracking-widest leading-none">Arrival</span>
                </button>

                <button 
                  disabled={!isCheckedIn || btnLoading}
                  onClick={() => handleAction('check-out')}
                  className={`w-full sm:w-auto p-6 px-10 rounded-[30px] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4
                    ${(!isCheckedIn) ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'}`}
                >
                  <LogOut size={28} />
                  <span className="text-lg font-black uppercase tracking-widest leading-none">Departure</span>
                </button>
           </div>
        </div>
      </motion.div>

      {/* Registry Audit Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white rounded-[50px] border border-slate-50 shadow-xl overflow-hidden min-h-[600px] flex flex-col"
           >
              <div className="p-12 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-blue-50/5 gap-8">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-[35px] flex items-center justify-center shadow-3xl shadow-blue-200"><History size={40} /></div>
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Registry Audit Log</h2>
                       <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase mt-3">{isAdmin ? 'Enterprise Multi-Node History' : 'Personal Cycle Telemetry'}</p>
                    </div>
                 </div>
                 <button onClick={fetchData} className="p-5 bg-white text-slate-400 rounded-3xl border border-slate-100 hover:text-blue-600 transition-all shadow-inner"><RefreshCw size={28} className={loading ? 'animate-spin' : ''} /></button>
              </div>

              <div className="p-10 flex-1">
                 {/* Table Filters */}
                 {isAdmin ? (
                   <div className="space-y-10">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100/50">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date Filter</label>
                           <input type="date" value={adminFilters.date} onChange={e => setAdminFilters(prev => ({...prev, date: e.target.value}))} className="w-full p-5 bg-white border-2 border-slate-50 rounded-3xl font-black focus:border-blue-600 outline-none shadow-sm text-sm" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Identify Personnel</label>
                           <div className="relative">
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                              <input placeholder="Search emp_id or global name..." value={adminFilters.employee} onChange={e => setAdminFilters(prev => ({...prev, employee: e.target.value}))} className="w-full pl-14 p-5 bg-white border-2 border-slate-100 rounded-3xl font-black focus:border-blue-600 outline-none shadow-sm text-sm" />
                           </div>
                        </div>
                     </div>

                     <div className="overflow-x-auto pb-6">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50">
                                <th className="pb-8 px-6 whitespace-nowrap italic">Employee</th>
                                <th className="pb-8 px-6 whitespace-nowrap italic">Date</th>
                                <th className="pb-8 px-6 whitespace-nowrap italic text-blue-600">IN</th>
                                <th className="pb-8 px-6 whitespace-nowrap italic text-red-500">OUT</th>
                                <th className="pb-8 px-6 text-right italic text-indigo-500">Duration</th>
                                <th className="pb-8 px-6 text-right italic">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {allAttendance.length > 0 ? allAttendance.map((record) => (
                               <tr key={record.id} className="group hover:bg-blue-50/20 transition-all border-l-4 border-transparent hover:border-blue-600">
                                  <td className="py-8 px-6">
                                     <div className="flex items-center gap-6">
                                        <div className="relative">
                                           <div className="w-14 h-14 rounded-[20px] bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all text-lg shadow-sm font-serif">
                                              {record.employee_name ? record.employee_name[0] : '?'}
                                           </div>
                                           {record.status === 'Checked In' && (
                                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse shadow-md" />
                                           )}
                                        </div>
                                        <div>
                                           <p className="font-black text-slate-900 text-md whitespace-nowrap leading-none mb-2 italic uppercase">{record.employee_name || 'Personnel'}</p>
                                           <p className="text-[11px] font-black text-blue-500 uppercase tracking-tight font-mono">{record.employee_id}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="py-8 px-6 font-black text-slate-500 text-sm whitespace-nowrap font-mono">{record.date}</td>
                                  <td className="py-8 px-6 font-black text-slate-900 text-md">{record.check_in_time || '--:--'}</td>
                                  <td className="py-8 px-6 font-black text-slate-900 text-md">{record.check_out_time || '--:--'}</td>
                                  <td className="py-8 px-6 text-right">
                                     <span className="px-4 py-1.5 bg-slate-900 rounded-xl text-xs font-black text-white italic">{record.total_hours ? parseFloat(record.total_hours).toFixed(1) : '0.0'}h</span>
                                  </td>
                                  <td className="py-8 px-6 text-right">
                                     <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                       record.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-md ring-2 ring-emerald-500/10' :
                                       record.status === 'Checked Out' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                       'bg-slate-50 text-slate-400 border-slate-100'
                                     }`}>
                                        {record.status}
                                     </span>
                                  </td>
                               </tr>
                             )) : (
                               <tr><td colSpan="6" className="py-40 text-center text-slate-200 font-black uppercase tracking-[1.5em] italic text-xl opacity-30 select-none">No Pulse Data In Registry</td></tr>
                             )}
                          </tbody>
                       </table>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-8">
                      {history.length > 0 ? history.map((record, i) => (
                        <div key={i} className="bg-white p-10 rounded-[45px] border border-slate-50 hover:shadow-3xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border-l-[12px] border-transparent hover:border-indigo-600">
                           <div className="flex items-center gap-10">
                              <div className="w-20 h-20 bg-slate-50 rounded-[30px] border-4 border-white shadow-xl flex flex-col items-center justify-center group-hover:bg-indigo-600 transition-all">
                                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-indigo-100 transition-colors">Audit</span>
                                 <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-white transition-colors">{record.date.split('-')[2]}</span>
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">{new Date(record.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                 <div className="flex items-center gap-5 mt-4">
                                    <Clock size={16} className="text-slate-200" />
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Security Reference Hash: {record.id}</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-wrap gap-14 items-center justify-center">
                              <div className="text-center group/time">
                                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 group-hover/time:text-blue-500 transition-colors">Check-In</p>
                                 <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{record.check_in_time || '--:--'}</p>
                              </div>
                              <div className="text-center group/time">
                                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 group-hover/time:text-red-500 transition-colors">Check-Out</p>
                                 <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{record.check_out_time || '--:--'}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 italic">Shift Usage</p>
                                 <p className="text-2xl font-black text-indigo-600 tracking-tighter underline underline-offset-8 decoration-indigo-100 decoration-4">{record.total_hours ? parseFloat(record.total_hours).toFixed(2) : '0.00'}h</p>
                              </div>
                              <div className="bg-slate-50 px-8 py-5 rounded-3xl border border-slate-100 shadow-inner group-hover:bg-white transition-all min-w-[170px] text-center border-t-4 border-t-transparent group-hover:border-t-indigo-200">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Lifecycle</p>
                                 <p className="text-sm font-black text-slate-900 tracking-widest uppercase italic">{record.status}</p>
                              </div>
                           </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none py-32 grayscale space-y-8">
                           <Activity size={140} className="text-slate-200 animate-pulse" />
                           <div className="space-y-4">
                             <h3 className="text-4xl font-black text-slate-300 uppercase tracking-[0.8em] italic">No Logs Found</h3>
                             <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] underline decoration-indigo-500 underline-offset-[12px] decoration-4 opacity-60">Deployment Registry Active for {user.emp_id}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </motion.div>
        </div>

        {/* Status Panels */}
        <div className="space-y-12">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-slate-900 p-16 rounded-[60px] shadow-4xl text-white relative overflow-hidden group border-r-[25px] border-blue-600"
           >
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:scale-150 transition-all duration-1000"></div>
              <div className="relative space-y-16">
                 <div className="flex justify-between items-start">
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none text-white/90">Lifecycle Cycles</h2>
                    <Timer size={50} className="text-blue-500 animate-spin-slow" />
                 </div>
                 
                 <div className="space-y-20">
                    <div className="text-center relative">
                       <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-[11px] mb-8 italic">Validated Registry Handshakes</p>
                       <p className="text-[150px] font-black tracking-tighter text-white drop-shadow-[0_25px_25px_rgba(37,99,235,0.4)] leading-none select-none italic font-serif">
                          {isAdmin ? allAttendance.length : history.length}
                       </p>
                    </div>

                    <div className="bg-white/5 p-12 rounded-[40px] border border-white/10 flex justify-between items-center group-hover:bg-white/10 transition-all cursor-crosshair">
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">Continuity</p>
                            <p className="text-3xl font-black tracking-tighter leading-none uppercase italic text-white/80">Synchronized</p>
                        </div>
                        <div className="w-16 h-16 rounded-[25px] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:rotate-12 transition-transform"><ShieldCheck size={32} /></div>
                    </div>
                 </div>
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-white p-16 rounded-[55px] border border-slate-50 shadow-2xl flex flex-col items-center relative overflow-hidden text-center gap-12 group"
           >
               <div className="w-32 h-32 bg-slate-50 rounded-[45px] flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all scale-95 group-hover:scale-100"><Activity size={70} className="animate-pulse" /></div>
               <div className="space-y-6">
                 <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Identity Link</h2>
                 <p className="text-[11px] font-black text-slate-300 leading-relaxed uppercase tracking-[0.4em] max-w-[260px]">Active cloud tunnel established for node {user.emp_id} &bull; Registry Integrity 100%</p>
               </div>
               <div className="flex flex-wrap justify-center gap-5">
                  <div className="px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-slate-700">Audit-Valid</div>
                  <div className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 italic">Neural-X</div>
               </div>
           </motion.div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Attendance;
