import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { usersAPI, settingsAPI } from '../../api';
import { User, Lock, Save, Camera, FileText, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isPoliciesLoading, setIsPoliciesLoading] = useState(false);
  const [policies, setPolicies] = useState({
    terms: '',
    privacy: '',
    cookies: '',
  });

  React.useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setIsPoliciesLoading(true);
      const data = await settingsAPI.getAll();
      setPolicies({
        terms: data.terms || '',
        privacy: data.privacy || '',
        cookies: data.cookies || '',
      });
    } catch (err: any) {
      addToast('error', 'Failed to fetch platform policies');
    } finally {
      setIsPoliciesLoading(false);
    }
  };

  const handleUpdatePolicy = async (key: string) => {
    try {
      setIsPoliciesLoading(true);
      await settingsAPI.update(key, (policies as any)[key]);
      addToast('success', `${key.charAt(0).toUpperCase() + key.slice(1)} policy updated`);
    } catch (err: any) {
      addToast('error', `Failed to update ${key} policy`);
    } finally {
      setIsPoliciesLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      return addToast('error', 'Name and Email are required');
    }
    try {
      setIsProfileLoading(true);
      const updated = await usersAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
      });
      if (user) {
        updateUser({ ...user, name: updated.name, email: updated.email });
      }
      addToast('success', 'Admin profile updated successfully');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return addToast('error', 'Please fill all password fields');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return addToast('error', 'New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return addToast('error', 'New password must be at least 6 characters');
    }

    try {
      setIsPasswordLoading(true);
      await usersAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      addToast('success', 'Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500">Configure global platform rules and manage your admin credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Admin Profile</h2>
              <p className="text-xs text-slate-500">Update your account information.</p>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
            <div className="flex flex-col items-center pb-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center relative overflow-hidden group">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   {/* In the future: Add file upload here */}
                   <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Admin Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="admin@bidlanka.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProfileLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              <Save size={16} />
              {isProfileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Security</h2>
              <p className="text-xs text-slate-500">Update your security credentials.</p>
            </div>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
              <Lock size={16} />
              {isPasswordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Policy Management section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Legal Policies</h2>
              <p className="text-xs text-slate-500">Manage the platform's public legal documents. HTML is supported.</p>
            </div>
          </div>
          {isPoliciesLoading && (
            <div className="text-xs text-slate-400 animate-pulse">Processing...</div>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Terms & Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Terms & Conditions</h3>
              <button 
                onClick={() => handleUpdatePolicy('terms')}
                disabled={isPoliciesLoading}
                className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Save size={12} /> Save
              </button>
            </div>
            <textarea
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono resize-none"
              value={policies.terms}
              onChange={(e) => setPolicies({...policies, terms: e.target.value})}
              placeholder="Enter HTML or plain text terms..."
            />
          </div>

          {/* Privacy Policy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Privacy Policy</h3>
              <button 
                onClick={() => handleUpdatePolicy('privacy')}
                disabled={isPoliciesLoading}
                className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Save size={12} /> Save
              </button>
            </div>
            <textarea
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono resize-none"
              value={policies.privacy}
              onChange={(e) => setPolicies({...policies, privacy: e.target.value})}
              placeholder="Enter HTML or plain text policy..."
            />
          </div>

          {/* Cookie Policy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Cookie Policy</h3>
              <button 
                onClick={() => handleUpdatePolicy('cookies')}
                disabled={isPoliciesLoading}
                className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Save size={12} /> Save
              </button>
            </div>
            <textarea
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono resize-none"
              value={policies.cookies}
              onChange={(e) => setPolicies({...policies, cookies: e.target.value})}
              placeholder="Enter HTML or plain text policy..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
