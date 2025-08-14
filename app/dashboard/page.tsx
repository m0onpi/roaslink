'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaGlobe, FaCopy, FaTrash, FaCode, FaCheckCircle, FaArrowRight, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Domain {
  id: string;
  domain: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedScript, setCopiedScript] = useState('');

  useEffect(() => {
    // Simulate loading domains
    setTimeout(() => {
      setDomains([
        { id: '1', domain: 'mywebsite.com', createdAt: '2024-01-15' },
        { id: '2', domain: 'store.example.com', createdAt: '2024-01-10' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAddingDomain(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const domain: Domain = {
        id: Date.now().toString(),
        domain: newDomain.trim(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setDomains([...domains, domain]);
      setNewDomain('');
    } catch (err) {
      setError('Failed to add domain');
    } finally {
      setIsAddingDomain(false);
    }
  };

  const removeDomain = (id: string) => {
    setDomains(domains.filter(d => d.id !== id));
  };

  const copyScript = (domain: string) => {
    const script = `<script src="https://roaslink.co.uk/api/redirect?target=https://${domain}" async></script>`;
    navigator.clipboard.writeText(script);
    setCopiedScript(domain);
    setTimeout(() => setCopiedScript(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your dashboard...</div>
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
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Upgrade</Link>
              <button 
                onClick={() => router.push('/')}
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
              Welcome to your Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage your domains and redirect scripts from here
            </p>
          </motion.div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Add Domain Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Domain</h2>
            <form onSubmit={addDomain} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isAddingDomain}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isAddingDomain
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {isAddingDomain ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <FaPlus className="w-4 h-4" />
                )}
                {isAddingDomain ? 'Adding...' : 'Add Domain'}
              </motion.button>
            </form>
          </motion.div>

          {/* Domains List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Domains</h2>
            
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FaGlobe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                          <p className="text-sm text-gray-500">Added on {domain.createdAt}</p>
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