import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast('success', '🎉 Welcome to BidLanka!', 'Your account is ready');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      addToast('error', 'Registration failed', msg);
      if (msg.includes('email')) setErrors({ email: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const strength = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-primary mb-4">
            <Gavel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-secondary">Join BidLanka</h1>
          <p className="text-gray-400 mt-1">Start bidding and selling today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="reg-name" label="Full Name" placeholder="John Perera" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} leftIcon={<User size={16} />} autoComplete="name" required />
            <Input id="reg-email" label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} leftIcon={<Mail size={16} />} autoComplete="email" required />

            <div>
              <div className="relative">
                <Input id="reg-password" label="Password" type={showPw ? 'text' : 'password'} placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} leftIcon={<Lock size={16} />} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength === 'strong' ? 'bg-success w-full' : strength === 'medium' ? 'bg-warning w-2/3' : 'bg-error w-1/3'}`} />
                  </div>
                  <span className={`text-xs font-medium ${strength === 'strong' ? 'text-success' : strength === 'medium' ? 'text-warning' : 'text-error'}`}>
                    {strength.charAt(0).toUpperCase() + strength.slice(1)}
                  </span>
                </div>
              )}
            </div>

            <Input id="reg-confirm-password" label="Confirm Password" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} error={errors.confirmPassword} leftIcon={<Lock size={16} />} required />

            {/* Benefits */}
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              {['Free to join and list items', 'Real-time bidding updates', 'Buyer & seller protection'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={15} className="text-success flex-shrink-0" /> {b}
                </div>
              ))}
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} className="gap-2 text-base">
              Create Account <ArrowRight size={18} />
            </Button>

            <p className="text-xs text-gray-400 text-center">
              By registering, you agree to our{' '}
              <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
              <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
