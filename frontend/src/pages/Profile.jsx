import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api'; 
import { 
  User, Mail, Lock, Calendar, DollarSign, Shield, Save, UserCircle, Briefcase, Camera, Verified, ShieldAlert, BadgeCheck, Upload, Trash2, RefreshCw, Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';

const Profile = () => {
  const { user, fetchMe } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile_image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        profile_image: user.profile_image || null
      });
      setPreviewImage(user.profile_image || null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit for Base64 storage
         toast.error("Photo is too large. Please select a smaller file.");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, profile_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/auth/me', formData);
      toast.success('Profile updated successfully');
      fetchMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-left">
      {/* Header Banner */}
      <div className="h-48 md:h-64 bg-slate-900 rounded-[32px] md:rounded-[48px] shadow-xl relative overflow-hidden flex items-end p-8 md:p-12 border-b-8 border-indigo-600">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-2xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-2xl -ml-24 -mb-24" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between w-full gap-6">
            <div className="space-y-2 text-left">
               <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Account Settings</h1>
               <p className="text-slate-400 font-medium">Manage your personal information and profile picture.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2.5 text-white text-[10px] font-bold uppercase tracking-widest">
                  <BadgeCheck size={16} className="text-emerald-400" />
                  Verified Directory Node
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-20 md:-mt-24 relative z-20 px-4 md:px-8">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div 
             whileHover={{ y: -4 }}
             className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-10 flex flex-col items-center text-center space-y-8"
           >
              <div className="relative group">
                 <div className="w-48 h-48 md:w-56 md:h-56 rounded-[56px] border-[8px] border-slate-50 shadow-inner overflow-hidden flex items-center justify-center bg-slate-100 relative group-hover:scale-[1.02] transition-transform duration-500">
                    {previewImage ? (
                       <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <div className="flex flex-col items-center gap-2 text-slate-300">
                          <UserCircle size={84} strokeWidth={1} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No Photo</span>
                       </div>
                    )}
                 </div>
                 <button 
                   onClick={() => fileInputRef.current.click()}
                   className="absolute bottom-4 right-4 p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 border-4 border-white hover:bg-indigo-700 transition-all active:scale-90 group-hover:rotate-12"
                 >
                    <Camera size={20} />
                 </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageChange} 
                   accept="image/*" 
                   className="hidden" 
                 />
              </div>

              <div className="space-y-4 w-full">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h2>
                    <p className="text-slate-400 text-sm font-medium">{user?.email}</p>
                 </div>
                 <div className="flex justify-center gap-3">
                    <span className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200">{user?.role}</span>
                    <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-indigo-100">{user?.emp_id}</span>
                 </div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="w-full grid grid-cols-1 gap-4">
                 <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all">
                    <div className="flex items-center gap-3">
                       <Calendar size={18} className="text-indigo-400" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user?.joining_date}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all">
                    <div className="flex items-center gap-3">
                       <DollarSign size={18} className="text-emerald-400" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">${Number(user?.salary).toLocaleString()}</span>
                 </div>
              </div>

              <div className="w-full p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                 <div className="flex items-center gap-3 text-amber-600">
                    <ShieldAlert size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Compliance Notice</h3>
                 </div>
                 <p className="text-[11px] font-medium text-amber-700 leading-relaxed text-left opacity-80 uppercase tracking-tight">Your primary employment records are restricted. Contact HR for modifications to ID or Role.</p>
              </div>
           </motion.div>
        </div>

        {/* Right Column: Main Settings Form */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                       <User size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profile Details</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Information synchronized with company records</p>
                    </div>
                 </div>
                 <button onClick={fetchMe} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-slate-200">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12 flex-1 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Display Name</label>
                       <div className="relative group">
                          <UserCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input 
                            type="text" 
                            required 
                            className="form-input-pro pl-12"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Alex Johnson"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Registry Address</label>
                       <div className="relative group">
                          <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input 
                            type="email" 
                            required 
                            className="form-input-pro pl-12"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="alex@company.com"
                          />
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-100 mt-4">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                          <Key size={14} className="text-indigo-500" /> Update Security Passkey (Optional)
                       </label>
                       <div className="relative group">
                          <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                          <input 
                            type="password" 
                            className="form-input-pro pl-12"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••••••"
                          />
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3 italic ml-1">Leave blank to maintain current system credentials</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-slate-300">
                       <Shield size={18} />
                       <p className="text-[10px] font-bold uppercase tracking-widest italic tracking-tight">Active session encrypted via SHA-256 Cloud Tunnel</p>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                       Update Profile
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>

      <style>{`
        .form-input-pro {
           @apply w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder:text-slate-300 text-sm;
        }
      `}</style>
    </div>
  );
};

export default Profile;
