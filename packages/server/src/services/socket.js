// packages/server/src/services/socket.js
const logger = require('./logger');
const jwt = require('jsonwebtoken');

const connectedUsers = new Map(); // userId -> socketId

function initSocketHandlers(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // ── XP & Level Events ──────────────────────────────────────────────────
    socket.on('xp:update', (data) => {
      socket.to(`user:${socket.userId}`).emit('xp:updated', data);
    });

    // ── Quest Events ───────────────────────────────────────────────────────
    socket.on('quest:complete', (questId) => {
      io.to(`user:${socket.userId}`).emit('quest:completed', { questId });
    });

    // ── Leaderboard update broadcast ───────────────────────────────────────
    socket.on('leaderboard:request', () => {
      socket.emit('leaderboard:refresh');
    });

    // ── Notification ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });

  return {
    // Utility to emit to a specific user
    emitToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    // Broadcast to all connected users
    broadcast: (event, data) => {
      io.emit(event, data);
    },
    io,
  };
}

module.exports = { initSocketHandlers, connectedUsers };
