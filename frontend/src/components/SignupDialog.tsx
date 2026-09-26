import { useState } from 'react';
import { Mail, Lock, User, Calendar, ArrowRight, AlertCircle, X } from 'lucide-react';
import { signup, login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';

interface SignupDialogProps {
  onClose: () => void;
  onNavigate: (page: 'login' | 'signup') => void;
}

export function SignupDialog({ onClose, onNavigate }: SignupDialogProps) {
  const { checkAuth } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !age) {
      setError('Please fill in all fields.');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setError('Age must be between 10 and 100.');
      return;
    }
    if (password.length < 8 || password.length > 30) {
      setError('Password must be between 8 to 30 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup({ name, age: ageNum, email, password });
      try {
        await login(email, password);
      } catch {
        onNavigate('login');
        return;
      }
      await checkAuth();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[400px] animate-scale-in rounded-2xl border border-gray-200 bg-white p-7 shadow-2xl dark:border-gray-800 dark:bg-[#2f2f2f]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary-500/15 ring-1 ring-gray-100 dark:bg-gray-100 dark:ring-white/10">
            <img src="/logo.png" alt="Sova AI" className="h-full w-full object-cover object-center" />
          </div>
          <h2 id="signup-title" className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start building with your AI copilot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-field pl-10"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                className="input-field pl-10"
                min="10"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="At least 8 characters"
                className="input-field pl-10"
                autoComplete="new-password"
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
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
