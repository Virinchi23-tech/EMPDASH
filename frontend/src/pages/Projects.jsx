import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Plus, Search, Edit2, Trash2, Briefcase, RefreshCw, X, CheckCircle, Clock, 
  Users, Code, DollarSign, Calendar, Zap, AlertTriangle, CloudOff, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'Active',
    tech_stack: '',
    assigned_employees: []
  });
  const [editingId, setEditingId] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['Admin', 'Manager', 'HR'].includes(user.role);

  /**
   * fetchData - Role-Based Infrastructure Synchronization
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setSyncError(null);
      console.log(`📡 Synchronization Handshake: ${isAdmin ? 'Global Portfolio' : 'Assigned Infrastructure'}`);
      
      const endpoint = isAdmin 
        ? '/api/projects' 
        : `/api/projects/employee/${user.emp_id}`;
      
      // Optimization: Parallelized Infrastructure Sync
      const requests = [api.get(endpoint)];
      if (isAdmin) {
          requests.push(api.get('/api/employees'));
      }
      
      const responses = await Promise.all(requests);
      
      setProjects(Array.isArray(responses[0].data) ? responses[0].data : []);
      if (isAdmin && responses[1]) {
          setEmployees(responses[1].data.employees || []);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Infrastructure Sync Failure:', err.message);
      setSyncError(err.message === 'Network Error' ? 'Link Severed' : 'Access Restricted');
      setLoading(false);
      setProjects([]);
    }
  }, [isAdmin, user.emp_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (project = null) => {
    if (project) {
      setFormData({
        project_id: project.project_id,
        title: project.title,
        budget: project.budget,
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status,
        tech_stack: project.tech_stack,
        assigned_employees: project.assigned_employees.map(e => e.emp_id)
      });
      setEditingId(project.project_id);
    } else {
      setFormData({
        project_id: `PRJ${Math.floor(Math.random() * 900) + 100}`,
        title: '',
        budget: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'Active',
        tech_stack: '',
        assigned_employees: []
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleEmployeeToggle = (empId) => {
    setFormData(prev => ({
      ...prev,
      assigned_employees: prev.assigned_employees.includes(empId)
        ? prev.assigned_employees.filter(id => id !== empId)
        : [...prev.assigned_employees, empId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}`, formData);
        toast.success('Strategy Synchronized on Turso');
      } else {
        await api.post('/api/projects', formData);
        toast.success('Infrastructure Profile Persisted');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Handshake failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/api/projects/${id}`);
        toast.success('Infrastructure Erased');
        fetchData();
      } catch (err) {
        toast.error('Sync failure.');
      }
    }
  };

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-gray-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{isAdmin ? 'Infrastructure Portfolio' : 'Assigned Missions'}</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             Active Cluster Sync: {user.role} Authorization
          </p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <button onClick={fetchData} className="p-4 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all shadow-inner border border-gray-100"><RefreshCw size={28} className={loading ? 'animate-spin' : ''} /></button>
          {isAdmin && (
            <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4.5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl shadow-primary-200 transition-all active:scale-95 uppercase tracking-widest text-xs">
              <Plus size={20} /> Define Strategy
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={24} />
          <input type="text" placeholder="Query Project Title or Global Identifier..." className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-gray-200 rounded-[1.5rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-600 transition-all font-bold text-gray-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading && projects.length === 0 ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-6">
                <Skeleton className="w-16 h-16 rounded-3xl" />
                <Skeleton className="w-full h-10 rounded-xl" />
                <Skeleton className="w-2/3 h-6 rounded-lg" />
                <div className="pt-8 space-y-4">
                   <Skeleton className="w-full h-24 rounded-[2rem]" />
                   <div className="flex justify-between uppercase">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-24 h-4" />
                   </div>
                </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center text-gray-200 font-black text-4xl uppercase italic tracking-widest border-4 border-dashed border-gray-100 rounded-[3rem] p-12 flex flex-col items-center">
             <CloudOff className="mb-6 opacity-20" size={100} />
             No Infrastructure Assigned
             <p className="text-gray-300 text-xs font-bold uppercase tracking-[0.25em] mt-4 max-w-sm leading-loose">Individual Personnel Portfolio is currently clear for Digital ID: {user.emp_id}</p>
          </div>
        ) : filtered.map((project) => (
          <div key={project.project_id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col min-h-[500px] hover:-translate-y-2">
             <div className="absolute top-0 right-0 w-48 h-48 blur-2xl -mr-24 -mt-24 bg-primary-100/40 group-hover:bg-primary-500/10 transition-colors"></div>
             
             <div className="flex justify-between items-start mb-8 z-10">
                <div className="p-5 rounded-3xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xl shadow-primary-100/20"><Briefcase size={32} /></div>
                {isAdmin && (
                  <div className="flex gap-3">
                     <button onClick={() => handleOpenModal(project)} className="p-3 bg-white text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-gray-100"><Edit2 size={20} /></button>
                     <button onClick={() => handleDelete(project.project_id)} className="p-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"><Trash2 size={20} /></button>
                  </div>
                )}
             </div>
             
             <span className="text-[10px] font-black uppercase text-primary-400 tracking-[0.3em] mb-3 font-mono">{project.project_id}</span>
             <h3 className="text-3xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">{project.title}</h3>
             
             <div className="flex flex-wrap gap-2.5 mb-8">
                {(project.tech_stack || '').split(',').map((tech, i) => (
                  <span key={i} className="text-[9px] font-black px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl uppercase tracking-widest group-hover:bg-white group-hover:border-primary-100 group-hover:text-primary-600 transition-colors">{tech.trim()}</span>
                ))}
             </div>

             <div className="flex justify-between items-center mb-10 bg-gray-50/70 p-6 rounded-[2rem] border border-gray-50 shadow-inner group-hover:bg-white transition-colors group-hover:shadow-primary-100/30">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><DollarSign className="text-green-500" size={18} /></div>
                   <p className="text-xl font-black text-gray-800 tracking-tighter">${isAdmin ? (project.budget || 0).toLocaleString() : 'CONFIDENTIAL'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                  project.status === 'Active' ? 'bg-green-100 text-green-600 border border-green-200' : 
                  'bg-amber-100 text-amber-600 border border-amber-200'
                }`}> {project.status} </div>
             </div>

             <div className="mt-auto space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><Users size={16} /></div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collaborators ( {project.assigned_employees?.length || 0} )</p>
                   </div>
                   <div className="flex -space-x-3">
                      {project.assigned_employees?.slice(0, 4).map((emp, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-[10px] font-black text-white uppercase" title={emp.name}>{emp.name.charAt(0)}</div>
                      ))}
                      {(project.assigned_employees?.length || 0) > 4 && (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">+{project.assigned_employees.length - 4}</div>
                      )}
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-2.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <Calendar size={18} className="text-primary-300" /> {project.end_date}
                   </div>
                   {project.status === 'Completed' ? <CheckCircle className="text-green-500" size={24} /> : <div className="w-3 h-3 bg-green-500 rounded-full animate-ping shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>}
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-6xl transform animate-slide-up flex flex-col overflow-hidden max-h-[92vh] border-8 border-white">
            <div className="p-12 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-200"><Briefcase size={36} /></div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{editingId ? 'Modify Strategy' : 'Define Infrastructure'}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-3">
                     <Zap size={14} className="text-primary-600" /> High-Performance Infrastructure Sync
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-red-500 border border-gray-100 transition-all shadow-xl"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-14 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-14 custom-scrollbar">
              <div className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em] font-mono">Global Identifier (Read Only)</label>
                    <input type="text" className="form-input-modern-xl bg-gray-50/50 cursor-not-allowed opacity-60 grayscale font-mono" value={formData.project_id} readOnly />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Strategic Mission Title</label>
                    <input type="text" required className="form-input-modern-xl" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Budget Allocation ($)</label>
                       <input type="number" required className="form-input-modern-xl font-mono text-lg" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Operational Status</label>
                       <select className="form-input-modern-xl appearance-none cursor-pointer" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Activation Phase</label>
                       <input type="date" required className="form-input-modern-xl" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Deactivation Deadline</label>
                       <input type="date" required className="form-input-modern-xl" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em] flex items-center gap-2"><Code size={16} className="text-primary-600" /> Technology Foundation</label>
                    <input type="text" placeholder="e.g. Node.js, LibSQL, React, TailwindCSS" className="form-input-modern-xl" value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em] flex items-center gap-2 mb-4"><Users size={16} className="text-primary-600" /> Organizational Personnel Selection</label>
                 <div className="border-4 border-gray-50 rounded-[3rem] h-[550px] overflow-y-auto p-6 custom-scrollbar bg-gray-50/20 shadow-inner">
                    <div className="space-y-5">
                       {employees.map(emp => (
                         <div 
                           key={emp.emp_id} 
                           onClick={() => handleEmployeeToggle(emp.emp_id)}
                           className={`p-6 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all border-4 shadow-sm ${
                             formData.assigned_employees.includes(emp.emp_id) 
                               ? 'bg-primary-50 border-primary-600 shadow-2xl shadow-primary-200/50 -translate-y-1' 
                               : 'bg-white border-transparent hover:border-gray-200'
                           }`}
                         >
                            <div className="flex items-center gap-5">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md ${
                                 formData.assigned_employees.includes(emp.emp_id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                               }`}>{emp.name.charAt(0)}</div>
                               <div>
                                  <p className={`font-black uppercase text-sm tracking-tight ${formData.assigned_employees.includes(emp.emp_id) ? 'text-primary-800' : 'text-gray-900'}`}>{emp.name}</p>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{emp.department}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2 pt-12 flex gap-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-gray-100 text-gray-400 font-black rounded-[2rem] uppercase tracking-[0.3em] transition-all hover:bg-gray-200 active:scale-95 text-xs">Decline Strategy</button>
                <button type="submit" className="flex-[2] py-6 bg-primary-600 text-white font-black rounded-[2rem] uppercase tracking-[0.3em] transition-all hover:bg-primary-700 shadow-2xl shadow-primary-200 active:scale-95 text-xs">Execute Cloud Sync</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .form-input-modern-xl {
           @apply w-full px-8 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary-50 focus:border-primary-600 transition-all font-black text-gray-800 placeholder:text-gray-300;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 rounded-full border-4 border-white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { @apply bg-primary-200; }
      `}</style>
    </div>
  );
};

export default Projects;
