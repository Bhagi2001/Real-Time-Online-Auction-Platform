import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root of the server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Remove any existing administrators
    console.log('Removing existing admins to enforce single-admin architecture...');
    const deletionResult = await User.deleteMany({ isAdmin: true });
    console.log(`Deleted ${deletionResult.deletedCount} existing admin(s).`);

    // 2. Create the single strict admin
    const adminEmail = 'admin@bidlanka.com';
    const adminPassword = 'password123';
    
    // Check if a normal user exists with this email and remove to avoid conflicts
    await User.deleteOne({ email: adminEmail });

    console.log(`Creating single admin: ${adminEmail}`);
    const admin = await User.create({
      name: 'Platform Administrator',
      email: adminEmail,
      password: adminPassword, // Password will be hashed by User model pre-save hook
      isAdmin: true,
      isVerified: true
    });

    console.log('\n✅ Single Admin created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('\nPlease change this password immediately in the Admin Settings dashboard.');

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    process.exit(0);
  }
};

seedAdmin();
