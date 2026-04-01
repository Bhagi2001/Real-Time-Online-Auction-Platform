import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Eye, Heart, Share2, ChevronRight, User, Calendar, Clock, Send } from 'lucide-react';
import { auctionsAPI, watchlistAPI, usersAPI } from '../api';
import { ImageCarousel } from '../components/auction/ImageCarousel';
import { CountdownTimer } from '../components/auction/CountdownTimer';
import { BidHistory } from '../components/auction/BidHistory';
import { BidForm } from '../components/auction/BidForm';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow, format } from 'date-fns';

interface Auction {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  seller: { _id: string; name: string; avatar?: string; avatarUrl?: string; rating: number; ratingCount: number; location: string; createdAt: string };
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: string;
  location: string;
  views: number;
  watchCount: number;
  reservePrice?: number;
  tags?: string[];
  currentBidder?: { name: string };
  winner?: { _id: string; name: string };
}

const formatLKR = (n: number) => `LKR ${n.toLocaleString()}`;

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [liveBid, setLiveBid] = useState<unknown>(undefined);
  const [activeTab, setActiveTab] = useState<'description' | 'bids'>('description');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    document.title = 'Loading... — BidLanka';
    auctionsAPI.getById(id).then(data => {
      setAuction(data);
      document.title = `${data.title} — BidLanka`;
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/auctions'); });

    if (user) {
      watchlistAPI.check(id).then(r => setInWatchlist(r.inWatchlist)).catch(() => {});
    }
  }, [id, user, navigate]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_auction', id);
    socket.on('new_bid', (data: { bid: unknown; currentBid: number; bidCount: number }) => {
      setAuction(prev => prev ? { ...prev, currentBid: data.currentBid, bidCount: data.bidCount } : prev);
      setLiveBid(data.bid);
    });
    return () => { socket.off('new_bid'); socket.emit('leave_auction', id); };
  }, [socket, id]);

  const toggleWatchlist = async () => {
    if (!user) { addToast('info', 'Sign in required'); return; }
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(id!);
        setInWatchlist(false);
        setAuction(prev => prev ? { ...prev, watchCount: Math.max(0, prev.watchCount - 1) } : prev);
        addToast('info', 'Removed from watchlist');
      } else {
        await watchlistAPI.add(id!);
        setInWatchlist(true);
        setAuction(prev => prev ? { ...prev, watchCount: prev.watchCount + 1 } : prev);
        addToast('success', 'Added to watchlist!');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast('error', message || 'Something went wrong');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('success', 'Link copied!', 'Share this auction with friends');
  };

  const handleBidPlaced = useCallback((_bid: unknown, currentBid: number, bidCount: number) => {
    setAuction(prev => prev ? { ...prev, currentBid, bidCount } : prev);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return addToast('error', 'Please select a star rating');
    try {
      await usersAPI.postReview({ sellerId: auction!.seller._id, auctionId: auction!._id, rating, comment });
      setReviewSubmitted(true);
      addToast('success', 'Review submitted successfully!');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to submit review');
      if (err?.response?.data?.message?.includes('already')) setReviewSubmitted(true);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton aspect-[4/3] rounded-2xl" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );

  if (!auction) return null;

  const isActive = auction.status === 'active' && new Date(auction.endTime) > new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/auctions" className="hover:text-primary transition-colors">Auctions</Link>
        <ChevronRight size={14} />
        <Link to={`/auctions?category=${encodeURIComponent(auction.category)}`} className="hover:text-primary transition-colors">{auction.category}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium truncate max-w-xs">{auction.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          <ImageCarousel images={auction.images} title={auction.title} />

          {/* Title area */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="badge bg-primary/10 text-primary">{auction.category}</span>
                <span className={`badge ${auction.condition === 'Brand New' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {auction.condition}
                </span>
                {!isActive && <span className="badge bg-red-100 text-red-600">Ended</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-secondary leading-tight">{auction.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                {auction.location && <span className="flex items-center gap-1"><MapPin size={14} />{auction.location}</span>}
                <span className="flex items-center gap-1"><Eye size={14} />{auction.views} views</span>
                <span className="flex items-center gap-1"><Heart size={14} />{auction.watchCount} watching</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={toggleWatchlist} aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                className={`p-2.5 rounded-xl border transition-all ${inWatchlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'}`}>
                <Heart size={18} className={inWatchlist ? 'fill-current' : ''} />
              </button>
              <button onClick={handleShare} aria-label="Share"
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex gap-6">
              {(['description', 'bids'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'bids' ? `Bid History (${auction.bidCount})` : 'Description'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'description' ? (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
              {auction.tags && auction.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 not-prose">
                  {auction.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="mt-6 grid grid-cols-2 gap-4 not-prose">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Listed</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {format(new Date(auction.endTime), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Ends</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {format(new Date(auction.endTime), 'MMM d · h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <BidHistory auctionId={auction._id} liveUpdate={liveBid as { _id: string; bidder: { name: string; avatar?: string }; amount: number; createdAt: string; isWinning?: boolean } | undefined} />
          )}

          {/* Seller card */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">About the Seller</h3>
            <div className="flex items-center gap-4">
              <Link to={`/profile/${auction.seller._id}`}>
                <img
                  src={auction.seller.avatarUrl || auction.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auction.seller.name)}&background=FF6B35&color=fff`}
                  alt={auction.seller.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/profile/${auction.seller._id}`} className="font-bold text-secondary hover:text-primary transition-colors">
                  {auction.seller.name}
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < Math.round(auction.seller.rating) ? 'text-accent fill-current' : 'text-gray-200 fill-current'} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({auction.seller.ratingCount} reviews)</span>
                </div>
                {auction.seller.location && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={11} />{auction.seller.location}</p>
                )}
              </div>
              <Link to={`/messages?userId=${auction.seller._id}`}
                className="text-sm font-medium text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                Contact
              </Link>
            </div>

            {/* Rate Seller */}
            {user && auction.seller._id !== user.id && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2">Rate this Seller</h4>
                {reviewSubmitted ? (
                  <div className="bg-success/10 text-success font-medium p-4 rounded-xl text-center text-sm">
                    Thank you for reviewing {auction.seller.name}!
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    <p className="text-sm text-gray-500 mb-3">How was your trading experience?</p>
                    
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} type="button"
                          className="transition-transform hover:scale-110 focus:outline-none"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star 
                            size={24} 
                            className={(hoverRating || rating) >= star ? 'fill-accent text-accent' : 'text-gray-300'} 
                          />
                        </button>
                      ))}
                    </div>

                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Leave a comment (optional)..."
                      className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
                      rows={2}
                    />

                    <button type="submit" className="btn-primary w-full py-2 text-sm">
                      Submit Review <Send size={14} className="ml-2 inline" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Bid panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Current bid */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Place Your Bid</h2>
                <span className={`badge ${isActive ? 'badge-active' : 'badge-ended'}`}>
                  {isActive ? 'Live' : 'Ended'}
                </span>
              </div>

              {/* Countdown */}
              {isActive && (
                <div className="mb-5">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} />Time remaining</p>
                  <CountdownTimer endTime={auction.endTime} size="md" />
                </div>
              )}

              <BidForm
                auctionId={auction._id}
                currentBid={auction.currentBid}
                startingBid={auction.startingBid}
                sellerId={auction.seller._id}
                isActive={isActive}
                onBidPlaced={handleBidPlaced}
              />
            </div>

            {/* Auction stats */}
            <div className="card p-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-secondary">{auction.bidCount}</p>
                <p className="text-xs text-gray-400">Total Bids</p>
              </div>
              <div>
                <p className="text-xl font-bold text-secondary">{auction.watchCount}</p>
                <p className="text-xs text-gray-400">Watching</p>
              </div>
              <div>
                <p className="text-xl font-bold text-secondary">{formatLKR(auction.startingBid)}</p>
                <p className="text-xs text-gray-400">Starting Bid</p>
              </div>
              <div>
                <p className="text-xl font-bold text-secondary">{auction.views}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
