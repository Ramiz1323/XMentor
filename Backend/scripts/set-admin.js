import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/modules/auth/auth.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });
console.log('Loading .env from:', envPath);

const setAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isAdmin: true, isVerified: true, role: 'TEACHER' } },
      { new: true }
    );

    if (!user) {
      console.log('User not found');
    } else {
      console.log(`User ${user.email} is now an ADMIN and VERIFIED TEACHER.`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Please provide an email: node scripts/set-admin.js user@example.com');
  process.exit(1);
}

setAdmin(email);
