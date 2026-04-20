import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { Search, CheckCircle2, AlertCircle, Clock, ExternalLink, Flag, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface User { _id: string; name: string; email: string; }
interface Report { _id: string; user: User; category: string; description: string; auctionUrl?: string; status: 'pending' | 'resolved'; createdAt: string; }

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'Issue Reports — BidLanka Admin';
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await reportsAPI.getAll();
      setReports(data);
    } catch (err) {
      addToast('error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (reportId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      await reportsAPI.updateStatus(reportId, newStatus as 'pending' | 'resolved');
      setReports((prev: Report[]) => prev.map((r: Report) => r._id === reportId ? { ...r, status: newStatus as 'pending' | 'resolved' } : r));
      addToast('success', `Report marked as ${newStatus}`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update report');
    }
  };

  const filtered = reports.filter((r: Report) => 
    r.category.toLowerCase().replace(/_/g, ' ').includes(search.toLowerCase()) || 
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issue Reports</h1>
          <p className="text-sm text-slate-500">Review and resolve issues reported by users.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading reports...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No reports found.</td>
                </tr>
              ) : filtered.map((report: Report) => (
                <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{report.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-500">{report.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {getCategoryLabel(report.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="line-clamp-2 text-slate-600 mb-1">{report.description}</p>
                    {report.auctionUrl && (
                      <a 
                        href={report.auctionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> View related page
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={14} />
                      {format(new Date(report.createdAt), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/messages?userId=${report.user?._id}`}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors group relative"
                      >
                        <MessageCircle size={18} />
                        <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                          Chat with Reporter
                        </span>
                      </Link>
                      <button 
                        onClick={() => handleStatusToggle(report._id, report.status)}
                        className={`p-1.5 rounded-lg transition-colors group relative ${
                          report.status === 'resolved' 
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {report.status === 'resolved' ? <Flag size={18} /> : <CheckCircle2 size={18} />}
                        <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                          Mark as {report.status === 'resolved' ? 'Pending' : 'Resolved'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
