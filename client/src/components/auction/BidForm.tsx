import React, { useState } from 'react';
import { Gavel, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { bidsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  startingBid: number;
  sellerId: string;
  isActive: boolean;
  onBidPlaced?: (bid: unknown, currentBid: number, bidCount: number) => void;
}

const formatLKR = (n: number) => `LKR ${n.toLocaleString()}`;

export const BidForm: React.FC<BidFormProps> = ({
  auctionId, currentBid, startingBid, sellerId, isActive, onBidPlaced
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const minBid = (currentBid > 0 ? currentBid : startingBid) + 1;
  const [amount, setAmount] = useState(minBid);
  const [isLoading, setIsLoading] = useState(false);

  const isSeller = user?.id === sellerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (amount < minBid) { addToast('error', 'Bid too low', `Minimum bid is ${formatLKR(minBid)}`); return; }

    setIsLoading(true);
    try {
      const data = await bidsAPI.place(auctionId, amount);
      addToast('success', '🎉 Bid placed!', `Your bid of ${formatLKR(amount)} was placed successfully`);
      onBidPlaced?.(data.bid, data.currentBid, data.bidCount);
      setAmount(data.currentBid + 1);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to place bid';
      addToast('error', 'Bid failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <Gavel size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="font-semibold text-gray-500">This auction has ended</p>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-200">
        <p className="text-amber-700 font-medium">You cannot bid on your own auction</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <p className="text-sm text-gray-600 mb-1">Current highest bid</p>
        <p className="text-2xl font-bold text-primary">{formatLKR(currentBid || startingBid)}</p>
        <p className="text-xs text-gray-400 mt-1">Minimum next bid: {formatLKR(minBid)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your bid (LKR)</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={minBid}
            step={100}
            className="input-field text-lg font-bold pr-24"
            required
            id="bid-amount"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <button type="button" onClick={() => setAmount(a => Math.max(minBid, a - 100))}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">−</button>
            <button type="button" onClick={() => setAmount(a => a + 100)}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">+</button>
          </div>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2">
        {[500, 1000, 5000].map(inc => (
          <button key={inc} type="button"
            onClick={() => setAmount(minBid + inc)}
            className="flex-1 text-xs font-medium py-2 px-3 bg-gray-100 hover:bg-primary hover:text-white rounded-xl transition-all duration-200">
            +{inc.toLocaleString()}
          </button>
        ))}
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} className="gap-2 text-base">
        <Gavel size={18} />
        Place Bid — {formatLKR(amount)}
      </Button>

      {!user && (
        <p className="text-center text-xs text-gray-400">
          <button type="button" onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
            Sign in
          </button>{' '}to place a bid
        </p>
      )}
    </form>
  );
};
