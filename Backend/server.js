import dotenv from 'dotenv';
import http from 'node:http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import setupCommunitySocket from './src/sockets/community.socket.js';
import logger from './src/utils/logger.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = setupCommunitySocket(server);
    app.set('socketio', io);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      logger.info('server_start', { port: PORT, mode: process.env.NODE_ENV || 'development' });
    });

    process.on('unhandledRejection', (err, promise) => {
      logger.error('unhandled_rejection', { error: err.message, stack: err.stack });
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error('initialization_error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();

