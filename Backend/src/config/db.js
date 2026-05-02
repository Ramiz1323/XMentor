import mongoose from 'mongoose';

const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB Connection Error (Attempt ${i + 1}/${retries}): ${error.message}`);
      
      if (i === retries - 1) {
        console.error(`URI used: ${process.env.MONGO_URI ? 'Defined' : 'UNDEFINED'}`);
        if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('ETIMEDOUT')) {
          console.error('Tip: Check if your local MongoDB service is running (mongod) or if your Atlas IP whitelist is correct.');
        }
        process.exit(1);
      } else {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(res => setTimeout(res, waitTime));
      }
    }
  }
};

export default connectDB;

