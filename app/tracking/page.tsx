'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
}

export default function TrackingPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDomains();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const generateScript = async () => {
    if (!selectedDomain) return;

    setIsGenerating(true);
    try {
      const domain = domains.find(d => d.id === selectedDomain);
      if (!domain) return;

      const url = `/api/tracking/script?domain=${encodeURIComponent(domain.domain)}${debugMode ? '&debug=true' : ''}`;
      
      const scriptTag = `<!-- SmartDirect Tracking Script -->
<script src="${window.location.origin}${url}"></script>
<!-- End SmartDirect Tracking Script -->`;

      setGeneratedScript(scriptTag);
    } catch (error) {
      console.error('Failed to generate script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</button>
              <button onClick={() => router.push('/analytics')} className="text-gray-600 hover:text-gray-900 transition-colors">Analytics</button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Website Tracking Script</h1>
            <p className="text-lg text-gray-600">
              Monitor user behavior, track where visitors get stuck, and understand how users navigate your website.
            </p>
          </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {domains.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have any domains set up yet.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Domain
              </button>
            </div>
          ) : (
            <>
              {/* Domain Selection */}
              <div className="mb-6">
                <label htmlFor="domain-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Domain
                </label>
                <select
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a domain...</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id} disabled={!domain.isActive}>
                      {domain.domain} {!domain.isActive && '(Inactive)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Debug Mode Toggle */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable debug mode (shows console logs)
                  </span>
                </label>
              </div>

              {/* Generate Button */}
              <div className="mb-6">
                <button
                  onClick={generateScript}
                  disabled={!selectedDomain || isGenerating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate Tracking Script'}
                </button>
              </div>

              {/* Generated Script */}
              {generatedScript && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Your Tracking Script</h3>
                    <button
                      onClick={copyToClipboard}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                      {generatedScript}
                    </pre>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Installation Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                      <li>Copy the script above</li>
                      <li>Paste it in the &lt;head&gt; section of your website</li>
                      <li>Deploy your changes</li>
                      <li>The script will automatically start tracking user behavior</li>
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What This Tracking Script Monitors:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">User Behavior</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Page views and navigation</li>
                <li>• Time spent on each page</li>
                <li>• Scroll depth and engagement</li>
                <li>• Form submissions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Exit Points</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Where users leave your site</li>
                <li>• Session duration</li>
                <li>• Click tracking</li>
                <li>• Tab switching detection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Privacy Notice</h4>
          <p className="text-sm text-yellow-700">
            This tracking script collects anonymous usage data to help you understand user behavior. 
            No personally identifiable information is collected. Make sure to comply with your local 
            privacy laws and update your privacy policy accordingly.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
