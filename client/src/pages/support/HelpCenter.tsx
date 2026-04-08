import React from 'react';
import { HelpCircle, Search, Mail, Book } from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">Help Center</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Find answers to your questions and learn how to get the most out of BidLanka.
        </p>
        <div className="max-w-xl mx-auto mt-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, or FAQs..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="card p-8 text-center hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Book className="text-primary" size={28} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">Getting Started</h3>
          <p className="text-gray-500 text-sm">Learn the basics of creating an account, bidding, and setting up your seller profile.</p>
        </div>

        <div className="card p-8 text-center hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="text-success" size={28} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">FAQs</h3>
          <p className="text-gray-500 text-sm">Browse through our most frequently asked questions from buyers and sellers.</p>
        </div>

        <div className="card p-8 text-center hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="text-accent" size={28} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">Contact Support</h3>
          <p className="text-gray-500 text-sm">Can't find what you're looking for? Our support team is here to help you out.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
