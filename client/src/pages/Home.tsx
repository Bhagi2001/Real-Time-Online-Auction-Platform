import React, { useEffect, useState } from 'react';
import heroVideo from '../assets/BB.mp4';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, Star, Gavel, TrendingUp, Clock, Tag } from 'lucide-react';
import { AuctionCard, AuctionCardSkeleton, AuctionCardData } from '../components/auction/AuctionCard';
import { auctionsAPI, categoriesAPI } from '../api';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'];



const Home: React.FC = () => {
  const [featured, setFeatured] = useState<AuctionCardData[]>([]);
  const [endingSoon, setEndingSoon] = useState<AuctionCardData[]>([]);
  const [categories, setCategories] = useState<{ _id: string, name: string, icon: string }[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingEnding, setLoadingEnding] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    activeAuctions: '0', registeredUsers: '0', itemsSold: '0', avgRating: '0.0 ★'
  });

  useEffect(() => {
    document.title = 'BidLanka — Sri Lanka\'s Premier Auction Platform';
    auctionsAPI.getFeatured().then(data => { setFeatured(data); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    auctionsAPI.getEndingSoon().then(data => { setEndingSoon(data); setLoadingEnding(false); }).catch(() => setLoadingEnding(false));
    categoriesAPI.getAll().then(data => setCategories(data)).catch(() => { });
    auctionsAPI.getGlobalStats().then(data => setGlobalStats(data)).catch(() => { });
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative bg-hero-gradient overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Video Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* Gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/40 to-surface" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent opacity-60" />
        </div>

        <div className="w-full px-6 lg:px-20 xl:px-32 py-20 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Sri Lanka's #1 Online Auction Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              Bid. Win.{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Celebrate.
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              Discover unique items, place real-time bids, and win amazing deals from sellers across Sri Lanka.
              Your next treasure is just one bid away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auctions" id="hero-browse-btn"
                className="btn-primary text-lg inline-flex items-center gap-2 group">
                Start Bidding <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/auctions/create" id="hero-sell-btn"
                className="btn-outline border-white text-white hover:bg-white hover:text-secondary text-lg inline-flex items-center gap-2">
                Sell an Item
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { icon: <Shield size={16} />, text: 'Buyer Protection' },
                { icon: <Zap size={16} />, text: 'Real-time Bidding' },
                { icon: <Star size={16} />, text: 'Verified Sellers' },
              ].map(badge => (
                <div key={badge.text} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-accent">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>


      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Auctions', value: globalStats.activeAuctions, icon: <Gavel className="text-primary" size={24} /> },
              { label: 'Registered Users', value: globalStats.registeredUsers, icon: <Globe className="text-accent" size={24} /> },
              { label: 'Items Sold', value: globalStats.itemsSold, icon: <TrendingUp className="text-success" size={24} /> },
              { label: 'Avg. Rating', value: globalStats.avgRating, icon: <Star className="text-yellow-400" size={24} /> },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-2xl font-extrabold text-secondary">{s.value}</p>
                <p className="text-gray-400 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED AUCTIONS ===== */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">🔥 Featured Auctions</h2>
              <p className="section-subheading">Hand-picked auctions with the hottest bids right now</p>
            </div>
            <Link to="/auctions?sort=highestBid" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => <AuctionCardSkeleton key={i} />)
              : featured.length === 0
                ? <EmptyState message="No featured auctions at the moment" />
                : featured.map(a => <AuctionCard key={a._id} auction={a} />)
            }
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="section-heading">Browse by Category</h2>
            <p className="section-subheading">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat, i) => {
              const staticColors = ['from-blue-500 to-blue-600', 'from-pink-500 to-rose-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-green-600', 'from-purple-500 to-violet-600', 'from-cyan-500 to-teal-600', 'from-lime-500 to-green-500', 'from-orange-500 to-red-500'];
              return (
                <Link key={cat._id} to={`/auctions?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${staticColors[i % 8]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {cat.icon ? <span className="text-2xl">{cat.icon}</span> : <Tag size={20} />}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ENDING SOON ===== */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">⏱️ Ending Soon</h2>
              <p className="section-subheading">Don't miss these closing auctions</p>
            </div>
            <Link to="/auctions?sort=endTime" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingEnding
              ? Array.from({ length: 4 }).map((_, i) => <AuctionCardSkeleton key={i} />)
              : endingSoon.length === 0
                ? <EmptyState message="No auctions ending soon" />
                : endingSoon.map(a => <AuctionCard key={a._id} auction={a} />)
            }
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Ready to start selling?
          </h2>
          <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
            List your items in minutes and reach thousands of buyers across Sri Lanka. It's free to get started!
          </p>
          <Link to="/register" id="cta-sell-btn"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full text-center py-16 text-gray-400">
    <Gavel size={48} className="mx-auto mb-4 opacity-30" />
    <p className="font-medium">{message}</p>
    <Link to="/auctions/create" className="text-primary font-semibold hover:underline mt-2 inline-block">List the first one →</Link>
  </div>
);

export default Home;
