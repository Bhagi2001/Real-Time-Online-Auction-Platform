import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['bid_placed', 'bid_outbid', 'auction_won', 'auction_ended', 'auction_ending_soon', 'new_message', 'review_received', 'watchlist_update'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: null },
  read: { type: Boolean, default: false },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
