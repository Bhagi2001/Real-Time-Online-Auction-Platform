import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';
import Auction from '../src/models/Auction.js';
import Bid from '../src/models/Bid.js';

const seedMetrics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the admin user to attach items to
    let user = await User.findOne({ isAdmin: true });
    if (!user) {
      user = await User.create({ name: 'Dummy', email: 'dummy@test.com', password: 'password', isVerified: true });
    }

    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    console.log('Injecting historical data for graphs...');

    for (let i = 0; i < 7; i++) {
        const targetDate = past7Days[i];
        
        // Random number of items for this day
        const auctionsToCreate = Math.floor(Math.random() * 15) + 2;
        const bidsToCreate = Math.floor(Math.random() * 30) + 5;
        const revenueAmount = Math.floor(Math.random() * 10000) + 1000;

        // Create some ended/sold auctions to represent Revenue
        for(let a=0; a < 2; a++) {
            await Auction.create({
                title: `Vintage Item ${Math.random()}`,
                description: 'Mock item for graph data.',
                category: 'Other',
                condition: 'Good',
                seller: user._id,
                startingBid: 100,
                currentBid: Math.floor(revenueAmount / 2),
                status: 'ended',
                endTime: targetDate, // Already ended
            }, { timestamps: false }).then(doc => {
               // Force timestamps to represent past creation
               return Auction.updateOne({ _id: doc._id }, { $set: { createdAt: targetDate, updatedAt: targetDate }});
            });
        }

        // Create some normal new auctions to represent Activity
        for (let a=0; a < auctionsToCreate; a++) {
            await Auction.create({
                title: `Active Item ${Math.random()}`,
                description: 'Mock item for graph data.',
                category: 'Electronics',
                condition: 'Brand New',
                seller: user._id,
                startingBid: 50,
                status: 'active',
                endTime: new Date(Date.now() + 86400000),
            }, { timestamps: false }).then(doc => {
               return Auction.updateOne({ _id: doc._id }, { $set: { createdAt: targetDate, updatedAt: targetDate }});
            });
        }

        // Create some bids to represent Activity
        for (let b=0; b < bidsToCreate; b++) {
            // Need a dummy auction id
            await Bid.create({
                auction: new mongoose.Types.ObjectId(),
                bidder: user._id,
                amount: Math.floor(Math.random() * 1000)
            }, { timestamps: false }).then(doc => {
               return Bid.updateOne({ _id: doc._id }, { $set: { createdAt: targetDate, updatedAt: targetDate }});
            });
        }
    }

    console.log('Successfully injected historical graph data!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
};

seedMetrics();
