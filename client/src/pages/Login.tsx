import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const userData = await login(form.email, form.password);
      addToast('success', 'Welcome back!', 'You have successfully signed in');
      if (userData.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid email or password';
      addToast('error', 'Sign in failed', msg);
      setErrors({ password: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-primary mb-4">
            <Gavel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-secondary">Sign in to BidLanka</h1>
          <p className="text-gray-400 mt-1">Bid, win, and sell across Sri Lanka</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(e => ({ ...e, email: '' })); }}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                id="login-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(e => ({ ...e, password: '' })); }}
                error={errors.password}
                leftIcon={<Lock size={16} />}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">Forgot password?</Link>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} className="gap-2 text-base">
              Sign In <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Join BidLanka Free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
