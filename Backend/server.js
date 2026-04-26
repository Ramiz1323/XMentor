import dotenv from 'dotenv';
import http from 'node:http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import setupCommunitySocket from './src/sockets/community.socket.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = setupCommunitySocket(server);
    app.set('socketio', io);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

