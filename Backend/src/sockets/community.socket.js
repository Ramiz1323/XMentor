import { Server } from 'socket.io';
import * as communityService from '../modules/community/community.service.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const setupCommunitySocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  logger.info('socket_server_initialized', { corsOrigin: io.opts.cors.origin });

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      
      // If not in auth object, check cookies
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, c) => {
          const cookiePair = c.trim();
          const eqIdx = cookiePair.indexOf('=');
          if (eqIdx > 0) {
            const name = cookiePair.substring(0, eqIdx).trim();
            const value = cookiePair.substring(eqIdx + 1).trim();
            if (name) acc[name] = value;
          }
          return acc;
        }, {});
        token = cookies['token'];
      }

      if (!token) {
        logger.warn('socket_auth_missing', { event: 'handshake' });
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      logger.error('socket_auth_failed', { error: err.message });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('socket_user_connected', { userId: socket.user.id, role: socket.user.role });

    // Join personal room for system notifications
    socket.join(socket.user.id);

    socket.on('join_community', async (communityId) => {
      try {
        // Authorization check: Verify membership
        const community = await communityService.getCommunityById(communityId, socket.user.id);
        if (!community || !community.isMember) {
          return socket.emit('error', { message: 'Access denied. You are not a member of this community.' });
        }

        socket.join(communityId);
        logger.info('socket_room_joined', { userId: socket.user.id, communityId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room: ' + err.message });
      }
    });

    socket.on('send_message', async (data) => {
      const { communityId, content, clientId } = data;
      logger.info('socket_message_received', { userId: socket.user.id, communityId, clientId });
      
      if (!communityId) return socket.emit('error', { message: 'Community ID is required' });
      if (!content || content.trim().length === 0) return socket.emit('error', { message: 'Message content cannot be empty' });
      if (content.length > 1000) return socket.emit('error', { message: 'Message too long (max 1000 chars)' });

      try {
        // Authorization check: Verify membership
        const community = await communityService.getCommunityById(communityId, socket.user.id);
        if (!community || !community.isMember) {
          return socket.emit('error', { message: 'Access denied. You must be a member to send messages.' });
        }

        const savedMsg = await communityService.saveMessage(communityId, socket.user.id, content.trim());
        
        if (savedMsg) {
          logger.info('socket_message_broadcast', { messageId: savedMsg._id });
          io.to(communityId).emit('new_message', {
            _id: savedMsg._id,
            clientId, // Echo back for optimistic UI tracking
            content: savedMsg.content,
            sender: savedMsg.sender,
            senderAlias: savedMsg.senderAlias,
            createdAt: savedMsg.createdAt,
            community: communityId
          });
        }
      } catch (err) {
        logger.error('socket_message_error', { error: err.message });
        socket.emit('error', { message: 'Failed to send message: ' + err.message, clientId });
      }
    });

    socket.on('disconnect', () => {
      logger.info('socket_user_disconnected', { userId: socket.user.id });
    });
  });

  return io;
};

export default setupCommunitySocket;
