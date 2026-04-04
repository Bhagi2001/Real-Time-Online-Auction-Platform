import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      {/* Animated icon */}
      <div className="relative inline-block mb-8">
        <div className="text-[120px] font-extrabold text-gray-100 select-none leading-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-primary animate-bounce">
            <Gavel size={36} className="text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-secondary mb-3">Auction Not Found</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">
        The page you're looking for has been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary gap-2 inline-flex">
          <ArrowLeft size={16} /> Go Home
        </Link>
        <Link to="/auctions" className="btn-outline gap-2 inline-flex">
          <Search size={16} /> Browse Auctions
        </Link>
      </div>

      {/* Suggestions */}
      <div className="mt-12 text-sm text-gray-400">
        <p className="font-medium mb-3">You might be looking for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Electronics', 'Vehicles', 'Fashion', 'Art'].map(cat => (
            <Link key={cat} to={`/auctions?category=${cat}`}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default NotFound;
