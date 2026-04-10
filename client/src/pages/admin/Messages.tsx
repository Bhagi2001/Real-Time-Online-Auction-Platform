import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Search, Trash2 } from 'lucide-react';
import { messagesAPI, usersAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

interface Message { _id: string; sender: { _id: string; name: string; avatar?: string }; content: string; createdAt: string; }
interface Conversation { conversationId: string; otherUser: { _id: string; name: string; avatar?: string }; lastMessage: Message; unreadCount: number; }

const AdminMessages: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<{ _id: string; name: string; avatar?: string } | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv.conversationId);
    setActiveUser(conv.otherUser);
    const data = await messagesAPI.getMessages(conv.conversationId);
    setMessages(data);
    socket?.emit('join_conversation', conv.conversationId);
  };

  useEffect(() => {
    document.title = 'Admin Messages — BidLanka';
    messagesAPI.getConversations()
      .then(async data => { 
        setConversations(data); 
        
        const userId = searchParams.get('userId');
        if (userId) {
          const existingConv = data.find((c: Conversation) => c.otherUser?._id === userId);
          if (existingConv) {
            openConversation(existingConv);
          } else {
            try {
              const userProfile = await usersAPI.getProfile(userId);
              setActiveUser({ _id: userProfile._id, name: userProfile.name, avatar: userProfile.avatarUrl || userProfile.avatar });
              setActiveConv(null);
              setMessages([]);
            } catch (err) {
              console.error('Failed to resolve user for messaging', err);
            }
          }
          setSearchParams({}, { replace: true });
        }
        
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.off('new_message'); };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeUser || sending) return;
    setSending(true);
    try {
      const msg = await messagesAPI.send(activeUser._id, input.trim());
      setMessages(prev => [...prev, msg]);
      if (!activeConv) {
        messagesAPI.getConversations().then(data => {
          setConversations(data);
          const newConv = data.find((c: Conversation) => c.otherUser?._id === activeUser._id);
          if (newConv) {
            setActiveConv(newConv.conversationId);
            socket?.emit('join_conversation', newConv.conversationId);
          }
        });
      } else {
        setConversations(prev => prev.map(c => c.conversationId === activeConv ? { ...c, lastMessage: msg } : c));
      }
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeConv) return;
    try {
      await messagesAPI.deleteConversation(activeConv);
      setConversations(prev => prev.filter(c => c.conversationId !== activeConv));
      setActiveConv(null);
      setActiveUser(null);
      setMessages([]);
    } catch (err: any) {
      console.error('Failed to delete conversation', err);
      alert('Delete failed. Error: ' + (err?.response?.data?.message || err?.message));
    }
  };

  const avatarUrl = (u?: { name?: string; avatar?: string }) =>
    u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=0f172a&color=fff`;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-slate-50/30">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-slate-900 mb-4 px-1">Inbox</h1>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search chats..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
              <MessageSquare size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No messages found</p>
            </div>
          ) : conversations.map(conv => {
            const isOnline = onlineUsers.includes(conv.otherUser?._id);
            return (
              <button 
                key={conv.conversationId} 
                onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-white transition-colors text-left border-b border-gray-50 ${activeConv === conv.conversationId ? 'bg-white shadow-sm z-10' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={avatarUrl(conv.otherUser)} alt="" className="w-11 h-11 rounded-full object-cover" />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{conv.otherUser?.name || 'Deleted User'}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage?.content || 'No messages yet'}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {(activeConv || activeUser) ? (
          <>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={avatarUrl(activeUser || undefined)} alt="" className="w-9 h-9 rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-none">{activeUser?.name}</p>
                  {activeUser && onlineUsers.includes(activeUser._id) ? (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" /> Offline
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleDeleteChat} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Conversation"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.map((msg, idx) => {
                const isMe = msg.sender?._id === user?.id;
                const showAvatar = idx === 0 || messages[idx-1].sender?._id !== msg.sender?._id;
                
                return (
                  <div key={msg._id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className="w-8 flex-shrink-0">
                        {showAvatar && <img src={avatarUrl(msg.sender)} alt="" className="w-8 h-8 rounded-full object-cover" />}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium italic">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700"
                />
                <button 
                  type="submit" 
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="opacity-20" />
            </div>
            <p className="font-bold text-slate-900">Select a conversation</p>
            <p className="text-sm mt-1">Choose a user from the left to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
