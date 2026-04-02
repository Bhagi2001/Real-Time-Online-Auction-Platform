import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Package, MessageSquare } from 'lucide-react';
import { usersAPI, auctionsAPI } from '../api';
import { AuctionCard, AuctionCardData } from '../components/auction/AuctionCard';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  _id: string; name: string; email: string; avatar?: string; avatarUrl?: string;
  bio: string; location: string; rating: number; ratingCount: number;
  totalSales: number; totalBids: number; totalWins: number;
  createdAt: string; activeListings: number;
  reviews: { _id: string; reviewer: { name: string; avatar?: string }; rating: number; comment: string; createdAt: string }[];
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<AuctionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      usersAPI.getProfile(id),
      auctionsAPI.getAll({ seller: id, status: 'active' }),
    ]).then(([profileData, auctionsData]) => {
      setProfile(profileData);
      setListings(auctionsData.auctions || []);
      document.title = `${profileData.name} — BidLanka`;
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="skeleton h-48 rounded-2xl mb-4" />
      <div className="skeleton h-8 w-1/3 rounded mb-2" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  );

  if (!profile) return null;

  const avatarUrl = profile.avatarUrl || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF6B35&color=fff&size=128`;
  const isOwnProfile = user?.id === profile._id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img src={avatarUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-secondary">{profile.name}</h1>
            {profile.location && (
              <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} />{profile.location}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} className={i < Math.round(profile.rating) ? 'text-accent fill-current' : 'text-gray-200 fill-current'} />
              ))}
              <span className="text-sm text-gray-500 ml-1">{profile.rating.toFixed(1)} ({profile.ratingCount} reviews)</span>
            </div>
            {profile.bio && <p className="text-gray-600 text-sm mt-2 max-w-lg">{profile.bio}</p>}
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Calendar size={12} />Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
          </div>
          <div className="flex gap-3">
            {!isOwnProfile && (
              <Link to={`/messages?userId=${profile._id}`}
                className="flex items-center gap-2 btn-outline text-sm px-4 py-2">
                <MessageSquare size={15} /> Message
              </Link>
            )}
            {isOwnProfile && (
              <Link to="/settings" className="btn-secondary text-sm px-4 py-2 rounded-xl">Edit Profile</Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: 'Active Listings', value: profile.activeListings },
            { label: 'Total Sales', value: profile.totalSales },
            { label: 'Bids Placed', value: profile.totalBids },
            { label: 'Auctions Won', value: profile.totalWins },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-secondary">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {([
          { key: 'listings', label: `Listings (${listings.length})`, icon: <Package size={15} /> },
          { key: 'reviews', label: `Reviews (${profile.reviews?.length || 0})`, icon: <Star size={15} /> },
        ] as { key: 'listings' | 'reviews'; label: string; icon: React.ReactNode }[]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'listings' && (
        listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No active listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(a => <AuctionCard key={a._id} auction={a} />)}
          </div>
        )
      )}

      {activeTab === 'reviews' && (
        profile.reviews?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.reviews?.map(review => (
              <div key={review._id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img src={review.reviewer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer.name)}&background=FF6B35&color=fff`}
                    alt={review.reviewer.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{review.reviewer.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'text-accent fill-current' : 'text-gray-200 fill-current'} />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
