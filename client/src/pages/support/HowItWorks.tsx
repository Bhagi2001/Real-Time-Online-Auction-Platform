import React from 'react';
import { Gavel, Clock, Trophy } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">How Bidding Works</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Your guide to finding, bidding, and winning incredible items on BidLanka.
        </p>
      </div>

      <div className="space-y-16 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center flex-shrink-0">
            <Clock className="text-primary" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary mb-3">1. Find Your Item</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse through hundreds of live auctions across various categories. Keep an eye on the countdown timer—auctions have a strict deadline. You can use your Watchlist to keep track of items you're interested in.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center flex-shrink-0">
            <Gavel className="text-accent" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary mb-3">2. Place Your Bid</h3>
            <p className="text-gray-600 leading-relaxed">
              When you find something you want, enter your maximum bid. Our real-time bidding engine instantly records your amount. Remember to monitor the auction, as other buyers might outbid you before time runs out.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center flex-shrink-0">
            <Trophy className="text-success" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary mb-3">3. Win and Connect</h3>
            <p className="text-gray-600 leading-relaxed">
              If you are the highest bidder when the clock strikes zero, you win! We will notify you immediately. You can then use the built-in messaging platform to connect with the seller and arrange for delivery or pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
