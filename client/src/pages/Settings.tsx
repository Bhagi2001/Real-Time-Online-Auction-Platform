import React, { useState, useRef } from 'react';
import { Camera, User, Lock, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { usersAPI, uploadAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: '',
    phone: '',
    location: '',
    avatar: user?.avatar || '',
  });

  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [secErrors, setSecErrors] = useState<Record<string, string>>({});

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { url } = await uploadAPI.avatar(file);
      setProfile(p => ({ ...p, avatar: url }));
      addToast('success', 'Avatar updated!');
    } catch {
      addToast('error', 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile(profile);
      updateUser({ id: updated._id, name: updated.name, email: updated.email, avatar: updated.avatarUrl || updated.avatar, isAdmin: updated.isAdmin });
      addToast('success', 'Profile updated successfully!');
    } catch {
      addToast('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!security.currentPassword) errs.currentPassword = 'Required';
    if (security.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (security.newPassword !== security.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setSecErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await usersAPI.changePassword(security.currentPassword, security.newPassword);
      addToast('success', 'Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      addToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = profile.avatar.startsWith('http') ? profile.avatar : profile.avatar ? `http://localhost:5000${profile.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF6B35&color=fff&size=128`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-secondary mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-8">
        {[
          { key: 'profile', label: 'Profile', icon: <User size={15} /> },
          { key: 'security', label: 'Security', icon: <Lock size={15} /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as 'profile' | 'security')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={saveProfile} className="card p-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={avatarSrc} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-4 border-primary/20" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
                disabled={uploadingAvatar} aria-label="Change avatar">
                {uploadingAvatar ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} id="avatar-upload" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profile.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline mt-1">Change photo</button>
            </div>
          </div>

          <Input id="setting-name" label="Display Name *" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
          <Textarea id="setting-bio" label="Bio" placeholder="Tell buyers a bit about yourself..." value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="setting-phone" label="Phone" type="tel" placeholder="+94 77 123 4567" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            <Input id="setting-location" label="Location" placeholder="Colombo, Sri Lanka" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={saving} className="gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={changePassword} className="card p-8 space-y-5">
          <h2 className="font-bold text-gray-800">Change Password</h2>
          <div className="relative">
            <Input id="current-password" label="Current Password" type={showCurrentPw ? 'text' : 'password'} value={security.currentPassword}
              onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} error={secErrors.currentPassword} required />
            <button type="button" onClick={() => setShowCurrentPw(v => !v)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input id="new-password" label="New Password" type={showNewPw ? 'text' : 'password'} value={security.newPassword}
              onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} error={secErrors.newPassword} helperText="At least 6 characters" required />
            <button type="button" onClick={() => setShowNewPw(v => !v)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600" aria-label="Toggle new password visibility">
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input id="confirm-password" label="Confirm New Password" type="password" value={security.confirmPassword}
            onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} error={secErrors.confirmPassword} required />

          <div className="pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={saving} className="gap-2">
              <Lock size={16} /> Update Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
