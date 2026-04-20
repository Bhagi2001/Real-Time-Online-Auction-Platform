import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load env vars
dotenv.config();

const makeAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address.');
    console.error('Usage: node makeAdmin.js <user-email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: email },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
    } else {
      console.log(`🎉 Success! User ${user.name} (${user.email}) is now an Admin!`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }
};

makeAdmin();
