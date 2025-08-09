'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get('next');
    setNextPath(next);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
        credentials: 'include', // Important! This allows cookies to be set
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // No need to manually set cookie - the API does that
      if (nextPath) {
        router.push(nextPath);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 pt-16 md:pt-4">
      {/* Chart-like background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-gray-600" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-b border-gray-600" />
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>

        {/* Auth Form */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 md:p-6 border border-gray-700">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-2">
              Sign In
            </h2>
            <p className="text-gray-400">
              Welcome back
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-green-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-green-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-2 px-4 rounded-lg transition-colors
                ${loading 
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
                }
              `}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="w-full text-gray-400 hover:text-white transition-colors mt-4"
            >
              Don't have an account? Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}