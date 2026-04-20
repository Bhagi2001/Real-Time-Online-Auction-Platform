import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { Search, MapPin, ExternalLink, Check, Trash2, StopCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const Auctions: React.FC = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'Auction Management — BidLanka Admin';
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const data = await adminAPI.getAuctions();
      setAuctions(data);
    } catch (err) {
      addToast('error', 'Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await adminAPI.updateAuctionStatus(id, newStatus);
      setAuctions(prev => prev.map(a => a._id === id ? updated : a));
      addToast('success', `Auction status changed to ${newStatus}`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update auction status');
    }
  };

  const filtered = auctions.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    (a.seller && a.seller.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auction Listings</h1>
          <p className="text-sm text-slate-500">Monitor and moderate all active marketplace listings.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title or seller..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Bids / Price</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading listings...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No auctions found.</td>
                </tr>
              ) : filtered.map(auction => (
                <tr key={auction._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                         {auction.images?.[0] && <img src={auction.images[0]} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <Link to={`/auctions/${auction._id}`} target="_blank" className="font-semibold text-slate-900 hover:text-primary flex items-center gap-1">
                          {auction.title.length > 25 ? auction.title.substring(0, 25) + '...' : auction.title}
                          <ExternalLink size={12} className="text-slate-400" />
                        </Link>
                        <p className="text-xs text-slate-500">{auction.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {auction.seller?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">LKR {auction.currentBid?.toLocaleString() || auction.startingBid?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{auction.bidCount} bids placed</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{formatDistanceToNow(new Date(auction.endTime), { addSuffix: true })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                      ${auction.status === 'active' ? 'bg-emerald-50 text-emerald-600' : ''}
                      ${auction.status === 'ended' ? 'bg-slate-100 text-slate-600' : ''}
                      ${auction.status === 'suspended' ? 'bg-red-50 text-red-600' : ''}
                    `}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {auction.status === 'active' && (
                         <button 
                           onClick={() => handleStatusChange(auction._id, 'suspended')}
                           className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors group relative"
                         >
                           <StopCircle size={16} />
                           <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Suspend Listing</span>
                         </button>
                       )}
                       {auction.status === 'suspended' && (
                         <button 
                           onClick={() => handleStatusChange(auction._id, 'active')}
                           className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors group relative"
                         >
                           <Check size={16} />
                           <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Reactivate Listing</span>
                         </button>
                       )}
                       <button 
                         className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors group relative"
                         onClick={() => confirm('This will permanently hide the auction from DB (if implemented in backend deletion endpoint). Currently just suspends it.') && handleStatusChange(auction._id, 'suspended')}
                       >
                         <Trash2 size={16} />
                         <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Delete Listing</span>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auctions;
