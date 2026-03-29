import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Gavel } from 'lucide-react';
import { useCountdown } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { watchlistAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';

export interface AuctionCardData {
  _id: string;
  title: string;
  images: string[];
  category: string;
  condition: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endTime: string;
  status: string;
  seller: { name: string; avatar?: string; rating?: number };
  location?: string;
}

interface AuctionCardProps {
  auction: AuctionCardData;
  onWatchlistChange?: () => void;
}

const formatLKR = (n: number) => `LKR ${n.toLocaleString()}`;

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onWatchlistChange }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const timeLeft = useCountdown(auction.endTime);
  const [isWatched, setIsWatched] = React.useState(false);
  
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600000; // < 1 hour
  const isEnded = timeLeft.total <= 0 || auction.status !== 'active';

  React.useEffect(() => {
    if (user && auction._id) {
      watchlistAPI.check(auction._id)
        .then(r => setIsWatched(r.inWatchlist))
        .catch(() => {});
    }
  }, [user, auction._id]);

  const imgSrc = auction.images?.[0]
    ? (auction.images[0].startsWith('http') ? auction.images[0] : `http://localhost:5000${auction.images[0]}`)
    : `https://source.unsplash.com/400x300/?auction,${encodeURIComponent(auction.category)}`;

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { 
      addToast('info', 'Sign in required', 'Please log in to save items to your watchlist'); 
      return; 
    }
    
    try {
      if (isWatched) {
        await watchlistAPI.remove(auction._id);
        setIsWatched(false);
        addToast('info', 'Removed from watchlist');
      } else {
        await watchlistAPI.add(auction._id);
        setIsWatched(true);
        addToast('success', 'Added to watchlist!');
      }
      onWatchlistChange?.();
    } catch {
      addToast('error', 'Something went wrong');
    }
  };

  const timeDisplay = isEnded
    ? 'Ended'
    : timeLeft.days > 0
    ? `${timeLeft.days}d ${timeLeft.hours}h`
    : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  return (
    <Link to={`/auctions/${auction._id}`} className="group block">
      <div className="card overflow-hidden hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
          <img
            src={imgSrc}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-card-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="badge bg-white/90 backdrop-blur-sm text-secondary text-xs font-semibold shadow-sm">
              {auction.category}
            </span>
          </div>

          {/* Timer */}
          <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm ${
            isEnded ? 'bg-gray-500/90 text-white' : isUrgent ? 'bg-red-500/90 text-white animate-pulse' : 'bg-secondary/90 text-white'
          }`}>
            <Clock size={11} />
            {timeDisplay}
          </div>

          {/* Watchlist button */}
          <button
            onClick={handleWatchlist}
            className={`absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${
              isWatched 
                ? 'text-red-500 opacity-100' 
                : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
            }`}
            aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Heart size={16} className={isWatched ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {auction.title}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Current bid</p>
              <p className="text-lg font-bold text-primary">{formatLKR(auction.currentBid || auction.startingBid)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                <Gavel size={12} />
                <span>{auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{auction.seller?.name}</p>
            </div>
          </div>

          {/* Condition pill */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`badge text-xs ${
              auction.condition === 'Brand New' ? 'bg-green-50 text-green-700' :
              auction.condition === 'Like New' ? 'bg-blue-50 text-blue-700' :
              'bg-gray-50 text-gray-600'
            }`}>
              {auction.condition}
            </span>
            {auction.location && (
              <span className="text-xs text-gray-400 truncate">{auction.location}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Skeleton loader
export const AuctionCardSkeleton: React.FC = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] skeleton" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex justify-between">
        <div className="skeleton h-6 w-1/3 rounded" />
        <div className="skeleton h-4 w-1/4 rounded" />
      </div>
    </div>
  </div>
);
