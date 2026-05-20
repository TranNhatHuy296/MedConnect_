import { io } from 'socket.io-client';


const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const socketService = {
  connect() {
    if (socket?.connected) return socket;

    const token = localStorage.getItem('token');
    if (!token) return null;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket() {
    return socket;
  },

  onNewNotification(callback) {
    if (!socket) return () => {};
    socket.on('new_notification', callback);
    return () => socket?.off('new_notification', callback);
  },

  onNotificationRead(callback) {
    if (!socket) return () => {};
    socket.on('notification_read', callback);
    return () => socket?.off('notification_read', callback);
  },

  onUnreadCount(callback) {
    if (!socket) return () => {};
    socket.on('unread_count', callback);
    return () => socket?.off('unread_count', callback);
  },
};

export default socketService;
