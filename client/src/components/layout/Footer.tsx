import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="bg-secondary text-gray-300">
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Gavel size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">Bid<span className="text-primary">Lanka</span></span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400 mb-4">
            Sri Lanka's premier online auction marketplace. Buy and sell with confidence through real-time bidding.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" aria-label="Social media">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/auctions', label: 'Browse Auctions' },
              { to: '/auctions/create', label: 'Sell an Item' },
              { to: '/auctions?sort=endTime', label: 'Ending Soon' },
              { to: '/auctions?sort=newest', label: 'Just Listed' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-primary transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/help', label: 'Help Center' },
              { to: '/how-it-works', label: 'How Bidding Works' },
              { to: '/seller-guide', label: 'Seller Guide' },
              { to: '/buyer-protection', label: 'Buyer Protection' },
              { to: '/report', label: 'Report an Issue' },
            ].map(link => (
              <li key={link.label}>
                <Link to={link.to} className="hover:text-primary transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><MapPin size={14} className="text-primary flex-shrink-0" /> Colombo, Sri Lanka</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-primary flex-shrink-0" /> +94 11 234 5678</li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-primary flex-shrink-0" /> support@bidlanka.lk</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} BidLanka. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);
