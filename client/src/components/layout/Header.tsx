import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gavel, Bell, User, Search, Menu, ChevronDown, LogOut, Settings, LayoutDashboard, Heart, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI, categoriesAPI } from '../../api';
import { Button } from '../ui/Button';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Vehicles', 'Collectibles', 'Art', 'Sports', 'Books', 'Jewelry', 'Toys'];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setCatMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    categoriesAPI.getAll().then(data => setCategories(data)).catch(() => { });
    const fetchUnread = () => {
      if (user) {
        notificationsAPI.get(1).then(data => setUnreadCount(data.unreadCount || 0)).catch(() => { });
      }
    };
    fetchUnread();

    // Listen for custom event when notifications are read on the Notifications page
    window.addEventListener('notificationsRead', fetchUnread);
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      window.removeEventListener('notificationsRead', fetchUnread);
      clearInterval(interval);
    };
  }, [user, location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/auctions?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/favicon.png" alt="BidLanka" className="w-9 h-9 object-contain" />
            <span className="text-xl font-extrabold text-secondary">Bid<span className="text-primary">Lanka</span></span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
                id="header-search"
                aria-label="Search auctions"
              />
            </div>
          </form>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-10 mx-10">
            <Link to="/auctions" className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all">
              Browse
            </Link>

            {/* Categories dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setCatMenuOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all"
                aria-expanded={catMenuOpen}
              >
                Categories <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {catMenuOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-56 animate-slide-up z-50">
                  {categories.slice(0, 10).map(cat => (
                    <Link key={cat._id} to={`/auctions?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setCatMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            <Link to="/auctions/create"
              className="hidden md:flex btn-primary text-sm px-4 py-2 rounded-xl">
              <Package size={15} /> Sell Item
            </Link>

            {user ? (
              <>
                <Link to="/notifications"
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Notifications">
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    aria-expanded={userMenuOpen} aria-label="User menu">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF6B35&color=fff`}
                      alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    <ChevronDown size={14} className={`text-gray-500 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-52 animate-slide-up z-50">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {[
                        { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
                        { to: '/profile/' + user.id, icon: <User size={15} />, label: 'Profile' },
                        { to: '/watchlist', icon: <Heart size={15} />, label: 'Watchlist' },
                        { to: '/settings', icon: <Settings size={15} />, label: 'Settings' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 border-t border-gray-100 pt-2">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">Join Free</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-1">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="search" placeholder="Search auctions..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </form>
            <Link to="/auctions" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary rounded-xl hover:bg-primary/5">Browse Auctions</Link>
            <Link to="/auctions/create" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-primary bg-primary/5 rounded-xl">Sell an Item</Link>
            {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary rounded-xl hover:bg-primary/5">Dashboard</Link>}
          </div>
        )}
      </div>
    </header>
  );
};
