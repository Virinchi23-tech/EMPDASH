import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Users, Briefcase, Calendar, BarChart3, ArrowUpRight, TrendingUp, Clock, CheckCircle2, RefreshCw, DollarSign, AlertCircle, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import socket from '../services/socket';

const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => (
  <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group animate-fade-in relative overflow-hidden">
    <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50/50 rounded-bl-[4rem] -mr-6 -mt-6 group-hover:bg-primary-100/50 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
      <div className={`p-3 md:p-4 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner`}>
        <Icon size={24} />
      </div>
      {trend && !loading && (
        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center gap-1`}>
          {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter mt-1 break-words">{loading ? '...' : value}</p>
  </div>
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
  const [isDegraded, setIsDegraded] = useState(false);
  
  const isAdmin = ['Admin', 'Manager', 'HR'].includes(user?.role);

  const fetchStats = useCallback(async () => {
    if (!user?.emp_id) return;
    try {
      setLoading(true);
      console.log(`📡 Synchronization Handshake: ${isAdmin ? 'Admin Global Registry' : 'Individual Load Registry'}`);
      
      const endpoint = isAdmin 
        ? '/api/dashboard/admin' 
        : `/api/dashboard/employee/${user.emp_id}`;
        
      const response = await api.get(endpoint);
      setStats(prev => ({
          ...prev,
          ...response.data
      }));
      setIsDegraded(response.data.syncStatus !== 'Optimal');
      setLoading(false);
    } catch (err) {
      console.error('⚠️ Dashboard Sync Link Failed:', err.message);
      setStats({ totalEmployees: 0, totalProjects: 0, totalSalary: 0, syncStatus: 'Offline' });
      setIsDegraded(true);
      setLoading(false);
    }
  }, [isAdmin, user?.emp_id]);

  useEffect(() => {
    fetchStats();

    // 📡 Real-Time Dashboard Synchronization Protocol
    console.log('🔌 Handshaking with Gateway for Dash Pulse...');
    
    const handleSync = () => {
        console.log('🔔 [SOCKET] Dashboard Sync Signal Received. Recalibrating Global Metrics...');
        fetchStats();
    };

    socket.on('dashboardUpdate', handleSync);
    socket.on('leaveCreated', handleSync);
    socket.on('leaveUpdated', handleSync);
    socket.on('leaveDeleted', handleSync);

    // 🔄 30-Second Polling Fallback (Strategic Registry Refresh)
    const pollInterval = setInterval(() => {
        console.log('🔄 [Polling] Regular Registry Pulse Check...');
        fetchStats();
    }, 30000);

    return () => {
        socket.off('dashboardUpdate', handleSync);
        socket.off('leaveCreated', handleSync);
        socket.off('leaveUpdated', handleSync);
        socket.off('leaveDeleted', handleSync);
        clearInterval(pollInterval);
    };
  }, [fetchStats]);

  if (!user) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-gray-300 text-3xl">Synchronizing Identity...</div>;

  return (
    <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 md:p-12 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary-600 via-primary-300 to-primary-600 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Internal Portfolio</h1>
          <div className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] flex flex-wrap items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isDegraded ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`}></div>
             Identity: <span className="text-primary-600">{user.name}</span> <span className="hidden md:inline">•</span> Role: <span className={isDegraded ? 'text-amber-600' : 'text-green-600'}>{user.role}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
          <button onClick={fetchStats} className="bg-gray-50 text-gray-400 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-inner"><RefreshCw size={24} md:size={28} className={loading ? 'animate-spin' : ''} /></button>
          <div className="flex-1 md:flex-none justify-center bg-primary-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] shadow-2xl shadow-primary-200 flex items-center gap-3 cursor-default"><Zap size={16} md:size={18} fill="currentColor" /> Live Cloud Logic</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isAdmin ? (
          <>
            <StatCard title="Personnel Registry" value={stats.totalEmployees} icon={Users} color="blue" trend={12} loading={loading} />
            <StatCard title="Infrastructure Load" value={stats.totalProjects} icon={Briefcase} color="indigo" trend={5} loading={loading} />
            <StatCard title="Strategic Burn" value={`$${(stats.totalSalary / 1000).toFixed(1)}K`} icon={DollarSign} color="rose" trend={3} loading={loading} />
            <StatCard title="Registry Status" value={stats.syncStatus} icon={BarChart3} color="amber" loading={loading} />
          </>
        ) : (
          <>
            <StatCard title="Assigned Load" value={stats.totalProjects} icon={Briefcase} color="indigo" loading={loading} />
            <StatCard title="Active Profile" value={user.role} icon={Users} color="blue" loading={loading} />
            <StatCard title="Registry Status" value={stats.syncStatus} icon={BarChart3} color="green" loading={loading} />
             <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-white flex flex-col justify-center shadow-xl shadow-primary-100">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Digital Identifier</p>
                <p className="text-2xl font-black mt-1 font-mono tracking-tighter">{user.emp_id}</p>
             </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50/50 p-12 rounded-[4rem] border border-gray-100 shadow-sm relative group overflow-hidden h-[500px] flex flex-col justify-center items-center text-center">
           <TrendingUp size={80} className="text-primary-100 absolute -bottom-10 -right-10 rotate-12" />
           <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mb-8 text-primary-600 shadow-xl shadow-primary-50 border border-primary-100">
              <RefreshCw size={40} className="animate-spin-slow" />
           </div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase italic">Organizational Pulse</h2>
           <p className="text-gray-400 font-bold max-w-sm uppercase tracking-widest text-[10px] leading-loose">Synchronizing multi-tier cloud handshakes. Full analytics authorized across Hub AP-SOUTH-1.</p>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden group">
           <h2 className="text-2xl font-black text-gray-900 self-start mb-12 tracking-tight uppercase">Operational Target</h2>
           <div className="h-[300px] w-full flex items-center justify-center relative">
              <div className="w-56 h-56 rounded-full border-[1.5rem] border-primary-50 flex flex-col items-center justify-center shadow-inner relative group-hover:border-primary-100 transition-all">
                 <p className="text-6xl font-black text-gray-900 tracking-tighter">{stats.totalProjects}</p>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Project Load</p>
                 <div className="absolute inset-0 border-[0.5rem] border-primary-600 rounded-full border-t-transparent animate-spin-slow opacity-20"></div>
              </div>
           </div>
           
           <div className="w-full bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 mt-12 text-center shadow-inner">
                 <p className="text-xs font-black text-gray-800 uppercase tracking-widest leading-loose">Personnel Profile Synchronized for ID: {user.emp_id}</p>
           </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
