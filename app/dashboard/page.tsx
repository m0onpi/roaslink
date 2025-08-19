'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaGlobe, FaCopy, FaTrash, FaCode, FaCheckCircle, FaArrowRight, FaRocket, FaSpinner, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  planType: string;
  subscriptionEndsAt: string;
  domainLimit: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedScript, setCopiedScript] = useState('');

  useEffect(() => {
    checkUserAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchDomains();
    }
  }, [hasAccess]);

  const checkUserAccess = async () => {
    try {
      const response = await fetch('/api/auth/check-access', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth?next=/dashboard');
          return;
        }
        throw new Error('Failed to check access');
      }

      const data = await response.json();
      if (data.hasAccess) {
        setHasAccess(true);
        setUser(data.user);
      } else {
        setHasAccess(false);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Access check error:', error);
      router.push('/auth?next=/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch domains');
      }

      const data = await response.json();
      setDomains(data.domains);
    } catch (error) {
      console.error('Fetch domains error:', error);
      setError('Failed to load domains');
    }
  };

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    // Check domain limit
    // Check domain limit based on user's plan
    const domainLimit = user?.domainLimit || 0;
    
    if (domainLimit !== -1 && domains.length >= domainLimit) {
      const planName = user?.planType || 'current';
      setError(`Your ${planName} plan allows up to ${domainLimit} domain${domainLimit === 1 ? '' : 's'}. Please upgrade your plan or delete existing domains.`);
      return;
    }

    setIsAddingDomain(true);
    setError('');
    
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          domain: newDomain.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add domain');
      }
      
      setDomains([...domains, data.domain]);
      setNewDomain('');
    } catch (err: any) {
      setError(err.message || 'Failed to add domain');
    } finally {
      setIsAddingDomain(false);
    }
  };

  const removeDomain = async (id: string) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete domain');
      }

      setDomains(domains.filter(d => d.id !== id));
    } catch (error) {
      console.error('Delete domain error:', error);
      setError('Failed to delete domain');
    }
  };

  const copyScript = (domain: string) => {
    const script = `<script src="https://roaslink.co.uk/api/redirect?target=https://${domain}" async></script>`;
    navigator.clipboard.writeText(script);
    setCopiedScript(domain);
    setTimeout(() => setCopiedScript(''), 2000);
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg text-gray-600">Checking your access...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need an active subscription to access the dashboard.
            {user && (
              <span className="block mt-2 text-sm">
                Current status: <span className="font-semibold">{user.subscriptionStatus || 'No subscription'}</span>
              </span>
            )}
          </p>
          <div className="space-y-3">
            <Link 
              href="/pricing"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Choose a Plan
            </Link>
            <button 
              onClick={signOut}
              className="block w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaRocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tracking" className="text-gray-600 hover:text-gray-900 transition-colors">Tracking Script</Link>
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900 transition-colors">Analytics</Link>
              <Link href="/heatmap" className="text-purple-600 hover:text-purple-800 transition-colors font-medium">🔥 Exit Heatmap</Link>
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user.name}</span>
                  <span className="block text-xs text-gray-500">
                    {user.planType} plan
                  </span>
                </div>
              )}
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Upgrade</Link>
              <button 
                onClick={signOut}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Domain Management Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage your domains and redirect scripts from here
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <FaExclamationTriangle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* Add Domain Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Domain</h2>
              <span className="text-sm text-gray-500">
                {domains.length}/{user?.domainLimit === -1 ? '∞' : user?.domainLimit || 0} domains used
              </span>
            </div>
            <form onSubmit={addDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter just the domain name (e.g., example.com, subdomain.example.com)
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isAddingDomain || (user?.domainLimit !== -1 && domains.length >= (user?.domainLimit || 0))}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isAddingDomain || (user?.domainLimit !== -1 && domains.length >= (user?.domainLimit || 0))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {isAddingDomain ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Adding Domain...
                  </>
                ) : (user?.domainLimit !== -1 && domains.length >= (user?.domainLimit || 0)) ? (
                  <>
                    <FaLock className="w-4 h-4" />
                    Domain Limit Reached
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4" />
                    Add Domain
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Domains List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Domains ({domains.length})</h2>
            
            {domains.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaGlobe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains yet</h3>
                <p className="text-gray-600">Add your first domain to get started with RoasLink redirects</p>
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain, index) => (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          domain.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <FaGlobe className={`w-6 h-6 ${
                            domain.isActive ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                          <p className="text-sm text-gray-500">
                            Status: {domain.isActive ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-xs text-gray-400">Added on {new Date(domain.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyScript(domain.domain)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          {copiedScript === domain.domain ? (
                            <>
                              <FaCheckCircle className="w-4 h-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <FaCopy className="w-4 h-4" />
                              Copy Script
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeDomain(domain.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Script Preview */}
                    <div className="mt-4 p-4 bg-gray-900 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Implementation Script</span>
                        <FaCode className="w-4 h-4 text-gray-400" />
                      </div>
                      <pre className="text-sm text-green-400 overflow-x-auto">
{`<script 
  src="https://roaslink.co.uk/api/redirect?target=https://${domain.domain}"
  async
></script>`}
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
            <p className="text-blue-100 mb-6">
              Check out our documentation or contact support for assistance with implementation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs" className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 justify-center">
                <FaCode className="w-4 h-4" />
                Documentation
              </Link>
              <Link href="/support" className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 justify-center">
                <FaArrowRight className="w-4 h-4" />
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}