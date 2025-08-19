'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaGlobe, FaCopy, FaTrash, FaCode, FaCheckCircle, FaArrowRight, FaRocket, FaSpinner, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';

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
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 glass-strong p-8 rounded-2xl"
        >
          <FaSpinner className="w-6 h-6 text-light-accent dark:text-dark-accent animate-spin" />
          <span className="text-lg text-light-text dark:text-dark-text">Checking your access...</span>
        </motion.div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="card p-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaLock className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Access Required</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              You need an active subscription to access the dashboard.
              {user && (
                <span className="block mt-2 text-sm">
                  Current status: <span className="font-semibold text-light-accent dark:text-dark-accent">{user.subscriptionStatus || 'No subscription'}</span>
                </span>
              )}
            </p>
            <div className="space-y-3">
              <Link 
                href="/pricing"
                className="btn-primary block w-full text-center"
              >
                Choose a Plan
              </Link>
              <button 
                onClick={signOut}
                className="btn-secondary block w-full"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      {/* Header */}
      <header className="glass border-b border-light-border dark:border-dark-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-accent-light dark:bg-gradient-accent-dark rounded-xl flex items-center justify-center shadow-lg"
              >
                <FaRocket className="w-5 h-5 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tracking" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors">Tracking Script</Link>
              <Link href="/analytics" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors">Analytics</Link>
              <Link href="/heatmap" className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover transition-colors font-medium">🔥 Exit Heatmap</Link>
              {user && (
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Welcome, <span className="font-semibold text-light-text dark:text-dark-text">{user.name}</span>
                  <span className="block text-xs text-light-text-muted dark:text-dark-text-muted">
                    {user.planType} plan
                  </span>
                </div>
              )}
              <ThemeToggle size="sm" />
              <Link href="/pricing" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors">Upgrade</Link>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
              >
                Sign Out
              </motion.button>
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
            <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
              Domain Management Dashboard
            </h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Manage your domains and redirect scripts from here
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
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
            className="card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Add New Domain</h2>
              <span className="text-sm text-light-text-muted dark:text-dark-text-muted">
                {domains.length}/{user?.domainLimit === -1 ? '∞' : user?.domainLimit || 0} domains used
              </span>
            </div>
            <form onSubmit={addDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="input-field"
                  required
                />
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                  Enter just the domain name (e.g., example.com, subdomain.example.com)
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isAddingDomain || (user?.domainLimit !== -1 && domains.length >= (user?.domainLimit || 0))}
                className={`w-full rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isAddingDomain || (user?.domainLimit !== -1 && domains.length >= (user?.domainLimit || 0))
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed px-6 py-3'
                    : 'btn-primary'
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
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Your Domains ({domains.length})</h2>
            
            {domains.length === 0 ? (
              <div className="card p-12 text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-16 h-16 bg-light-secondary dark:bg-dark-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <FaGlobe className="w-8 h-8 text-light-text-muted dark:text-dark-text-muted" />
                </motion.div>
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">No domains yet</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Add your first domain to get started with RoasLink redirects</p>
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain, index) => (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card card-hover p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            domain.isActive 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-light-secondary dark:bg-dark-tertiary'
                          }`}
                        >
                          <FaGlobe className={`w-6 h-6 ${
                            domain.isActive 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-light-text-muted dark:text-dark-text-muted'
                          }`} />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">{domain.domain}</h3>
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            Status: <span className={`font-medium ${
                              domain.isActive 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-light-text-muted dark:text-dark-text-muted'
                            }`}>{domain.isActive ? 'Active' : 'Inactive'}</span>
                          </p>
                          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Added on {new Date(domain.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyScript(domain.domain)}
                          className="px-4 py-2 bg-light-secondary dark:bg-dark-tertiary text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors flex items-center gap-2 border border-light-border dark:border-dark-border"
                        >
                          {copiedScript === domain.domain ? (
                            <>
                              <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-green-600 dark:text-green-400">Copied!</span>
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
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                        >
                          <FaTrash className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Script Preview */}
                    <div className="mt-4 p-4 bg-gray-900 dark:bg-dark-surface rounded-xl border border-gray-700 dark:border-dark-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 dark:text-dark-text-secondary">Implementation Script</span>
                        <FaCode className="w-4 h-4 text-gray-400 dark:text-dark-text-secondary" />
                      </div>
                      <pre className="text-sm text-green-400 dark:text-green-300 overflow-x-auto scrollbar-thin">
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
            className="mt-12 bg-gradient-accent-light dark:bg-gradient-accent-dark rounded-2xl p-8 text-white text-center relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                  scale: [1.2, 1, 1.2]
                }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full"
              />
            </div>
            
            <div className="relative z-10">
              <motion.h3 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-4"
              >
                Need Help?
              </motion.h3>
              <p className="text-white/80 mb-6">
                Check out our documentation or contact support for assistance with implementation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/docs" className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 justify-center backdrop-blur-sm">
                    <FaCode className="w-4 h-4" />
                    Documentation
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/support" className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 justify-center backdrop-blur-sm">
                    <FaArrowRight className="w-4 h-4" />
                    Contact Support
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}