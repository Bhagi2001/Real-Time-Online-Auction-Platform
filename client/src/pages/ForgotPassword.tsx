import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authAPI } from '../api/auth';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword: React.FC = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      addToast('success', 'Reset link sent!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send reset link';
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
          <h1 className="text-2xl font-extrabold text-secondary">Forgot Password?</h1>
          <p className="text-gray-400 mt-1">No worries, we'll send you a reset link</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle size={56} className="mx-auto text-success mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email!</h2>
              <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
              <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Enter your registered email and we'll send you a link to reset your password.
              </div>
              <Input id="forgot-email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} />} required />
              <Button type="submit" fullWidth isLoading={isLoading} className="gap-2">
                <Mail size={16} /> Send Reset Link
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

export default ForgotPassword;
