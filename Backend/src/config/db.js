import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options help identify connection issues faster
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give it 10s to establish the socket
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`URI used: ${process.env.MONGO_URI ? 'Defined' : 'UNDEFINED'}`);
    
    if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('ETIMEDOUT')) {
      console.error('Tip: Check if your local MongoDB service is running (mongod) or if your Atlas IP whitelist is correct.');
    }
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;

