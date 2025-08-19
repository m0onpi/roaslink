'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ThemeToggle';

interface ExitHeatmapData {
  page: string;
  domain: string;
  totalExits: number;
  avgTimeOnPage: number;
  avgEngagement: number;
  avgScrollDepth: number;
  exits: any[];
}

interface ClickHeatmapData {
  page: string;
  domain: string;
  clicks: Array<{
    x: number;
    y: number;
    element: string;
    elementType: string;
    elementText: string;
  }>;
}

interface HeatmapAnalytics {
  exitHeatmap: ExitHeatmapData[];
  clickHeatmap: ClickHeatmapData[];
  conversions: Record<string, number>;
  summary: {
    totalExits: number;
    totalInteractions: number;
    totalConversions: number;
    timeRange: { days: number };
    domains: string[];
  };
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

export default function HeatmapPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [analytics, setAnalytics] = useState<HeatmapAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(7);

  useEffect(() => {
    checkUserAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchHeatmapData();
    }
  }, [hasAccess, selectedDomain, selectedPage, timeRange]);

  const checkUserAccess = async () => {
    try {
      const response = await fetch('/api/auth/check-access', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth?next=/heatmap');
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
      router.push('/auth?next=/heatmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    if (!hasAccess) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: timeRange.toString(),
        ...(selectedDomain && { domain: selectedDomain }),
        ...(selectedPage && { page: selectedPage }),
      });

      const response = await fetch(`/api/analytics/heatmap?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Heatmap data received:', data);
        setAnalytics(data);
      } else if (response.status === 401) {
        router.push('/auth?next=/heatmap');
      } else {
        console.error('Heatmap API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-strong p-8 rounded-2xl"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="mt-4 text-light-text dark:text-dark-text">Loading heatmap analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need an active subscription to access heatmap analytics.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
              <p className="text-sm text-gray-500">
                {user?.subscriptionStatus === 'trial' 
                  ? 'Upgrade your plan to unlock analytics'
                  : 'Please check your subscription status'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  const getExitIntensity = (exits: number, maxExits: number) => {
    const intensity = exits / maxExits;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-orange-500';
    if (intensity > 0.2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement < 3) return 'text-red-600';
    if (engagement < 7) return 'text-orange-600';
    if (engagement < 12) return 'text-yellow-600';
    return 'text-green-600';
  };

  const maxExits = Math.max(...analytics.exitHeatmap.map(e => e.totalExits), 1);

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/dashboard')}
              className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover font-medium transition-colors"
            >
              ← Back to Dashboard
            </motion.button>
            <span className="text-light-text-muted dark:text-dark-text-muted">|</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary">Heatmap Analytics</span>
            <div className="ml-auto">
              <ThemeToggle size="sm" />
            </div>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🔥 User Exit Heatmap</h1>
              <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                Discover where users abandon your site and optimize conversion paths
              </p>
            </div>
            
            {user && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-right glass p-4 rounded-xl"
              >
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Welcome back, <span className="font-semibold text-light-text dark:text-dark-text">{user.name}</span>
                </p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted capitalize">
                  {user.subscriptionStatus} • {user.planType}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input-field"
              >
                <option value="">All Domains</option>
                {analytics.summary.domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Page Filter
              </label>
              <input
                type="text"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                placeholder="e.g., /checkout"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="input-field"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchHeatmapData}
                className="btn-primary w-full"
              >
                Refresh Data
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { title: 'Total Exits', value: analytics.summary.totalExits, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500' },
            { title: 'Interactions', value: analytics.summary.totalInteractions, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500' },
            { title: 'Conversions', value: analytics.summary.totalConversions, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500' },
            { 
              title: 'Exit Rate', 
              value: `${analytics.summary.totalExits > 0 
                ? Math.round((analytics.summary.totalExits / (analytics.summary.totalExits + analytics.summary.totalConversions)) * 100)
                : 0}%`,
              color: 'text-orange-600 dark:text-orange-400',
              bgColor: 'bg-orange-500'
            }
          ].map((card, index) => (
            <motion.div 
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="card card-hover p-6 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 ${card.bgColor} rounded-full transform translate-x-8 -translate-y-8`} />
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2 relative z-10">
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${card.color} relative z-10`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Debug Info (temporary) */}
        {(analytics as any).debug && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-4 mb-8"
          >
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Debug Information</h3>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary space-y-1">
              <p>Total events in database: {(analytics as any).debug.totalEvents}</p>
              <p>Total sessions in database: {(analytics as any).debug.totalSessions}</p>
              <p>User domains: {(analytics as any).debug.userDomains}</p>
              <p>Raw exit events found: {(analytics as any).debug.rawExitEvents}</p>
              <p>Raw interaction events found: {(analytics as any).debug.rawInteractionEvents}</p>
            </div>
          </motion.div>
        )}

        {/* Exit Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">🔥 Exit Points Heatmap</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Low exits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Medium exits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">High exits</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.exitHeatmap.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No exit data available for the selected filters.</p>
            ) : (
              analytics.exitHeatmap
                .sort((a, b) => b.totalExits - a.totalExits)
                .map((exit, index) => (
                  <div key={`${exit.domain}${exit.page}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {exit.domain}{exit.page}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>
                            <span className={`font-semibold ${getEngagementColor(exit.avgEngagement)}`}>
                              {exit.avgEngagement.toFixed(1)}
                            </span> avg engagement
                          </span>
                          <span>{Math.round(exit.avgTimeOnPage / 1000)}s avg time</span>
                          <span>{Math.round(exit.avgScrollDepth)}% avg scroll</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getExitIntensity(exit.totalExits, maxExits)}`}>
                          {exit.totalExits} exits
                        </div>
                      </div>
                    </div>
                    
                    {/* Exit intensity bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getExitIntensity(exit.totalExits, maxExits)}`}
                        style={{ width: `${(exit.totalExits / maxExits) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Conversion comparison */}
                    {analytics.conversions[`${exit.domain}${exit.page}`] && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {analytics.conversions[`${exit.domain}${exit.page}`]} conversions on this page
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 Optimization Recommendations</h2>
          <div className="space-y-3 text-blue-800">
            {analytics.exitHeatmap.length > 0 && (
              <>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p>
                    <strong>High exit page:</strong> {analytics.exitHeatmap[0]?.domain}{analytics.exitHeatmap[0]?.page} 
                    has {analytics.exitHeatmap[0]?.totalExits} exits. Consider improving UX or adding conversion elements.
                  </p>
                </div>
                
                {analytics.exitHeatmap.some(e => e.avgEngagement < 5) && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <p>
                      <strong>Low engagement detected:</strong> Some pages have very low engagement scores. 
                      Consider improving content quality or page loading speed.
                    </p>
                  </div>
                )}
                
                {analytics.exitHeatmap.some(e => e.avgScrollDepth < 25) && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <p>
                      <strong>Poor scroll depth:</strong> Users aren't scrolling much on some pages. 
                      Consider moving important content above the fold.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
