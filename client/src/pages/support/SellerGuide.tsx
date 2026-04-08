import React from 'react';
import { Tag, ShieldCheck, DollarSign } from 'lucide-react';

const SellerGuide: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">Seller Guide</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Turn your items into cash by setting up perfect listings on BidLanka.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="card p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Tag className="text-primary" size={24} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">Listing Basics</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Upload high-quality, well-lit photos showing all angles of your item. Write detailed, honest descriptions and mention any flaws to build buyer trust.
          </p>
          <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4 marker:text-primary">
            <li>Minimum of 3 clear photos</li>
            <li>Accurate condition grading</li>
            <li>Detailed product dimensions</li>
          </ul>
        </div>

        <div className="card p-8">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
            <DollarSign className="text-accent" size={24} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">Pricing Strategies</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Set a reasonable starting bid to encourage immediate action. A low starting bid attracts more watchers, which eventually drives the final price higher.
          </p>
          <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4 marker:text-accent">
            <li>Check historical auction prices</li>
            <li>Consider a lower reserve price</li>
            <li>Factor in your delivery costs</li>
          </ul>
        </div>

        <div className="card p-8">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="text-success" size={24} />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-3">Fulfilling Orders</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Once an auction ends, immediately contact the winning buyer through the messaging system to arrange safe pickup or trackable shipping.
          </p>
          <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4 marker:text-success">
            <li>Communicate promptly</li>
            <li>Use secure packing materials</li>
            <li>Exchange feedback after handoff</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerGuide;
