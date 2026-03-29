import React, { useState, useEffect } from 'react';
import { bidsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Gavel, User, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Bid {
  _id: string;
  bidder: { name: string; avatar?: string };
  amount: number;
  createdAt: string;
  isWinning?: boolean;
}

interface BidHistoryProps {
  auctionId: string;
  liveUpdate?: Bid;
}

const formatLKR = (n: number) => `LKR ${n.toLocaleString()}`;

export const BidHistory: React.FC<BidHistoryProps> = ({ auctionId, liveUpdate }) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    bidsAPI.getByAuction(auctionId)
      .then(data => { setBids(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [auctionId]);

  useEffect(() => {
    if (liveUpdate) {
      setBids(prev => [liveUpdate, ...prev.map(b => ({ ...b, isWinning: false }))]);
    }
  }, [liveUpdate]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
    </div>
  );

  if (bids.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <Gavel size={32} className="mx-auto mb-2 opacity-40" />
      <p className="font-medium">No bids yet</p>
      <p className="text-sm">Be the first to bid!</p>
    </div>
  );

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {bids.map((bid, idx) => (
        <div
          key={bid._id}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            idx === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            {bid.bidder?.avatar
              ? <img src={bid.bidder.avatar} className="w-8 h-8 rounded-full object-cover" alt={bid.bidder.name} />
              : <User size={16} className="text-white" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name === bid.bidder?.name ? 'You' : bid.bidder?.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-sm ${idx === 0 ? 'text-primary' : 'text-gray-700'}`}>
              {formatLKR(bid.amount)}
            </p>
            {idx === 0 && (
              <span className="text-[10px] text-primary flex items-center gap-0.5 justify-end">
                <TrendingUp size={10} /> Highest
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
