import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, MessageSquare, Send, LogOut, Video, VideoOff, Mic, MicOff,
  Clock, Share2, Play, Square, User, Shield, Info, Copy, Settings, PhoneOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingRoom = () => {
  const { meeting_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Media State
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // emp_id -> stream
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const localVideoRef = useRef();
  const peersRef = useRef({}); // emp_id -> RTCPeerConnection
  const scrollRef = useRef(null);

  const isAdmin = ['Admin', 'HR', 'Manager'].includes(user?.role) || meeting?.created_by === user?.emp_id;

  // Initialize Media Protocol
  const initMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 }, 
        audio: true 
      });
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error('🔥 [Media Handshake Denied]:', err);
      toast.error('Permission for Camera/Mic denied. Read-only mode active.');
      return null;
    }
  }, []);

  // WebRTC Configuration
  const iceConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const createPeerConnection = useCallback((targetId, localMediaStream) => {
    const pc = new RTCPeerConnection(iceConfiguration);

    // Track addition
    if (localMediaStream) {
      localMediaStream.getTracks().forEach(track => {
        pc.addTrack(track, localMediaStream);
      });
    }

    // Remote stream negotiation
    pc.ontrack = (event) => {
      console.log(`📡 [WebRTC] Remote pulse detected from ${targetId}`);
      setRemoteStreams(prev => ({
        ...prev,
        [targetId]: event.streams[0]
      }));
    };

    // ICE Candidate management
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          meeting_id,
          target_id: targetId,
          sender_id: user.emp_id,
          signal_data: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    return pc;
  }, [meeting_id, user.emp_id]);

  // Sync Local Video
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const setupProtocol = async () => {
      const localStream = await initMedia();
      
      try {
        const response = await api.get(`/api/meetings/${meeting_id}`);
        if (response.data.success) {
          const meetingData = response.data.data;
          
          // Strategic External Redirect: Handshake with third-party nodes
          if (meetingData.meeting_link && meetingData.meeting_link.startsWith('http') && !meetingData.meeting_link.includes(`/meetings/${meeting_id}`)) {
              console.log('📡 [External Hub] Redirection Protocol Initiated...');
              window.location.replace(meetingData.meeting_link);
              return;
          }

          setMeeting(meetingData);
          setParticipants(meetingData.participants || []);
          setMessages(meetingData.messages || []);
        }
      } catch (err) {
        toast.error('Strategic terminal access denied');
        navigate('/meetings');
        return;
      } finally {
        setLoading(false);
      }

      // Socket Interactions
      socket.emit('join-room', { meeting_id, user: { ...user, emp_id: user.emp_id, name: user.name } });

      socket.on('participants-update', (updatedParticipants) => {
        setParticipants(updatedParticipants);
      });

      socket.on('user-joined', async ({ user: joinedUser }) => {
        toast(`${joinedUser.name} synchronized with terminal`, { icon: '👤' });
        
        if (localStream) {
            const pc = createPeerConnection(joinedUser.emp_id, localStream);
            peersRef.current[joinedUser.emp_id] = pc;
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            socket.emit('webrtc-signal', {
                meeting_id,
                target_id: joinedUser.emp_id,
                sender_id: user.emp_id,
                signal_data: offer
            });
        }
      });

      // Handle Signaling Chain
      socket.on('webrtc-signal', async ({ sender_id, signal_data }) => {
        let pc = peersRef.current[sender_id];

        if (signal_data.type === 'offer') {
          console.log(`📡 [WebRTC] Incoming offer from ${sender_id}`);
          pc = createPeerConnection(sender_id, localStream);
          peersRef.current[sender_id] = pc;
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            meeting_id,
            target_id: sender_id,
            sender_id: user.emp_id,
            signal_data: answer
          });
        } 
        else if (signal_data.type === 'answer') {
          console.log(`📡 [WebRTC] Answer received from ${sender_id}`);
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        } 
        else if (signal_data.type === 'candidate') {
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal_data.candidate));
        }
      });

      socket.on('receive-message', (messageData) => {
        setMessages(prev => [...prev, messageData]);
      });

      socket.on('meeting-updated', ({ status }) => {
        setMeeting(prev => ({ ...prev, status }));
        if (status === 'ended') {
          toast.error('Session decommissioning initiated by Admin.');
          stopMedia();
        }
      });

      socket.on('user-left', ({ user: leftUser }) => {
        if (peersRef.current[leftUser.emp_id]) {
            peersRef.current[leftUser.emp_id].close();
            delete peersRef.current[leftUser.emp_id];
            setRemoteStreams(prev => {
                const next = { ...prev };
                delete next[leftUser.emp_id];
                return next;
            });
        }
      });
    };

    setupProtocol();

    return () => {
      stopMedia();
      socket.emit('leave-room', { meeting_id, user });
      socket.off('participants-update');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('meeting-updated');
      socket.off('webrtc-signal');
    };
  }, [meeting_id, user, navigate, initMedia, createPeerConnection]);

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
  };

  const toggleMic = () => {
    if (stream) {
        stream.getAudioTracks().forEach(track => track.enabled = !micEnabled);
        setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
        stream.getVideoTracks().forEach(track => track.enabled = !videoEnabled);
        setVideoEnabled(!videoEnabled);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.emit('send-message', {
      meeting_id,
      sender_id: user.emp_id,
      sender_name: user.name,
      message: newMessage
    });
    setNewMessage('');
  };

  const updateStatus = (newStatus) => {
    socket.emit('update-meeting-status', { meeting_id, status: newStatus });
    toast.success(`Protocol state: ${newStatus.toUpperCase()}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Terminal link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Video size={60} className="animate-pulse text-indigo-500 mb-8" />
        <h2 className="text-2xl font-black uppercase tracking-[0.5em] italic">Accessing Encryption Layer...</h2>
      </div>
    );
  }

  return (
    <div className="h-[95vh] flex flex-col bg-slate-950 text-white rounded-[2rem] md:rounded-[40px] overflow-hidden border border-white/5 shadow-inner m-2 md:m-4 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
      
      {/* Header */}
      <div className="px-8 py-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-30">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className={`p-4 rounded-3xl ${meeting.status === 'live' ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'bg-indigo-600'} transition-all`}>
               <Video size={24} />
             </div>
             {meeting.status === 'live' && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span></span>}
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">{meeting.title}</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               ID: <span className="text-indigo-400">{meeting_id}</span> • Auth: <span className="text-emerald-400">RSA-SECURE</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-2xl border border-white/5">
             <Clock size={14} className="text-indigo-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">{meeting.duration}m Limit</span>
          </div>
          
          <button onClick={copyLink} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400 border border-white/5"><Copy size={18} /></button>
          
          {isAdmin && meeting.status === 'scheduled' && (
            <button onClick={() => updateStatus('live')} className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] italic flex items-center gap-2 shadow-xl shadow-emerald-500/10"><Play size={14} /> Start Protocol</button>
          )}

          {isAdmin && meeting.status === 'live' && (
            <button onClick={() => updateStatus('ended')} className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] italic flex items-center gap-2 shadow-xl shadow-red-500/10"><Square size={14} /> End Session</button>
          )}

          <button onClick={() => navigate('/meetings')} className="px-6 py-4 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] italic flex items-center gap-2 border border-white/5"><PhoneOff size={14} /> Eject</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-20">
        {/* Main Grid Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 flex flex-col">
           {/* Video Grid */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] mb-8">
              {/* Local Stream */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border-2 border-indigo-600/30 group shadow-2xl">
                 <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                 <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg"><User size={18} /></div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Local Session (You)</p>
                       <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Status: Broadcasting</p>
                    </div>
                 </div>
                 {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                       <VideoOff size={60} className="text-slate-800" />
                    </div>
                 )}
              </div>

              {/* Remote Streams */}
              {Object.entries(remoteStreams).map(([remoteId, remoteStream]) => {
                const pInfo = participants.find(p => p.employee_id === remoteId);
                return (
                  <div key={remoteId} className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 group shadow-xl">
                    <video 
                        autoPlay 
                        playsInline 
                        ref={el => { if(el) el.srcObject = remoteStream; }} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10">{pInfo?.name?.charAt(0)}</div>
                        <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{pInfo?.name || 'Remote Node'}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Synchronized Signal</p>
                        </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty state fill */}
              {participants.length <= 1 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-800 opacity-20 bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-800">
                    <Users size={120} />
                    <p className="text-2xl font-black uppercase tracking-[0.5em] mt-8">Awaiting Peer Sync...</p>
                </div>
              )}
           </div>

           {/* Media Controls Floating Bar */}
           <div className="flex justify-center mb-8">
              <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.5rem] flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 <button 
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${micEnabled ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                 >
                    {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                 </button>
                 <button 
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${videoEnabled ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                 >
                    {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                 </button>
                 <div className="w-px h-8 bg-white/5 mx-2" />
                 <button className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center"><Share2 size={20} /></button>
                 <button className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-indigo-400 border border-indigo-400/20"><Settings size={20} /></button>
                 <button onClick={() => navigate('/meetings')} className="w-14 h-14 rounded-2xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-500/20"><PhoneOff size={20} /></button>
              </div>
           </div>
        </div>

        {/* Sidebar Panel (Chat + Info) */}
        <div className="w-96 bg-slate-900/50 backdrop-blur-2xl border-l border-white/5 flex flex-col relative">
           {/* Participants Count Badge Floating */}
           <div className="absolute -left-16 top-10 flex flex-col gap-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl font-black text-xs">{participants.length}</div>
           </div>

           {/* Chat Header */}
           <div className="p-8 border-b border-white/5 flex items-center gap-3">
              <MessageSquare size={18} className="text-indigo-400" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] italic">Comm Logic</h3>
           </div>

           {/* Chat Messages */}
           <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender_id === user.emp_id ? 'items-end' : 'items-start'}`}>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                       {msg.sender_id === user.emp_id ? 'Terminal Local' : msg.sender_name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className={`p-5 rounded-3xl text-[11px] font-bold leading-relaxed ring-1 ring-white/5 ${msg.sender_id === user.emp_id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'}`}>
                       {msg.message}
                    </div>
                </div>
              ))}
           </div>

           {/* Input Area */}
           <div className="p-8 bg-slate-950/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-900 p-2 rounded-[30px] border border-white/5 focus-within:border-indigo-600 transition-all">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Push to log..." 
                        className="flex-1 bg-transparent border-none outline-none p-3 font-black text-xs text-white placeholder-slate-600 px-5 italic"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"><Send size={16} /></button>
                </form>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MeetingRoom;
