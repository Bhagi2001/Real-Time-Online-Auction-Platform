import express from 'express';
import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeListings = await Auction.countDocuments({ seller: req.params.id, status: 'active' });
    const reviews = await Review.find({ seller: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ ...user.toJSON(), activeListings, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, phone, location, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, phone, location, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/users/password — change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/dashboard/stats — dashboard stats
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [activeBids, wonAuctions, sellingAuctions, totalBidsPlaced] = await Promise.all([
      Bid.countDocuments({ bidder: userId, isWinning: true }),
      Auction.countDocuments({ winner: userId, status: 'ended' }),
      Auction.countDocuments({ seller: userId, status: 'active' }),
      Bid.countDocuments({ bidder: userId }),
    ]);

    const myListings = await Auction.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('currentBidder', 'name');

    const myBids = await Bid.find({ bidder: userId, isWinning: true })
      .populate({ path: 'auction', populate: { path: 'seller', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ activeBids, wonAuctions, sellingAuctions, totalBidsPlaced, myListings, myBids });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/review — post a review
router.post('/review', protect, async (req, res) => {
  try {
    const { sellerId, auctionId, rating, comment } = req.body;
    const existing = await Review.findOne({ reviewer: req.user._id, auction: auctionId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this transaction' });

    const review = await Review.create({
      reviewer: req.user._id, seller: sellerId, auction: auctionId, rating, comment,
    });

    // Update seller rating
    const allReviews = await Review.find({ seller: sellerId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(sellerId, { rating: Math.round(avg * 10) / 10, ratingCount: allReviews.length });

    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
