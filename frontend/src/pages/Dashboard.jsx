import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Users, Briefcase, Calendar, BarChart3, ArrowUpRight, TrendingUp, Clock, CheckCircle2, RefreshCw, DollarSign, AlertCircle, Zap, Activity, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';

const StatCard = ({ title, value, icon: Icon, loading, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm transition-all group overflow-hidden relative"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100`}>
        <Icon size={24} />
      </div>
      {loading ? (
        <Skeleton className="w-12 h-6 rounded-full" />
      ) : trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'} flex items-center gap-1`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em]">{title}</h3>
      {loading ? (
        <Skeleton className="w-24 h-8 mt-1" />
      ) : (
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      )}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    totalSalary: 0,
    syncStatus: 'Optimal'
  });
  const [loading, setLoading] = useState(true);
  
  const isAdmin = ['Admin', 'Manager', 'HR'].includes(user?.role);

  const fetchStats = useCallback(async () => {
    if (!user?.emp_id) return;
    try {
      setLoading(true);
      const endpoint = isAdmin 
        ? '/api/dashboard/admin' 
        : `/api/dashboard/employee/${user.emp_id}`;
        
      const response = await api.get(endpoint);
      setStats(prev => ({
          ...prev,
          ...response.data
      }));
      setLoading(false);
    } catch (err) {
      console.error('Dashboard Sync Error:', err.message);
      setStats(prev => ({ ...prev, syncStatus: 'Offline' }));
      setLoading(false);
    }
  }, [isAdmin, user?.emp_id]);

  useEffect(() => {
    fetchStats();

    const handleSync = () => fetchStats();

    socket.on('dashboardUpdate', handleSync);
    socket.on('leaveCreated', handleSync);
    socket.on('leaveUpdated', handleSync);
    socket.on('leaveDeleted', handleSync);

    const pollInterval = setInterval(fetchStats, 60000);

    return () => {
      socket.off('dashboardUpdate', handleSync);
      socket.off('leaveCreated', handleSync);
      socket.off('leaveUpdated', handleSync);
      socket.off('leaveDeleted', handleSync);
      clearInterval(pollInterval);
    };
  }, [fetchStats]);

  if (!user) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <RefreshCw className="animate-spin text-slate-300" size={32} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-left">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats} 
            className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="h-10 w-[2px] bg-slate-200 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${stats.syncStatus === 'Optimal' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">System: {stats.syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} trend={12} loading={loading} />
            <StatCard title="Active Projects" value={stats.totalProjects} icon={Briefcase} trend={5} loading={loading} />
            <StatCard title="Payroll Monthly" value={`$${(stats.totalSalary / 1000).toFixed(1)}K`} icon={DollarSign} trend={3} loading={loading} />
            <StatCard title="Performance" value="4.8/5" icon={BarChart3} trend={2} loading={loading} />
          </>
        ) : (
          <>
            <StatCard title="Assigned Projects" value={stats.totalProjects} icon={Briefcase} loading={loading} />
            <StatCard title="Total Leaves" value="12" icon={Calendar} loading={loading} />
            <StatCard title="Working Hours" value="168h" icon={Clock} loading={loading} />
            <StatCard title="Profile Rank" value="Senior" icon={Target} loading={loading} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Dashboard Widget */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden h-[400px] flex flex-col group">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                       <Activity size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Performance</h2>
                 </div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Real-time update</span>
              </div>
                            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  {loading ? (
                    <div className="space-y-6 flex flex-col items-center">
                       <Skeleton className="w-32 h-32 rounded-full" />
                       <Skeleton className="w-48 h-6" />
                       <Skeleton className="w-64 h-10" />
                    </div>
                  ) : (
                    <>
                    <div className="relative">
                       <div className="w-32 h-32 rounded-full border-8 border-slate-50 flex items-center justify-center">
                          <p className="text-4xl font-bold text-slate-900">98%</p>
                       </div>
                       <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin-slow"></div>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-lg font-bold text-slate-900">Operations Stable</h3>
                       <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">All cloud infrastructure nodes are currently synchronized and performing within optimal parameters.</p>
                    </div>
                    </>
                  )}
               </div>

163:               {/* Decorative elements */}
164:               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-xl opacity-50 transition-opacity" />
165:            </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
              <div className="relative space-y-8">
                 <div className="space-y-1">
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em]">Personal Identifier</p>
                    <p className="text-3xl font-bold tracking-tight font-mono">{user.emp_id}</p>
                 </div>
                 <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400 font-medium tracking-wide">Designation</span>
                       <span className="text-xs font-bold uppercase text-indigo-300">{user.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-slate-400 font-medium tracking-wide">Region</span>
                       <span className="text-xs font-bold uppercase text-slate-300 tracking-widest">Global</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <AlertCircle size={16} className="text-indigo-600" /> System Notices
              </h3>
              <div className="space-y-4">
                 {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                       <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 group-hover:scale-125 transition-transform" />
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800 leading-tight">Quarterly audit sync is live</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sync ID: #QRTR-2024-00{i}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
