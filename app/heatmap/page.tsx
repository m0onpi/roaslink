'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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

export default function HeatmapPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<HeatmapAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(7);

  const fetchHeatmapData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: timeRange.toString(),
        ...(selectedDomain && { domain: selectedDomain }),
        ...(selectedPage && { page: selectedPage }),
      });

      const response = await fetch(`/api/analytics/heatmap?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [token, selectedDomain, selectedPage, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading heatmap analytics...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Exit Heatmap</h1>
          <p className="mt-2 text-gray-600">
            Discover where users abandon your site and optimize conversion paths
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Domains</option>
                {analytics.summary.domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Filter
              </label>
              <input
                type="text"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                placeholder="e.g., /checkout"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchHeatmapData}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Exits</h3>
            <p className="text-3xl font-bold text-red-600">{analytics.summary.totalExits}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactions</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.summary.totalInteractions}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversions</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.summary.totalConversions}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Rate</h3>
            <p className="text-3xl font-bold text-orange-600">
              {analytics.summary.totalExits > 0 
                ? Math.round((analytics.summary.totalExits / (analytics.summary.totalExits + analytics.summary.totalConversions)) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Exit Heatmap */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Exit Points Heatmap</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Low exits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>Medium exits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                <span>High exits</span>
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
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6">
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
        </div>
      </div>
    </div>
  );
}
