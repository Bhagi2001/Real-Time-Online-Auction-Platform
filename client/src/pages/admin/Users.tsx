import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { Search, ShieldAlert, CheckCircle2, MoreVertical, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'User Management — BidLanka Admin';
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      addToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string, isAdmin: boolean) => {
    if (isAdmin) {
      addToast('info', 'Cannot suspend an admin account');
      return;
    }
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      // We manually update the local state to fake a suspension property since we mocked the backend update
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: newStatus === 'suspended' } : u));
      addToast('success', `User account ${newStatus}`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update user');
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View and moderate all buyer and seller accounts.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=64748b`} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full"><ShieldAlert size={12} /> Admin</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-600">Standard</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {user.isSuspended ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Suspended</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleStatusToggle(user._id, user.isSuspended ? 'suspended' : 'active', user.isAdmin)}
                      disabled={user.isAdmin}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
                    >
                      {user.isSuspended ? <CheckCircle2 size={18} className="hover:text-emerald-500" /> : <XCircle size={18} className="hover:text-red-500" />}
                      <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        {user.isSuspended ? 'Reactivate' : 'Suspend'} User
                      </span>
                    </button>
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

export default Users;
