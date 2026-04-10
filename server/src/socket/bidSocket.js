import Notification from '../models/Notification.js';

const onlineUsersMap = new Map();

export const initBidSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction_${auctionId}`);
      console.log(`👥 Socket ${socket.id} joined auction_${auctionId}`);
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction_${auctionId}`);
    });

    // Join user-specific room for notifications/messages
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      onlineUsersMap.set(socket.id, userId);
      io.emit('online_users', [...new Set(onlineUsersMap.values())]);
      console.log(`👤 Socket ${socket.id} joined user_${userId}`);
    });

    // Typing indicator (messages)
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing', { userId });
    });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('disconnect', () => {
      if (onlineUsersMap.has(socket.id)) {
        onlineUsersMap.delete(socket.id);
        io.emit('online_users', [...new Set(onlineUsersMap.values())]);
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
