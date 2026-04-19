import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages (lazy loaded)
import Home from './pages/Home';
import Browse from './pages/Browse';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Watchlist from './pages/Watchlist';
import NotFound from './pages/NotFound';

// Static footer pages
import HelpCenter from './pages/support/HelpCenter';
import HowItWorks from './pages/support/HowItWorks';
import SellerGuide from './pages/support/SellerGuide';
import BuyerProtection from './pages/support/BuyerProtection';
import ReportIssue from './pages/support/ReportIssue';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import CookiePolicy from './pages/legal/CookiePolicy';

// Admin panel
import { AdminLayout } from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAuctions from './pages/admin/Auctions';
import AdminCategories from './pages/admin/Categories';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReports from './pages/admin/Reports';
import AdminMessages from './pages/admin/Messages';
import AdminSettings from './pages/admin/Settings';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return (user && user.isAdmin) ? <Outlet /> : <Navigate to="/" replace />;
};

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 page-enter">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/auctions" element={<Browse />} />
      <Route path="/auctions/:id" element={<AuctionDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile/:id" element={<Profile />} />

      {/* Static Footer Routes */}
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/seller-guide" element={<SellerGuide />} />
      <Route path="/buyer-protection" element={<BuyerProtection />} />
      <Route path="/report" element={<ReportIssue />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/auctions/create" element={<CreateAuction />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>

    {/* Admin routes (isolated from standard Header/Footer Layout) */}
    <Route element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/auctions" element={<AdminAuctions />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Route>
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <AppRoutes />
            <ToastContainer />
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
