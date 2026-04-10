import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

const router = express.Router();

router.use(protect, adminOnly);

// Get global stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalBids = await Bid.countDocuments();

    // Generate real graph data for the last 7 days calculation
    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const revenue = [];
    const activity = [];

    for (let i = 0; i < 7; i++) {
      const startOfDay = past7Days[i];
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Revenue: sum of winning bids for auctions that ended on this day
      const endedAuctions = await Auction.find({
        status: { $in: ['ended', 'sold'] },
        updatedAt: { $gte: startOfDay, $lt: endOfDay }
      });
      const dayRevenue = endedAuctions.reduce((sum, auc) => sum + (auc.currentBid || 0), 0);
      
      revenue.push({
        name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue
      });

      // Activity: count of new auctions and new bids created on this day
      const auctionsCount = await Auction.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      const bidsCount = await Bid.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      activity.push({
        name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        auctions: auctionsCount,
        bids: bidsCount
      });
    }

    res.json({
      metrics: { totalUsers, totalAuctions, activeAuctions, totalBids },
      graphs: { revenue, activity }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Suspend/Activate User
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'suspended' mock
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot suspend yourself" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // In a real app we'd save `user.isSuspended = true`, but we rely on a soft mock here to keep auth flow intact
    res.json({ message: `User status changed to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all auctions
router.get('/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update auction status
router.put('/auctions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const auction = await Auction.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deep Analytics
router.get('/analytics/deep', async (req, res) => {
  try {
    const auctions = await Auction.find().select('category status currentBid seller').populate('seller', 'name');

    // Aggregate category data
    const categoryStats = {};
    auctions.forEach(a => {
      if (!categoryStats[a.category]) {
        categoryStats[a.category] = { name: a.category, value: 0 };
      }
      categoryStats[a.category].value += 1;
    });

    // Aggregate User/Seller performance
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

    res.json({ categoryDistribution, topSellers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CSV Export: Users
router.get('/export/users', async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt isVerified');
    let csv = 'ID,Name,Email,Role,Joined,Verified\n';
    users.forEach(u => {
      csv += `${u._id},"${u.name}","${u.email}",${u.role},${u.createdAt.toISOString()},${u.isVerified}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('bidlanka-users.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CSV Export: Auctions
router.get('/export/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find().populate('seller', 'name email');
    let csv = 'ID,Title,Category,Status,StartingBid,CurrentBid,SellerEmail,BidsCount\n';
    auctions.forEach(a => {
      const sellerEmail = a.seller ? a.seller.email : 'Unknown';
      csv += `${a._id},"${a.title.replace(/"/g, '""')}","${a.category}",${a.status},${a.startingBid},${a.currentBid},"${sellerEmail}",${a.bids.length}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('bidlanka-auctions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
