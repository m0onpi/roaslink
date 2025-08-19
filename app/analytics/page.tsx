'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ThemeToggle';

interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
}

interface Session {
  id: string;
  sessionId: string;
  domain: string;
  userAgent: string | null;
  referrer: string | null;
  startTime: string;
  endTime: string | null;
  lastActivity: string;
  exitPage: string | null;
  pageCount: number;
  duration: number | null;
  isActive: boolean;
  events: Event[];
  domainOwner: {
    domain: string;
  };
}

interface Event {
  id: string;
  eventType: string;
  page: string;
  element: string | null;
  data: any;
  timestamp: string;
}

interface Analytics {
  sessions: Session[];
  summary: {
    totalSessions: number;
    averageDuration: number;
    averagePageCount: number;
    totalEvents: number;
  };
  exitPages: Array<{ page: string; count: number }>;
  eventTypes: Array<{ type: string; count: number }>;
  pageViews: Array<{ page: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDomains();
    // Set default date range (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [selectedDomain, startDate, endDate]);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains);
      } else if (response.status === 401) {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDomain) params.append('domainId', selectedDomain);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 401) {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getBrowserFromUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-strong p-8 rounded-2xl"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="mt-4 text-light-text dark:text-dark-text">Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      {/* Navigation */}
      <header className="glass border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-accent-light dark:bg-gradient-accent-dark rounded-xl flex items-center justify-center shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"/>
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/dashboard')} 
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                Dashboard
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/tracking')} 
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                Tracking Script
              </motion.button>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">Website Analytics</h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Understand user behavior and identify where visitors exit your site
            </p>
          </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="domain-select" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Domain
              </label>
              <select
                id="domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input-field"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchAnalytics}
                className="btn-primary w-full"
              >
                Refresh Data
              </motion.button>
            </div>
          </div>
        </motion.div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              {[
                { title: 'Total Sessions', value: analytics.summary.totalSessions, color: 'text-blue-600 dark:text-blue-400' },
                { title: 'Avg Duration', value: formatDuration(analytics.summary.averageDuration), color: 'text-green-600 dark:text-green-400' },
                { title: 'Avg Pages/Session', value: analytics.summary.averagePageCount, color: 'text-purple-600 dark:text-purple-400' },
                { title: 'Total Events', value: analytics.summary.totalEvents, color: 'text-orange-600 dark:text-orange-400' }
              ].map((card, index) => (
                <motion.div 
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="card card-hover p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <div className={`w-full h-full rounded-full ${card.color.replace('text-', 'bg-').replace('dark:', '').split(' ')[0]}`} />
                  </div>
                  <h3 className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wide relative z-10">
                    {card.title}
                  </h3>
                  <p className={`text-3xl font-bold mt-2 ${card.color} relative z-10`}>
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            >
              {/* Top Exit Pages */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Top Exit Pages</h3>
                <div className="space-y-3">
                  {analytics.exitPages.slice(0, 5).map((exitPage, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                    >
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate flex-1 mr-4">{exitPage.page}</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        {exitPage.count} exits
                      </span>
                    </motion.div>
                  ))}
                  {analytics.exitPages.length === 0 && (
                    <p className="text-light-text-muted dark:text-dark-text-muted text-sm text-center py-4">No exit data available</p>
                  )}
                </div>
              </div>

              {/* Top Pages */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Most Visited Pages</h3>
                <div className="space-y-3">
                  {analytics.pageViews.slice(0, 5).map((pageView, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                    >
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate flex-1 mr-4">{pageView.page}</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        {pageView.count} views
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Event Types */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Event Types</h3>
                <div className="space-y-3">
                  {analytics.eventTypes.map((eventType, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                    >
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize">{eventType.type.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-tertiary px-2 py-1 rounded-full">
                        {eventType.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hourly Activity */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Activity (Last 24 Hours)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {analytics.hourlyActivity.slice(-12).map((hour, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="text-center"
                    >
                      <div className="text-xs text-light-text-muted dark:text-dark-text-muted mb-1">{hour.hour}:00</div>
                      <div className="bg-light-secondary dark:bg-dark-tertiary rounded-sm h-8 flex items-end justify-center">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(4, (hour.count / Math.max(...analytics.hourlyActivity.map(h => h.count), 1)) * 100)}%` }}
                          transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                          className="bg-light-accent dark:bg-dark-accent w-full rounded-sm"
                        />
                      </div>
                      <div className="text-xs text-light-text dark:text-dark-text mt-1">{hour.count}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text">Recent Sessions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exit Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Browser
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.sessions.slice(0, 20).map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatTimestamp(session.startTime)}</div>
                          <div className="text-xs text-gray-500">{session.sessionId.slice(-8)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.domainOwner.domain}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(session.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.pageCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {session.exitPage || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getBrowserFromUserAgent(session.userAgent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Session Details Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Session Details</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Session Info</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>ID:</strong> {selectedSession.sessionId}</p>
                      <p><strong>Domain:</strong> {selectedSession.domainOwner.domain}</p>
                      <p><strong>Start:</strong> {formatTimestamp(selectedSession.startTime)}</p>
                      <p><strong>Duration:</strong> {formatDuration(selectedSession.duration)}</p>
                      <p><strong>Pages:</strong> {selectedSession.pageCount}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Info</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Browser:</strong> {getBrowserFromUserAgent(selectedSession.userAgent)}</p>
                      <p><strong>Referrer:</strong> {selectedSession.referrer || 'Direct'}</p>
                      <p><strong>Exit Page:</strong> {selectedSession.exitPage || 'N/A'}</p>
                      <p><strong>Status:</strong> {selectedSession.isActive ? 'Active' : 'Ended'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Event Timeline</h4>
                  <div className="space-y-3">
                    {selectedSession.events.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {event.eventType.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-600">{event.page}</p>
                              {event.element && (
                                <p className="text-xs text-gray-500">Element: {event.element}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
