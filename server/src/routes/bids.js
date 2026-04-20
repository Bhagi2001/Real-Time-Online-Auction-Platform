import express from 'express';
import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/bids/auction/:auctionId — bid history
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bids — place a bid
router.post('/', protect, async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    const auction = await Auction.findById(auctionId).populate('seller');

    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (new Date() > auction.endTime) return res.status(400).json({ message: 'Auction has ended' });
    if (auction.seller._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Sellers cannot bid on their own auctions' });

    const minBid = auction.currentBid > 0 ? auction.currentBid + 1 : auction.startingBid;
    if (Number(amount) < minBid)
      return res.status(400).json({ message: `Bid must be at least LKR ${minBid}` });

    // Mark previous winning bid as not winning
    await Bid.updateMany({ auction: auctionId, isWinning: true }, { isWinning: false });

    const previousBidder = auction.currentBidder;

    // Create new bid
    const bid = await Bid.create({
      auction: auctionId,
      bidder: req.user._id,
      amount: Number(amount),
      isWinning: true,
    });

    // Update auction
    auction.currentBid = Number(amount);
    auction.currentBidder = req.user._id;
    auction.bidCount += 1;
    await auction.save();

    await bid.populate('bidder', 'name avatar');

    // Create notifications
    // Notify seller of new bid
    await Notification.create({
      user: auction.seller._id,
      type: 'bid_placed',
      title: 'New bid on your auction',
      message: `${req.user.name} placed a bid of LKR ${Number(amount).toLocaleString()} on "${auction.title}"`,
      link: `/auctions/${auctionId}`,
      auction: auctionId,
    });

    // Notify outbid user
    if (previousBidder && previousBidder.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: previousBidder,
        type: 'bid_outbid',
        title: 'You have been outbid!',
        message: `Someone placed a higher bid on "${auction.title}". Current bid: LKR ${Number(amount).toLocaleString()}`,
        link: `/auctions/${auctionId}`,
        auction: auctionId,
      });
    }

    // Emit socket event
    if (req.io) {
      req.io.to(`auction_${auctionId}`).emit('new_bid', {
        bid: { ...bid.toJSON(), bidder: { name: req.user.name, avatar: req.user.avatarUrl } },
        currentBid: Number(amount),
        bidCount: auction.bidCount,
      });
    }

    res.status(201).json({ bid, currentBid: auction.currentBid, bidCount: auction.bidCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bids/user — user's bid history
router.get('/user', protect, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({ path: 'auction', populate: { path: 'seller', select: 'name avatar' } })
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
