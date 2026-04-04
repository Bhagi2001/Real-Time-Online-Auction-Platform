import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Gavel, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authAPI } from '../api/auth';
import { useToast } from '../contexts/ToastContext';

const ResetPassword: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
      addToast('success', 'Password reset successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed — link may have expired';
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-primary mb-4">
            <Gavel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-secondary">Reset Password</h1>
          <p className="text-gray-400 mt-1">Enter your new password below</p>
        </div>

        <div className="card p-8">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={56} className="mx-auto text-success mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
              <p className="text-gray-500 mb-6">Your password has been changed successfully.</p>
              <Button onClick={() => navigate('/login')} fullWidth className="gap-2">
                Sign In Now <ArrowLeft size={16} />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!token && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Invalid or missing reset token. Please request a new reset link.
                </div>
              )}
              <div className="relative">
                <Input id="reset-password" label="New Password" type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters" value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(e => ({ ...e, password: '' })); }}
                  error={errors.password} leftIcon={<Lock size={16} />} required />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input id="reset-confirm-password" label="Confirm New Password" type="password"
                placeholder="Repeat new password" value={form.confirmPassword}
                onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(e => ({ ...e, confirmPassword: '' })); }}
                error={errors.confirmPassword} leftIcon={<Lock size={16} />} required />
              <Button type="submit" fullWidth isLoading={isLoading} disabled={!token}>
                Reset Password
              </Button>
            </form>
          )}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
