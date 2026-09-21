import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-7 sm:p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm">
            <Music2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sign in to continue listening on Melomix
          </p>
        </div>

        {/* Demo Fast-Fill Buttons */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('user@melomix.com')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Standard User</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin@melomix.com')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-95 disabled:opacity-50 transition-all mt-2"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
