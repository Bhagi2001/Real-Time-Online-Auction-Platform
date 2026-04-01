import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { watchlistAPI } from '../api';
import { AuctionCard, AuctionCardSkeleton, AuctionCardData } from '../components/auction/AuctionCard';
import { useToast } from '../contexts/ToastContext';

const Watchlist: React.FC = () => {
  const { addToast } = useToast();
  const [auctions, setAuctions] = useState<AuctionCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = () => {
    watchlistAPI.get()
      .then(data => { setAuctions(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Watchlist — BidLanka';
    fetchWatchlist();
  }, []);

  const removeFromWatchlist = async (auctionId: string) => {
    await watchlistAPI.remove(auctionId);
    setAuctions(prev => prev.filter(a => a._id !== auctionId));
    addToast('info', 'Removed from watchlist');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="skeleton h-10 w-48 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <AuctionCardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary flex items-center gap-3">
            <Heart className="text-primary" size={28} /> My Watchlist
          </h1>
          <p className="text-gray-400 mt-1">{auctions.length} saved {auctions.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link to="/auctions" className="btn-outline text-sm gap-2 hidden sm:flex">
          Browse Auctions <ArrowRight size={15} />
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-400 mb-6">Save items you're interested in to track them here</p>
          <Link to="/auctions" className="btn-primary gap-2 inline-flex">
            Browse Auctions <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map(a => (
            <div key={a._id} className="relative group">
              <AuctionCard auction={a} onWatchlistChange={fetchWatchlist} />
              <button
                onClick={() => removeFromWatchlist(a._id)}
                className="absolute top-3 left-3 z-10 p-1.5 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                aria-label="Remove from watchlist"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
