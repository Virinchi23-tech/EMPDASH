const Meeting = require('../models/meetingModel');

const jwt = require('jsonwebtoken');

const meetingSocket = (io) => {
  // Middleware: Authentication Handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("❌ [Socket Auth] Identity Token Missing");
      return next(new Error("Authentication error: Missing token"));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
      socket.user = user;
      console.log(`✅ [Socket Auth] User ${user.email} Verified`);
      next();
    } catch (err) {
      console.log("❌ [Socket Auth] Invalid Token Protocol");
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New node connection: ${socket.id}`);

    const employeeToSocket = new Map();

    // Join a specific meeting room
    socket.on('join-room', async ({ meeting_id, user }) => {
      socket.join(meeting_id);
      employeeToSocket.set(user.emp_id, socket.id);
      socket.emp_id = user.emp_id;

      console.log(`👤 User ${user.name} (${user.emp_id}) joined room: ${meeting_id}`);
      
      try {
        await Meeting.joinMeeting(meeting_id, user.emp_id);
        
        // Notify others in the room
        socket.to(meeting_id).emit('user-joined', { 
          user, 
          socket_id: socket.id,
          timestamp: new Date() 
        });
        
        const participants = await Meeting.getParticipants(meeting_id);
        io.to(meeting_id).emit('participants-update', participants);
      } catch (err) {
        console.error('Socket join-room error:', err.message);
      }
    });

    // WebRTC Signaling: Private relay protocol
    socket.on('webrtc-signal', ({ meeting_id, target_id, signal_data, sender_id }) => {
      const targetSocketId = employeeToSocket.get(target_id);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-signal', {
          sender_id,
          signal_data,
          meeting_id
        });
      } else {
        socket.to(meeting_id).emit('webrtc-signal', { 
           sender_id, 
           signal_data,
           meeting_id 
        });
      }
    });

    // Leave room
    socket.on('leave-room', async ({ meeting_id, user }) => {
      socket.leave(meeting_id);
      console.log(`👤 User ${user.name} left room: ${meeting_id}`);
      
      try {
        await Meeting.leaveMeeting(meeting_id, user.emp_id);
        socket.to(meeting_id).emit('user-left', { user, timestamp: new Date() });
        const participants = await Meeting.getParticipants(meeting_id);
        io.to(meeting_id).emit('participants-update', participants);
      } catch (err) {
        console.error('Socket leave-room error:', err.message);
      }
    });

    // Send Message
    socket.on('send-message', async ({ meeting_id, sender_id, sender_name, message }) => {
      try {
        await Meeting.saveMessage(meeting_id, sender_id, message);
        const messageData = { meeting_id, sender_id, sender_name, message, timestamp: new Date() };
        io.to(meeting_id).emit('receive-message', messageData);
      } catch (err) {
        console.error('Socket send-message error:', err.message);
      }
    });

    // Meeting status update
    socket.on('update-meeting-status', async ({ meeting_id, status }) => {
      try {
        await Meeting.updateStatus(meeting_id, status);
        io.emit('meeting-updated', { meeting_id, status });
      } catch (err) {
        console.error('Socket status update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      if (socket.emp_id) employeeToSocket.delete(socket.emp_id);
      console.log(`🔌 Node disconnected: ${socket.id}`);
    });
  });

  // Global broadcast helper for HTTP controllers
  return {
    broadcastMeetingCreated: (meeting) => {
      io.emit('meeting-created', meeting);
    }
  };
};

module.exports = meetingSocket;
