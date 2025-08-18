'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</button>
              <button onClick={() => router.push('/tracking')} className="text-gray-600 hover:text-gray-900 transition-colors">Tracking Script</button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Website Analytics</h1>
            <p className="text-lg text-gray-600">
              Understand user behavior and identify where visitors exit your site
            </p>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="domain-select" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                id="domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Sessions</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.totalSessions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Duration</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatDuration(analytics.summary.averageDuration)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Pages/Session</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.averagePageCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Events</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.totalEvents}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Exit Pages */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Exit Pages</h3>
                <div className="space-y-3">
                  {analytics.exitPages.slice(0, 5).map((exitPage, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-4">{exitPage.page}</span>
                      <span className="text-sm font-medium text-gray-900">{exitPage.count} exits</span>
                    </div>
                  ))}
                  {analytics.exitPages.length === 0 && (
                    <p className="text-gray-500 text-sm">No exit data available</p>
                  )}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Most Visited Pages</h3>
                <div className="space-y-3">
                  {analytics.pageViews.slice(0, 5).map((pageView, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-4">{pageView.page}</span>
                      <span className="text-sm font-medium text-gray-900">{pageView.count} views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Types */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
                <div className="space-y-3">
                  {analytics.eventTypes.map((eventType, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{eventType.type.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{eventType.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity (Last 24 Hours)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {analytics.hourlyActivity.slice(-12).map((hour, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{hour.hour}:00</div>
                      <div className="bg-blue-100 rounded-sm h-8 flex items-end justify-center">
                        <div 
                          className="bg-blue-600 w-full rounded-sm"
                          style={{ 
                            height: `${Math.max(4, (hour.count / Math.max(...analytics.hourlyActivity.map(h => h.count), 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-700 mt-1">{hour.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
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
