import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, BarChart2, PieChart as PieChartIcon, Loader2, DownloadCloud } from 'lucide-react';
import { adminAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#FF6B35', '#004E89', '#1A659E', '#E85D04', '#F4A261'];

const Analytics: React.FC = () => {
  const { addToast } = useToast();
  const [data, setData] = useState<{ categoryDistribution: any[], topSellers: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    adminAPI.getDeepAnalytics()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        addToast('error', 'Failed to load deep analytics');
        setLoading(false);
      });
  }, []);

  const handleExport = async (type: 'users' | 'auctions') => {
    setExporting(type);
    try {
      const resp = type === 'users' ? await adminAPI.exportUsers() : await adminAPI.exportAuctions();
      const blob = new Blob([resp.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bidlanka_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (err) {
      addToast('error', `Failed to export ${type}`);
    } finally {
      setExporting('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advanced Analytics</h1>
          <p className="text-sm text-slate-500">Deep insights into platform operation and performance.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('users')} 
            disabled={exporting !== ''}
            className="flex items-center gap-2 bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting === 'users' ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} className="text-blue-500" />}
            Export Users CSV
          </button>
          <button 
            onClick={() => handleExport('auctions')} 
            disabled={exporting !== ''}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
             {exporting === 'auctions' ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} className="text-orange-400" />}
             Export Auctions CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-primary" /> Category Distribution
          </h3>
          <div className="h-72">
            {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No category data available</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {data?.categoryDistribution.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-slate-600">{cat.name} ({cat.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-primary" /> Top Sellers by Volume
          </h3>
          <div className="h-72">
             {data?.topSellers && data.topSellers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topSellers}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `LKR ${val/1000}k`} />
                  <RechartsTooltip formatter={(value: any) => `LKR ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="volume" fill="#004E89" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No seller data available</div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
