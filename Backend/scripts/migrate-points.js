/**
 * Migration: Backfill points = 150 for all existing users
 * 
 * Run once with:  node Backend/scripts/migrate-points.js
 * 
 * Safe to run multiple times — only updates users that are MISSING the field.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from Backend root
dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not found in .env');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅  Connected to MongoDB');

const db = mongoose.connection.db;
const usersCollection = db.collection('users');

// Target all existing users and set their points to 50
const result = await usersCollection.updateMany(
  {},
  {
    $set: {
      points: 50,
    }
  }
);

console.log(`\n🎖️  Migration complete:`);
console.log(`   Matched  : ${result.matchedCount} users`);
console.log(`   Updated  : ${result.modifiedCount} users → points = 50\n`);

await mongoose.disconnect();
process.exit(0);
