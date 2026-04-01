import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { AuctionCard, AuctionCardSkeleton, AuctionCardData } from '../components/auction/AuctionCard';
import { auctionsAPI, categoriesAPI } from '../api';
import { useDebounce } from '../hooks';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'];
const SORT_OPTIONS = [
  { value: 'endTime', label: 'Ending Soon' },
  { value: 'newest', label: 'Just Listed' },
  { value: 'highestBid', label: 'Highest Bid' },
  { value: 'mostBids', label: 'Most Bids' },
];

const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState<AuctionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'endTime');

  const debouncedSearch = useDebounce(search, 400);
  const LIMIT = 12;

  const fetchAuctions = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT, sort };
      if (debouncedSearch) params.q = debouncedSearch;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      const data = await auctionsAPI.getAll(params);
      setAuctions(data.auctions);
      setTotal(data.total);
      setPage(p);
    } catch {
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, condition, sort]);

  useEffect(() => {
    document.title = 'Browse Auctions — BidLanka';
    categoriesAPI.getAll().then(data => setCategories(data)).catch(() => {});
    fetchAuctions(1);
  }, [fetchAuctions]);

  const clearFilters = () => { setSearch(''); setCategory(''); setCondition(''); setSort('endTime'); };
  const hasFilters = search || category || condition || sort !== 'endTime';
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-secondary mb-1">Browse Auctions</h1>
        <p className="text-gray-400">{total.toLocaleString()} auctions found</p>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search auctions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 pr-4"
            id="browse-search"
            aria-label="Search auctions"
          />
        </div>

        <select value={sort} onChange={e => setSort(e.target.value)}
          className="input-field w-auto min-w-[160px] bg-white" id="sort-select" aria-label="Sort by">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${showFilters || hasFilters ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary bg-white'}`}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} /> Filters {hasFilters ? '•' : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => setCategory(category === cat.name ? '' : cat.name)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${category === cat.name ? 'bg-primary border-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div className="flex flex-wrap gap-2">
                {['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'].map(cond => (
                  <button key={cond} onClick={() => setCondition(condition === cond ? '' : cond)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${condition === cond ? 'bg-primary border-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <AuctionCardSkeleton key={i} />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-24">
          <Search size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No auctions found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-outline">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map(a => <AuctionCard key={a._id} auction={a} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button onClick={() => fetchAuctions(page - 1)} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchAuctions(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-primary text-white shadow-primary' : 'border border-gray-200 hover:border-primary hover:text-primary'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => fetchAuctions(page + 1)} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse;
