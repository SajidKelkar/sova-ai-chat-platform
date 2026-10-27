import { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, X } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { BrandMark } from './BrandMark';

interface LoginDialogProps {
  onClose: () => void;
  onNavigate: (page: 'login' | 'signup') => void;
}

export function LoginDialog({ onClose, onNavigate }: LoginDialogProps) {
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      const authenticated = await checkAuth();
      if (!authenticated) {
        setError('Unable to verify your account. Please try again.');
        return;
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className="absolute inset-0 bg-gray-950/45 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-[26px] border border-gray-200/80 bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.2)] dark:border-white/[0.1] dark:bg-[#25272b] sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.08] dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="mb-6 flex flex-col items-center">
          <BrandMark className="mb-4 h-12 w-12 rounded-[15px] shadow-[0_8px_22px_rgba(15,23,42,0.12)] ring-1 ring-black/5 dark:ring-white/10" />
          <h2 id="login-title" className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to continue your conversations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
                autoComplete="email"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-10"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
