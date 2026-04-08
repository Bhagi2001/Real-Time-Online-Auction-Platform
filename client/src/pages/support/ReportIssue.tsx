import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { reportsAPI } from '../../api';

const ReportIssue: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    auctionUrl: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportsAPI.submit(formData);
      addToast('success', 'Report Submitted', 'Our support team will contact you shortly.');
      setFormData({ category: '', auctionUrl: '', description: '' });
    } catch (err: any) {
      addToast('error', 'Submission Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-secondary mb-4">Report an Issue</h1>
        <p className="text-gray-500">
          Encountered a problem with a buyer, seller, or auction? Let us know so we can help.
        </p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Issue Category</label>
            <select 
              className="input-field" 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select a category...</option>
              <option value="item_not_received">Item not received</option>
              <option value="item_not_as_described">Item not as described</option>
              <option value="fraudulent_listing">Fraudulent listing reported</option>
              <option value="technical_bug">Website bug or technical issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Related Auction URL or ID (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. https://bidlanka.lk/auctions/..." 
              value={formData.auctionUrl}
              onChange={(e) => setFormData({ ...formData, auctionUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Description</label>
            <textarea 
              className="input-field min-h-[150px] resize-y" 
              placeholder="Please describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all disabled:opacity-75"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
