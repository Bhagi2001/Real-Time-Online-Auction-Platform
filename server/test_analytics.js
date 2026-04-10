import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auction from './src/models/Auction.js';
import User from './src/models/User.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const auctions = await Auction.find().select('category status currentBid seller').populate('seller', 'name');
    
    const categoryStats = {};
    auctions.forEach(a => {
      if (!categoryStats[a.category]) {
        categoryStats[a.category] = { name: a.category, value: 0 };
      }
      categoryStats[a.category].value += 1;
    });

    const sellerStats = {};
    auctions.forEach(a => {
      if (a.seller && a.seller.name) {
        if (!sellerStats[a.seller.name]) {
          sellerStats[a.seller.name] = { name: a.seller.name, volume: 0, items: 0 };
        }
        sellerStats[a.seller.name].items += 1;
        sellerStats[a.seller.name].volume += a.currentBid || 0;
      }
    });

    const categoryDistribution = Object.values(categoryStats).sort((a, b) => b.value - a.value).slice(0, 5);
    const topSellers = Object.values(sellerStats).sort((a, b) => b.volume - a.volume).slice(0, 5);

    console.log({ categoryDistribution, topSellers });

  } catch (err) {
    console.error('ERROR OCCURRED:', err.stack);
  } finally {
    process.exit(0);
  }
};

test();
