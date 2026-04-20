import React from 'react';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

const BuyerProtection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">Buyer Protection</h1>
        <p className="text-gray-500 text-lg">
          Bid with confidence knowing that BidLanka has your back.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-12">
        <div className="flex gap-6">
          <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <ShieldCheck className="text-success" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary mb-2">Secure Transactions</h3>
            <p className="text-gray-600 leading-relaxed">
              We monitor all platform activity to ensure sellers uphold their listed item conditions and delivery terms. Your transaction details and account data are fully encrypted.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <UserCheck className="text-primary" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary mb-2">Verified Sellers</h3>
            <p className="text-gray-600 leading-relaxed">
              Our rating and review system ensures you know who you are dealing with. Sellers with consistent negative feedback are reviewed and actively removed from BidLanka to maintain a safe marketplace.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary mb-2">Dispute Resolution</h3>
            <p className="text-gray-600 leading-relaxed">
              If an item is significantly not as described or never arrives, our support team will step in. Use the "Report an Issue" link in the footer to automatically escalate problematic transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProtection;
