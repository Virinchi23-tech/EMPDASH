import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Award, Target, TrendingUp, Zap, Star, ChevronRight, Plus, ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Performance = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [performance, setPerformance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    score: '',
    review_date: new Date().toISOString().split('T')[0],
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdminOrManager = ['ADMIN', 'MANAGER', 'HR'].includes(user?.role?.toUpperCase());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!user.emp_id) return;
      
      console.log(`📡 Synchronization Handshake: ${user.emp_id} Performance History`);
      
      const perfRes = await api.get(`/api/performance/${user.emp_id}`);
      if (perfRes.data.success) {
        // Strategic De-duplication Protocol
        const unique = Array.from(new Set(perfRes.data.data.map(q => JSON.stringify(q)))).map(q => JSON.parse(q));
        setPerformance(unique);
      }
      
      if (isAdminOrManager) {
        const empRes = await api.get('/api/employees');
        setEmployees(empRes.data.employees || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Performance Sync Failure:', err.message);
      setPerformance([]);
      setLoading(false);
    }
  }, [user.emp_id, isAdminOrManager]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      await api.post('/api/performance', formData);
      toast.success('Performance Review Persisted');
      setIsModalOpen(false);
      setFormData({ ...formData, score: '', comments: '' });
      fetchData();
    } catch (err) {
      toast.error('Sync failure: unauthorized tiers.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 md:p-12 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Efficiency Auditing</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] flex items-center gap-3">
             <Star size={14} md:size={16} className="text-amber-500 fill-amber-500" />
             Strategic Personnel Benchmarking <span className="hidden md:inline">•</span> Role: {user.role}
          </p>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
          <button onClick={fetchData} className="bg-gray-50 text-gray-400 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-inner"><RefreshCw size={24} md:size={28} className={loading ? 'animate-spin' : ''} /></button>
          {isAdminOrManager && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none justify-center bg-primary-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] shadow-2xl shadow-primary-200 flex items-center gap-3 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Zap size={16} md:size={20} fill="currentColor" className="text-amber-400" /> Record Review
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
           <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] md:min-h-[600px] flex flex-col">
              <div className="p-8 md:p-12 border-b border-gray-50 flex items-center justify-between bg-primary-50/20 px-10 md:px-16 relative">
                 <div className="flex items-center gap-4 md:gap-6 z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-600 text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-200"><Award size={24} md:size={32} /></div>
                    <div>
                       <h2 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Productivity Index</h2>
                       <p className="text-[8px] md:text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2">Validated Metrics History</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-16 flex-1 flex flex-col">
                 {loading ? (
                    <div className="space-y-8 animate-pulse">
                       {[1,2].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[2.5rem]"></div>)}
                    </div>
                 ) : performance.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none">
                       <Target size={120} className="mb-10 text-gray-200" />
                       <h3 className="text-3xl font-black text-gray-300 uppercase tracking-widest italic">No Benchmark Data</h3>
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] mt-2">Strategic monitoring active. Records will populate periodically.</p>
                    </div>
                 ) : (
                    <div className="space-y-8">
                       {performance.map((res, i) => (
                          <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                             <div className="absolute top-0 left-0 w-2 h-full bg-primary-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                             
                             <div className="w-40 h-40 rounded-full border-[1.25rem] border-primary-50 flex flex-col items-center justify-center shadow-inner bg-gray-50 group-hover:border-primary-100 transition-all">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{res.score}%</span>
                                <span className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mt-1">Score</span>
                             </div>
                             
                             <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                   <div>
                                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">{res.review_date}</p>
                                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Personnel Audit Impact</h3>
                                   </div>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-gray-500 leading-relaxed bg-gray-50/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-50 uppercase tracking-tight break-words overflow-hidden">"{res.comments || 'No feedback logged for this synchronization window.'}"</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-12">
           <div className="bg-[#0f172a] p-12 rounded-[4rem] shadow-4xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
              <div className="relative space-y-12">
                 <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Personal Momentum</h2>
                    <ShieldCheck size={36} className="text-primary-400" />
                 </div>
                 
                 <div className="space-y-10">
                    <div className="text-center">
                       <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Rolling Avg %</p>
                       <p className="text-7xl font-black tracking-tighter text-white">
                          {performance.length ? (performance.reduce((a,b)=>a+b.score,0)/performance.length).toFixed(0) : 0}
                       </p>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-start gap-5 group/note">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 group-hover/note:bg-primary-600 transition-all"><TrendingUp size={20} /></div>
                          <p className="text-[10px] font-black text-gray-400 leading-loose uppercase tracking-[0.2em]">Deployment consistency is optimal for the current fiscal window.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className="w-full bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 text-center">
                  <p className="text-xs font-black text-gray-800 uppercase tracking-widest leading-loose">Individual Personnel Profile Synchronized with Turso Cluster AP-SOUTH-1 Hub.</p>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white rounded-[5rem] shadow-4xl w-full max-w-xl animate-slide-up border-8 border-white overflow-hidden">
            <div className="p-16 border-b border-gray-50 bg-[#0f172a] text-white flex justify-between items-center group">
               <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic group-hover:scale-105 transition-transform origin-left">Audit Engine</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-3">Strategic Review Synchronization</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="bg-white/10 text-white p-5 rounded-[1.5rem] transition-all hover:bg-white hover:text-red-500 hover:rotate-90">
                 <RefreshCw size={28} className="rotate-45" />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-16 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Personnel Selection</label>
                  <select required className="audit-input" value={formData.emp_id} onChange={(e) => setFormData({...formData, emp_id: e.target.value})}>
                    <option value="">Select Resource...</option>
                    {employees.map(emp => ( <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option> ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Efficiency Score (%)</label>
                    <input type="number" required max="100" min="0" className="audit-input" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Audit Date</label>
                    <input type="date" required className="audit-input" value={formData.review_date} onChange={(e) => setFormData({...formData, review_date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Strategic Feedback</label>
                  <textarea className="audit-input h-32 resize-none pt-6" placeholder="Document professional drift and contributions..." value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})}></textarea>
                </div>
              </div>
              
              <div className="flex gap-6 pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-8 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Discard</button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`flex-[2] py-8 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] shadow-2xl shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Zap size={18} fill="currentColor" className="text-amber-400" />
                  )}
                  {submitting ? 'Synchronizing...' : 'Commit Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .audit-input { @apply w-full px-10 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary-50 focus:border-primary-600 transition-all font-black text-lg text-gray-800 placeholder:text-gray-300 shadow-inner; }
      `}</style>
    </div>
  );
};

export default Performance;
