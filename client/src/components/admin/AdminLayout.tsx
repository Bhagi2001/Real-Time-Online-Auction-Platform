import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Gavel, FolderKanban, BarChart3, Settings, LogOut, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Auctions', to: '/admin/auctions', icon: Gavel },
    { name: 'Categories', to: '/admin/categories', icon: FolderKanban },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Reports', to: '/admin/reports', icon: AlertCircle },
    { name: 'Messages', to: '/admin/messages', icon: MessageSquare },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col md:h-screen sticky top-0 overflow-y-auto hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="BidLanka" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold tracking-tight">Bid<span className="text-primary">Lanka</span> <span className="text-xs font-medium text-slate-400 align-top uppercase tracking-widest ml-1">Admin</span></span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 hidden md:block">Admin Portal</h2>
          <div className="flex md:hidden items-center gap-2">
            <img src="/favicon.png" alt="BidLanka" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-slate-900">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff`} alt="Admin" className="w-9 h-9 rounded-full border border-gray-200" />
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
