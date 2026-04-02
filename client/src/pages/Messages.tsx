import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Search, User, Trash2 } from 'lucide-react';
import { messagesAPI, usersAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

interface Message { _id: string; sender: { _id: string; name: string; avatar?: string }; content: string; createdAt: string; }
interface Conversation { conversationId: string; otherUser: { _id: string; name: string; avatar?: string }; lastMessage: Message; unreadCount: number; }

const Messages: React.FC = () => {
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
    document.title = 'Messages — BidLanka';
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

  // openConversation moved above useEffect

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
      // Give the user a visual indication of what went wrong
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert('Delete failed. Please refresh the page and try again! Error: ' + msg);
    }
  };

  const avatarUrl = (u?: { name?: string; avatar?: string }) =>
    u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=FF6B35&color=fff`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-secondary mb-6">Messages</h1>
      <div className="card overflow-hidden" style={{ height: '70vh', display: 'flex' }}>
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field text-sm pl-9 py-2" placeholder="Search conversations..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                <MessageSquare size={32} className="mb-2 opacity-40" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">Contact a seller to start chatting</p>
              </div>
            ) : conversations.map(conv => {
              const isOnline = onlineUsers.includes(conv.otherUser?._id);
              return (
              <button key={conv.conversationId} onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${activeConv === conv.conversationId ? 'bg-primary/5 border-r-2 border-r-primary' : ''}`}>
                <div className="relative">
                  <img src={avatarUrl(conv.otherUser)} alt={conv.otherUser?.name || 'Deleted User'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-success' : 'bg-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{conv.otherUser?.name || 'Deleted User'}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.content || ''}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                )}
              </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {(activeConv || activeUser) ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={avatarUrl(activeUser || undefined)} alt={activeUser?.name} className="w-9 h-9 rounded-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{activeUser?.name}</p>
                    {activeUser && onlineUsers.includes(activeUser._id) ? (
                      <p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full" />Online</p>
                    ) : (
                      <p className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Offline</p>
                    )}
                  </div>
                </div>
                {activeConv && (
                  <button onClick={handleDeleteChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Conversation" aria-label="Delete Conversation">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map(msg => {
                  const isMe = msg.sender?._id === user?.id;
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && <img src={avatarUrl(msg.sender)} alt={msg.sender?.name || 'Deleted User'} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-gray-300 mt-1 px-1">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 flex items-center gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  id="message-input"
                />
                <button type="submit" disabled={sending || !input.trim()}
                  className="w-11 h-11 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={56} className="mb-4 opacity-20" />
              <p className="font-semibold text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your conversations on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
