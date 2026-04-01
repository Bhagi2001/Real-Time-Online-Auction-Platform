import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, TrendingUp, Package, Trophy, BarChart2, Clock, ArrowRight } from 'lucide-react';
import { usersAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { AuctionCard, AuctionCardData } from '../components/auction/AuctionCard';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  activeBids: number;
  wonAuctions: number;
  sellingAuctions: number;
  totalBidsPlaced: number;
  myListings: AuctionCardData[];
  myBids: { _id: string; amount: number; createdAt: string; isWinning: boolean; auction: AuctionCardData }[];
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => (
  <div className={`card p-5 border-l-4 ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="opacity-70">{icon}</div>
      <span className="text-2xl font-extrabold text-secondary">{value}</span>
    </div>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'selling' | 'bidding' | 'won'>('selling');

  useEffect(() => {
    document.title = 'Dashboard — BidLanka';
    usersAPI.getDashboardStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/auctions/create" className="btn-primary gap-2 hidden sm:flex">
          <Package size={16} /> Create Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Gavel size={24} className="text-primary" />} label="Active Bids" value={stats?.activeBids || 0} color="border-l-primary" />
        <StatCard icon={<Trophy size={24} className="text-accent" />} label="Auctions Won" value={stats?.wonAuctions || 0} color="border-l-accent" />
        <StatCard icon={<Package size={24} className="text-success" />} label="Active Listings" value={stats?.sellingAuctions || 0} color="border-l-success" />
        <StatCard icon={<TrendingUp size={24} className="text-info" />} label="Total Bids Placed" value={stats?.totalBidsPlaced || 0} color="border-l-info" />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {([
            { key: 'selling', label: `My Listings (${stats?.myListings?.length || 0})`, icon: <Package size={15} /> },
            { key: 'bidding', label: `Active Bids (${stats?.myBids?.length || 0})`, icon: <Gavel size={15} /> },
            { key: 'won', label: 'Won Auctions', icon: <Trophy size={15} /> },
          ] as { key: 'selling' | 'bidding' | 'won'; label: string; icon: React.ReactNode }[]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'selling' && (
            <>
              {stats?.myListings?.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-semibold text-gray-400 mb-4">No active listings</p>
                  <Link to="/auctions/create" className="btn-primary gap-2 inline-flex">
                    <Package size={16} /> Create Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stats?.myListings?.map(a => <AuctionCard key={a._id} auction={a} />)}
                </div>
              )}
            </>
          )}

          {activeTab === 'bidding' && (
            <>
              {stats?.myBids?.length === 0 ? (
                <div className="text-center py-12">
                  <Gavel size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-semibold text-gray-400 mb-4">You haven't placed any bids yet</p>
                  <Link to="/auctions" className="btn-primary gap-2 inline-flex">Browse Auctions <ArrowRight size={16} /></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.myBids?.map(bid => (
                    <Link key={bid._id} to={`/auctions/${bid.auction._id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                      <img
                        src={bid.auction.images?.[0] ? (bid.auction.images[0].startsWith('http') ? bid.auction.images[0] : `http://localhost:5000${bid.auction.images[0]}`) : `https://source.unsplash.com/60x60/?product`}
                        alt={bid.auction.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{bid.auction.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">LKR {bid.amount.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${bid.isWinning ? 'text-success' : 'text-gray-400'}`}>
                          {bid.isWinning ? '✓ Winning' : 'Outbid'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'won' && (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="font-semibold text-gray-400">
                {stats?.wonAuctions === 0 ? 'No won auctions yet — keep bidding!' : `You've won ${stats?.wonAuctions} auction(s)!`}
              </p>
              <Link to="/auctions" className="btn-primary gap-2 inline-flex mt-4">Browse Auctions <ArrowRight size={16} /></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
