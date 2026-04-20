import express from 'express';
import Watchlist from '../models/Watchlist.js';
import Auction from '../models/Auction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/watchlist
router.get('/', protect, async (req, res) => {
  try {
    const items = await Watchlist.find({ user: req.user._id })
      .populate({ path: 'auction', populate: { path: 'seller', select: 'name avatar rating' } })
      .sort({ createdAt: -1 });
    res.json(items.map(i => i.auction).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/watchlist/:auctionId
router.post('/:auctionId', protect, async (req, res) => {
  try {
    await Watchlist.create({ user: req.user._id, auction: req.params.auctionId });
    await require('../models/Auction.js').default.findByIdAndUpdate(req.params.auctionId, { $inc: { watchCount: 1 } });
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already in watchlist' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/watchlist/:auctionId
router.delete('/:auctionId', protect, async (req, res) => {
  try {
    const deleted = await Watchlist.findOneAndDelete({ user: req.user._id, auction: req.params.auctionId });
    if (deleted) {
      await Auction.findByIdAndUpdate(req.params.auctionId, { $inc: { watchCount: -1 } });
    }
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/watchlist/check/:auctionId
router.get('/check/:auctionId', protect, async (req, res) => {
  try {
    const item = await Watchlist.findOne({ user: req.user._id, auction: req.params.auctionId });
    res.json({ inWatchlist: !!item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
