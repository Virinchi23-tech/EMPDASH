import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Plus, Wallet, History, Download, Trash2, ChevronRight, TrendingUp, CreditCard, Layers, Archive, ArrowUpRight, RefreshCw, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Salary = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    base_salary: '',
    bonus: '0',
    deductions: '0',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  });

  const isAdminOrHR = ['Admin', 'HR'].includes(user?.role);

  const fetchData = useCallback(async () => {
    if (!user?.emp_id) return;
    try {
      setLoading(true);
      console.log(`📡 Synchronization Handshake: ${user.emp_id} Financial Registry`);
      
      const res = await api.get(`/salary/${user.emp_id}`);
      setSalaries(res.data.success ? res.data.data : []);
      
      if (isAdminOrHR) {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Salary Sync Failure:', err.message);
      setSalaries([]);
      setLoading(false);
    }
  }, [user?.emp_id, isAdminOrHR]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/salary', formData);
      toast.success('Financial Record Persisted');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failure: unauthorized tiers.');
    }
  };

  /**
   * handleDownload - Secure PDF acquisition via Authorization Handshake
   */
  const handleDownload = async (salary) => {
    const payslipUrl = `/salary/${salary.emp_id}/payslip/${salary.month}-${salary.year}`;
    toast.success(`Acquiring Production Payslip: ${salary.month} ${salary.year}`);
    
    try {
       // Fetch PDF as blob with Authorization headers
       const response = await api.get(payslipUrl, { responseType: 'blob' });
       
       // Create secure blob stream
       const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = blobUrl;
       link.setAttribute('download', `Payslip_${salary.emp_id}_${salary.month}_${salary.year}.pdf`);
       document.body.appendChild(link);
       link.click();
       link.remove();
       window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
       toast.error('PDF Acquisition Link Failed: Authorization Rejected.');
    }
  };

  if (!user) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-gray-300 text-3xl">Synchronizing Financial Tier...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-emerald-600 to-primary-600 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Financial Registry</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
             <CreditCard size={16} className="text-emerald-500" />
             Strategic Compensation Architecture • Role: {user.role}
          </p>
        </div>
        
        <div className="flex gap-4 mt-8 md:mt-0 relative z-10">
          <button onClick={fetchData} className="bg-gray-50 text-gray-400 p-5 rounded-3xl border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-inner"><RefreshCw size={28} className={loading ? 'animate-spin' : ''} /></button>
          {isAdminOrHR && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-200 flex items-center gap-3 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Wallet size={20} fill="currentColor" className="text-emerald-400" /> Disburse Payroll
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
           <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-emerald-50/20 px-16 relative">
                 <div className="flex items-center gap-6 z-10">
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200"><Archive size={32} /></div>
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Earnings Transcript</h2>
                       <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2">Historical Remuneration Logs</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-12 flex-1 flex flex-col">
                 {loading ? (
                    <div className="space-y-8 animate-pulse">
                       {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-50 rounded-[2.5rem]"></div>)}
                    </div>
                 ) : salaries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none py-20">
                       <FileText size={120} className="mb-10 text-gray-200" />
                       <h3 className="text-3xl font-black text-gray-300 uppercase tracking-widest italic">No Financial Logs</h3>
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] mt-2">Audit Synchronization active for ID: {user.emp_id}</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {salaries.map((salary, i) => {
                          const net = (Number(salary.base_salary) + Number(salary.bonus) - Number(salary.deductions)).toLocaleString();
                          return (
                            <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                               <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                               <div className="flex items-center gap-8">
                                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl border-4 border-white shadow-xl flex flex-col items-center justify-center">
                                     <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{salary.month.substring(0, 3)}</span>
                                     <span className="text-lg font-black text-emerald-900 tracking-tighter">{salary.year}</span>
                                  </div>
                                  <div>
                                     <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{salary.month} Cycle</h3>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status: <span className="text-emerald-600">{salary.status}</span></p>
                                  </div>
                               </div>
                               
                               <div className="flex items-center gap-10">
                                  <div className="text-right">
                                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Portfolio Split</p>
                                     <p className="text-3xl font-black text-gray-900 tracking-tighter">${net}</p>
                                  </div>
                                  <button onClick={() => handleDownload(salary)} className="p-5 bg-white text-emerald-600 rounded-3xl border border-gray-100 hover:bg-emerald-600 hover:text-white transition-all shadow-xl hover:-rotate-12 active:scale-95 group/dl">
                                     <Download size={28} className="group-hover/dl:scale-110 transition-transform" />
                                  </button>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-12">
           <div className="bg-[#0f172a] p-12 rounded-[4.5rem] shadow-4xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
              <div className="relative space-y-12">
                 <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Total Allocation</h2>
                    <TrendingUp size={40} className="text-emerald-400" />
                 </div>
                 
                 <div className="space-y-12">
                    <div className="text-center">
                       <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Cumulative Distributed Portfolios</p>
                       <p className="text-7xl font-black tracking-tighter text-white">
                          ${salaries.reduce((sum, s) => sum + (Number(s.base_salary) + Number(s.bonus) - Number(s.deductions)), 0).toLocaleString()}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Base P/A</p>
                          <p className="text-2xl font-black tracking-tighter">${(Number(user.salary || 0) / 12).toFixed(0).toLocaleString()}/mo</p>
                       </div>
                       <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Cycle Count</p>
                          <p className="text-2xl font-black tracking-tighter">{salaries.length}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-emerald-600 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group text-center flex flex-col items-center gap-6">
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><Layers size={32} /></div>
               <h2 className="text-2xl font-black uppercase tracking-tighter">Financial Stewardship</h2>
               <p className="text-[10px] font-bold opacity-70 leading-relaxed uppercase tracking-widest px-8">Digital ID: {user.emp_id} • Organizational Compensation History Authenticated across Turso Cloud Infrastructure Hub.</p>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white rounded-[5rem] shadow-4xl w-full max-w-2xl animate-slide-up border-8 border-white overflow-hidden">
            <div className="p-16 border-b border-gray-50 bg-[#0f172a] text-white flex justify-between items-center">
               <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Execute Payroll</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-3">Strategic Disbursement Synchronization</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="bg-white/10 text-white p-5 rounded-[1.5rem] transition-all hover:bg-white hover:text-red-500 hover:rotate-90">
                 <RefreshCw size={28} className="rotate-45" />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-16 space-y-10 overflow-y-auto max-h-[70vh]">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Personnel Asset Selection</label>
                  <select required className="salary-input" value={formData.emp_id} onChange={(e) => setFormData({...formData, emp_id: e.target.value})}>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => ( <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option> ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Base Component ($)</label>
                    <input type="number" required className="salary-input" value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Performance Bonus ($)</label>
                    <input type="number" required className="salary-input" value={formData.bonus} onChange={(e) => setFormData({...formData, bonus: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Fiscal Month</label>
                    <select className="salary-input" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})}>
                      {[ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Fiscal Year</label>
                    <input type="text" required className="salary-input text-center" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Compliance Deductions ($)</label>
                  <input type="number" required className="salary-input" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} />
                </div>
              </div>
              
              <div className="flex gap-6 pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-8 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">Discard</button>
                <button type="submit" className="flex-[2] py-8 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Wallet size={18} fill="currentColor" /> Finalize Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .salary-input { @apply w-full px-10 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] focus:bg-white focus:outline-none focus:ring-8 focus:ring-emerald-50 focus:border-emerald-600 transition-all font-black text-lg text-gray-800 placeholder:text-gray-300 shadow-inner; }
      `}</style>
    </div>
  );
};

export default Salary;
