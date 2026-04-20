import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    enum: ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'],
  },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingBid: { type: Number, required: true, min: 0 },
  reservePrice: { type: Number, default: null },
  currentBid: { type: Number, default: 0 },
  currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bidCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended', 'cancelled', 'sold'],
    default: 'active',
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  location: { type: String, default: 'Sri Lanka' },
  views: { type: Number, default: 0 },
  watchCount: { type: Number, default: 0 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tags: [{ type: String }],
}, { timestamps: true });

// Index for search and filtering
auctionSchema.index({ title: 'text', description: 'text', tags: 'text' });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ seller: 1 });

// Virtual: is auction live
auctionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && this.endTime > new Date();
});

// Auto-end auctions
auctionSchema.methods.checkAndEnd = async function () {
  if (this.status === 'active' && this.endTime <= new Date()) {
    this.status = 'ended';
    if (this.currentBidder) this.winner = this.currentBidder;
    await this.save();
  }
};

auctionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Auction', auctionSchema);
