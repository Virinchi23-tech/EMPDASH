import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { 
  Video, Plus, Calendar, Clock, Bookmark, Search, Filter, 
  Trash2, Edit2, CheckCircle, AlertCircle, RefreshCw, X, MoreVertical, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingsLog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    scheduled_time: new Date().toISOString().slice(0, 16), 
    duration: 30,
    meeting_link: '',
    participants: [] 
  });
  
  const canManage = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📡 [Meetings] Synchronizing with Cloud Registry...');
      const response = await api.get('/api/meetings');
      
      if (response.data.success) {
        setMeetings(response.data.data);
      }
    } catch (err) {
      console.error('❌ [Meetings] Cloud Fetch Failure:', err);
      toast.error('Identity sync error. Database cloud tunnel failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (err) {
      console.error('Employee fetch failure');
    }
  };

  useEffect(() => {
    // Identity Verification (Mandatory Strategy)
    if (!localStorage.getItem('token')) {
        console.warn('❌ [Meetings Registry] Identity Missing: Denying Entry.');
        toast.error('Strategic Session Access Denied: Please Login.');
        navigate('/login');
        return;
    }

    fetchMeetings();
    fetchEmployees();

    // Listen for real-time meeting creation/updates
    socket.on('meeting-created', (newMeeting) => {
      console.log('🔔 New meeting detected:', newMeeting);
      setMeetings(prev => [newMeeting, ...prev]);
      toast('New meeting scheduled!', { icon: '📅', style: { borderRadius: '20px', background: '#4F46E5', color: '#fff' } });
    });

    socket.on('meeting-updated', ({ meeting_id, status }) => {
      setMeetings(prev => prev.map(m => m.id === meeting_id ? { ...m, status } : m));
    });

    return () => {
      socket.off('meeting-created');
      socket.off('meeting-updated');
    };
  }, [fetchMeetings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/meetings/create', { 
        ...formData, 
        created_by: user.emp_id 
      });
      
      if (response.data.success) {
        toast.success('Professional Session Established');
        setShowModal(false);
        
        // Strategic Auto-Join for External Links
        if (formData.meeting_link && formData.meeting_link.startsWith('http')) {
           window.open(formData.meeting_link, '_blank');
        }
        
        setFormData({
          title: '', description: '',
          scheduled_time: new Date().toISOString().slice(0, 16),
          duration: 30, meeting_link: '', participants: []
        });
        fetchMeetings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Infrastructure Handshake Failure');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Decommission this protocol record? This action is irreversible.')) {
      try {
        await api.delete(`/api/meetings/${id}`);
        toast.success('Record Successfully Purged');
        setMeetings(prev => prev.filter(m => m.id !== id));
      } catch (err) {
        toast.error('Infrastructure purge failure');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'live': return <span className="px-5 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg shadow-red-200">Live Now</span>;
      case 'ended': return <span className="px-5 py-2 bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">Archive</span>;
      default: return <span className="px-5 py-2 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">Scheduled</span>;
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-fade-in text-gray-900">
      {/* Premium Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-12 bg-white rounded-[60px] border-2 border-slate-50 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-[0_5px_20px_rgba(79,70,229,0.4)]"></div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Meeting Registry</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-[11px] flex items-center gap-4">
             <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 animate-pulse transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
             Real-Time Collaboration Hub &bull; Strategic Node: <span className="text-indigo-600 font-black">Active</span>
          </p>
        </div>
        
        {canManage && (
          <button 
            onClick={() => setShowModal(true)} 
            className="mt-8 lg:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-[30px] font-black flex items-center gap-4 shadow-3xl shadow-indigo-200 transition-all active:scale-95 uppercase tracking-widest text-sm italic group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Establish Session
          </button>
        )}
      </motion.div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[60px] border border-slate-100 shadow-3xl overflow-hidden min-h-[600px] flex flex-col"
        >
          <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-indigo-50/10">
             <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-[35px] flex items-center justify-center shadow-4xl shadow-indigo-200"><Video size={40} /></div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Internal Engagements</h2>
                   <p className="text-[11px] font-black text-slate-400 tracking-[0.5em] uppercase mt-4 italic font-mono">Real-Time Turso DB Synchronization Active</p>
                </div>
             </div>
             <button onClick={fetchMeetings} className="p-5 bg-white text-slate-400 rounded-3xl border border-slate-100 hover:text-indigo-600 transition-all shadow-sm">
                <RefreshCw size={28} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>

          <div className="p-12">
             {loading && meetings.length === 0 ? (
               <div className="py-32 text-center">
                 <RefreshCw className="animate-spin mx-auto text-indigo-400 mb-6" size={60} />
                 <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-sm italic">Requesting Turso Clusters...</p>
               </div>
             ) : meetings.length === 0 ? (
               <div className="py-48 text-center text-slate-200 font-black uppercase tracking-[1em] italic text-3xl opacity-20 select-none">Registry Empty</div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {meetings.map((meeting) => (
                   <motion.div 
                     key={meeting.id} 
                     layoutId={meeting.id}
                     whileHover={{ y: -10 }}
                     className="bg-white p-10 rounded-[50px] border-2 border-slate-50 hover:shadow-4xl transition-all group relative overflow-hidden flex flex-col border-b-[12px] border-indigo-600/10 hover:border-indigo-600"
                   >
                     <div className="flex justify-between items-start mb-8">
                       <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600">
                          <Calendar size={24} />
                       </div>
                       <div className="flex gap-2">
                         {getStatusBadge(meeting.status)}
                         {canManage && (
                           <button onClick={() => handleDelete(meeting.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all shadow-inner"><Trash2 size={16} /></button>
                         )}
                       </div>
                     </div>

                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-4 group-hover:text-indigo-600 transition-colors">{meeting.title}</h3>
                     <p className="text-slate-400 text-sm font-bold line-clamp-3 mb-8 italic">{meeting.description || 'No strategic protocol archived for this session.'}</p>
                     
                     <div className="mt-auto space-y-6 pt-6 border-t border-slate-50">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                           <Clock size={14} className="text-indigo-500" />
                           {meeting.duration} Mins
                         </div>
                         <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                           <Bookmark size={14} className="text-indigo-500" />
                           {new Date(meeting.scheduled_time).toLocaleDateString()}
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black">{meeting.creator_name?.[0] || 'U'}</div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{meeting.creator_name || 'System Protocol'}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                            {meeting.participant_count || 0} Joined
                          </div>
                       </div>

                       <button 
                        onClick={() => {
                          if (meeting.meeting_link && meeting.meeting_link.startsWith('http') && !meeting.meeting_link.includes(`/meetings/${meeting.id}`)) {
                            window.open(meeting.meeting_link, '_blank');
                          } else {
                            navigate(`/meetings/${meeting.id}`);
                          }
                        }}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl"
                       >
                         {meeting.meeting_link && meeting.meeting_link.includes('meet.google.com') ? 'Open Google Meet' : 'Join Room'} <ExternalLink size={14} />
                       </button>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* Meeting Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-[60px] shadow-5xl w-full max-w-4xl relative z-10 overflow-hidden border border-white/20"
            >
              <div className="p-12 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <div className="flex items-center gap-8 text-indigo-600">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-[25px] flex items-center justify-center"><Video size={32} /></div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic select-none">Establish Session</h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">Infrastructure Real-Time Sync Active</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="bg-white p-5 rounded-full hover:bg-slate-100 text-slate-300 transition-all shadow-inner border border-slate-100"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-14 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Meeting Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[30px] font-black focus:border-indigo-600 outline-none shadow-sm text-md" placeholder="e.g. Q2 Performance Audit" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Scheduled Time</label>
                    <input required type="datetime-local" value={formData.scheduled_time} onChange={e => setFormData({...formData, scheduled_time: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[30px] font-black focus:border-indigo-600 outline-none shadow-sm text-md font-mono" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Duration (Minutes)</label>
                    <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[30px] font-black focus:border-indigo-600 outline-none shadow-sm text-md font-mono" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Meeting Link (Paste or Auto-gen)</label>
                    <input type="text" value={formData.meeting_link} onChange={e => setFormData({...formData, meeting_link: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[30px] font-black focus:border-indigo-600 outline-none shadow-sm text-md" placeholder="Manual link or leave blank for auto-gen" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Creator Node</label>
                    <div className="w-full p-6 bg-slate-100 border border-slate-200 rounded-[30px] font-black text-slate-400 flex items-center gap-3">
                       <CheckCircle size={18} className="text-indigo-400" /> {user.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Assign Strategic Nodes (Participants)</label>
                  <div className="flex flex-wrap gap-3 p-6 bg-slate-50 border border-slate-100 rounded-[30px] min-h-[80px]">
                    {employees.filter(e => e.emp_id !== user.emp_id).map(emp => (
                      <button
                        key={emp.emp_id}
                        type="button"
                        onClick={() => {
                          const exists = formData.participants.find(p => p.employee_id === emp.emp_id);
                          if (exists) {
                            setFormData({...formData, participants: formData.participants.filter(p => p.employee_id !== emp.emp_id)});
                          } else {
                            setFormData({...formData, participants: [...formData.participants, { employee_id: emp.emp_id, role: 'employee' }]});
                          }
                        }}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.participants.find(p => p.employee_id === emp.emp_id)
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-400 hover:text-indigo-600 border border-slate-100'
                        }`}
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Strategic Description</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[40px] font-black focus:border-indigo-600 outline-none shadow-sm text-md italic" placeholder="Document critical session objectives and protocol..."></textarea>
                </div>

                <div className="pt-8 flex gap-6">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-7 bg-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs italic">Abandon Protocol</button>
                   <button type="submit" className="flex-[2] py-7 bg-indigo-600 text-white font-black rounded-3xl shadow-4xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs italic">Commit to Registry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingsLog;
