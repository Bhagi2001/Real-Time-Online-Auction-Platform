import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Gavel, Trophy, MessageSquare, AlertCircle } from 'lucide-react';
import { notificationsAPI } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/Button';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  bid_placed: <Gavel size={18} className="text-primary" />,
  bid_outbid: <AlertCircle size={18} className="text-warning" />,
  auction_won: <Trophy size={18} className="text-accent" />,
  new_message: <MessageSquare size={18} className="text-info" />,
  auction_ended: <Bell size={18} className="text-gray-500" />,
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Notifications — BidLanka';
    notificationsAPI.get()
      .then(data => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary">Notifications</h1>
          {unreadCount > 0 && <p className="text-gray-400 mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllRead} className="gap-2 text-sm">
            <CheckCheck size={16} /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-24">
          <Bell size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">All caught up!</h3>
          <p className="text-gray-400">You have no notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const commonClass = `flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-white border-gray-100 hover:border-gray-200' : 'bg-primary/5 border-primary/20 hover:border-primary/40'}`;
            const innerContent = (
              <>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                  {typeIcons[n.type] || <Bell size={18} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                {!n.read && (
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); markRead(n._id); }}
                    className="flex-shrink-0 p-1.5 hover:bg-primary/10 rounded-lg transition-colors" aria-label="Mark as read">
                    <Check size={14} className="text-primary" />
                  </button>
                )}
                {!n.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
              </>
            );
            return n.link ? (
              <Link key={n._id} to={n.link} onClick={() => !n.read && markRead(n._id)} className={commonClass}>
                {innerContent}
              </Link>
            ) : (
              <div key={n._id} className={commonClass}>
                {innerContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
