import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import logger from '../config/logger.js';

export const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.headers?.cookie
          ?.split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isBanned) {
        return next(new Error('Unauthorized'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.user._id}`;
    socket.join(room);
    logger.debug(`Socket connected: ${socket.user._id}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.user._id}`);
    });
  });
};

export default registerSocketHandlers;
