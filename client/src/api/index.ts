import api from './axios';

export const auctionsAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/auctions', { params }).then(r => r.data),
  getFeatured: () => api.get('/auctions/featured').then(r => r.data),
  getEndingSoon: () => api.get('/auctions/ending-soon').then(r => r.data),
  getGlobalStats: () => api.get('/auctions/stats/global').then(r => r.data),
  getById: (id: string) => api.get(`/auctions/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/auctions', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/auctions/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/auctions/${id}`).then(r => r.data),
};

export const bidsAPI = {
  getByAuction: (auctionId: string) => api.get(`/bids/auction/${auctionId}`).then(r => r.data),
  place: (auctionId: string, amount: number) => api.post('/bids', { auctionId, amount }).then(r => r.data),
  getUserBids: () => api.get('/bids/user').then(r => r.data),
};

export const watchlistAPI = {
  get: () => api.get('/watchlist').then(r => r.data),
  add: (auctionId: string) => api.post(`/watchlist/${auctionId}`).then(r => r.data),
  remove: (auctionId: string) => api.delete(`/watchlist/${auctionId}`).then(r => r.data),
  check: (auctionId: string) => api.get(`/watchlist/check/${auctionId}`).then(r => r.data),
};

export const usersAPI = {
  getProfile: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data).then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) => api.put('/users/password', { currentPassword, newPassword }).then(r => r.data),
  getDashboardStats: () => api.get('/users/dashboard/stats').then(r => r.data),
  postReview: (data: Record<string, unknown>) => api.post('/users/review', data).then(r => r.data),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations').then(r => r.data),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`).then(r => r.data),
  send: (receiverId: string, content: string, auctionId?: string) => api.post('/messages', { receiverId, content, auctionId }).then(r => r.data),
  deleteConversation: (conversationId: string) => api.delete(`/messages/${conversationId}`).then(r => r.data),
};

export const notificationsAPI = {
  get: (page?: number) => api.get('/notifications', { params: { page } }).then(r => r.data),
  markAllRead: () => api.put('/notifications/read-all').then(r => {
    window.dispatchEvent(new Event('notificationsRead'));
    return r.data;
  }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`).then(r => {
    window.dispatchEvent(new Event('notificationsRead'));
    return r.data;
  }),
};

export const uploadAPI = {
  images: async (files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    const { data } = await api.post('/upload/images', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },
  avatar: async (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post('/upload/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getUsers: () => api.get('/admin/users').then(r => r.data),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }).then(r => r.data),
  getAuctions: () => api.get('/admin/auctions').then(r => r.data),
  updateAuctionStatus: (id: string, status: string) => api.put(`/admin/auctions/${id}/status`, { status }).then(r => r.data),
  getDeepAnalytics: () => api.get('/admin/analytics/deep').then(r => r.data),
  exportUsers: () => api.get('/admin/export/users', { responseType: 'blob' }),
  exportAuctions: () => api.get('/admin/export/auctions', { responseType: 'blob' }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories').then(r => r.data),
  create: (name: string, icon: string) => api.post('/categories', { name, icon }).then(r => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),
};

export const reportsAPI = {
  submit: (data: { category: string; auctionUrl?: string; description: string }) => api.post('/reports', data).then(r => r.data),
  getAll: () => api.get('/reports/admin').then(r => r.data),
  updateStatus: (id: string, status: 'pending' | 'resolved') => api.put(`/reports/admin/${id}`, { status }).then(r => r.data),
};

export const settingsAPI = {
  getAll: () => api.get('/settings').then(r => r.data),
  update: (key: string, value: string) => api.put(`/settings/${key}`, { value }).then(r => r.data),
};
