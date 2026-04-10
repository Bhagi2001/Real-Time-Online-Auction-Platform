import express from 'express';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/auctions — list with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      q, category, condition, status = 'active',
      minBid, maxBid, sort = 'endTime',
      page = 1, limit = 12,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (q) filter.$text = { $search: q };
    if (minBid || maxBid) {
      filter.currentBid = {};
      if (minBid) filter.currentBid.$gte = Number(minBid);
      if (maxBid) filter.currentBid.$lte = Number(maxBid);
    }

    const sortOptions = {
      endTime: { endTime: 1 },
      newest: { createdAt: -1 },
      highestBid: { currentBid: -1 },
      mostBids: { bidCount: -1 },
    };

    const total = await Auction.countDocuments(filter);
    const auctions = await Auction.find(filter)
      .populate('seller', 'name avatar rating')
      .sort(sortOptions[sort] || { endTime: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ auctions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auctions/featured
router.get('/featured', async (_req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active', endTime: { $gt: new Date() } })
      .populate('seller', 'name avatar rating')
      .sort({ bidCount: -1, views: -1 })
      .limit(8);
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auctions/ending-soon
router.get('/ending-soon', async (_req, res) => {
  try {
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const auctions = await Auction.find({ status: 'active', endTime: { $gt: new Date(), $lt: soon } })
      .populate('seller', 'name avatar rating')
      .sort({ endTime: 1 })
      .limit(8);
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auctions/stats/global
router.get('/stats/global', async (_req, res) => {
  try {
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const registeredUsers = await User.countDocuments();
    const itemsSoldAlt = await Auction.countDocuments({ status: { $in: ['sold', 'ended'] }, currentBid: { $gt: 0 }, bidCount: { $gt: 0 } });

    const usersWithRatings = await User.find({ rating: { $gt: 0 } });
    const sumRatings = usersWithRatings.reduce((sum, u) => sum + u.rating, 0);
    const avgRating = usersWithRatings.length > 0 ? (sumRatings / usersWithRatings.length).toFixed(1) : "0.0";

    res.json({
      activeAuctions: activeAuctions > 0 ? `${activeAuctions}+` : '0',
      registeredUsers: registeredUsers > 0 ? `${registeredUsers}+` : '0',
      itemsSold: itemsSoldAlt > 0 ? `${itemsSoldAlt}+` : '0',
      avgRating: `${avgRating} ★`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name avatar rating ratingCount location createdAt')
      .populate('currentBidder', 'name avatar')
      .populate('winner', '_id name');

    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    await auction.checkAndEnd();
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auctions — create
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, condition, startingBid, reservePrice, endTime, images, location, tags } = req.body;
    const auction = await Auction.create({
      title, description, category, condition,
      startingBid: Number(startingBid),
      currentBid: Number(startingBid),
      reservePrice: reservePrice ? Number(reservePrice) : null,
      endTime: new Date(endTime),
      images: images || [],
      location: location || 'Sri Lanka',
      tags: tags || [],
      seller: req.user._id,
    });
    await auction.populate('seller', 'name avatar rating');
    res.status(201).json(auction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/auctions/:id — update (seller only)
router.put('/:id', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (auction.bidCount > 0)
      return res.status(400).json({ message: 'Cannot edit auction with bids' });

    Object.assign(auction, req.body);
    await auction.save();
    res.json(auction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/auctions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.seller.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not authorized' });
    await auction.deleteOne();
    res.json({ message: 'Auction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
