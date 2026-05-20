const { Server } = require('socket.io');

const jwt = require('jsonwebtoken');

let io = null;

// Map userId -> Set<socketId> (1 user có thể có nhiều tab/device)
const userSockets = new Map();

// ============================================================
// Khởi tạo Socket.IO với HTTP server
// ============================================================
const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware xác thực token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Vui lòng đăng nhập'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Token không hợp lệ'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User ${userId} kết nối - socket: ${socket.id}`);

    // Join room theo userId
    socket.join(`user_${userId}`);

    // Lưu vào map
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Khi ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} ngắt kết nối - socket: ${socket.id}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  console.log('[Socket] Socket.IO đã khởi tạo');
  return io;
};

// ============================================================
// Gửi event đến 1 user cụ thể
// ============================================================
const emitToUser = (userId, event, data) => {
  if (!io) {
    console.warn('[Socket] Socket.IO chưa được khởi tạo');
    return;
  }
  io.to(`user_${userId}`).emit(event, data);
};

// ============================================================
// Lấy instance io
// ============================================================
const getIO = () => io;

module.exports = {
  init,
  emitToUser,
  getIO,
};
