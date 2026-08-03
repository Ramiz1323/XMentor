import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      logger.info('db_connected', { host: conn.connection.host });
      return;
    } catch (error) {
      logger.error('db_connection_error', { attempt: i + 1, maxRetries: retries, error: error.message });
      
      if (i === retries - 1) {
        logger.error('db_connection_failed', { uri_defined: !!process.env.MONGO_URI });
        if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('ETIMEDOUT')) {
          logger.error('db_connection_tip', { msg: 'Check if local MongoDB service is running (mongod) or Atlas IP whitelist.' });
        }
        process.exit(1);
      } else {
        const waitTime = delay * Math.pow(2, i);
        logger.warn('db_connection_retry', { retryInSeconds: waitTime / 1000 });
        await new Promise(res => setTimeout(res, waitTime));
      }
    }
  }
};

export default connectDB;

