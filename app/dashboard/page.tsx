'use client';

import { useState } from 'react';
import { FaCopy, FaCheck, FaCode, FaRocket, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function Dashboard() {
  const [domain, setDomain] = useState('');
  const [copied, setCopied] = useState(false);

  // Get the production domain
  const getProductionDomain = () => {
    if (typeof window !== 'undefined') {
      // Use environment variable or fallback to current origin
      return process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || window.location.origin;
    }
    return process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'https://smartredirect.com';
  };

  const generateScript = () => {
    if (!domain) return '';
    
    // Clean the domain (remove http/https if provided)
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    const targetUrl = `https://${cleanDomain}`;
    const productionDomain = getProductionDomain();
    
    return `<script src="${productionDomain}/api/redirect?domain=${encodeURIComponent(cleanDomain)}&target=${encodeURIComponent(targetUrl)}"></script>`;
  };

  const copyToClipboard = async () => {
    const script = generateScript();
    if (script) {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testUrl = domain ? `https://${domain.replace(/^https?:\/\//, '')}/demo` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
          >
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
            Get Your Redirect Script
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Enter your domain name and get a script that redirects users from in-app browsers to your native browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Configuration Form */}
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Your Domain</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Domain Name</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Enter your domain (e.g., mysite.com, shop.com)
                </p>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-semibold mb-2">What this does:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Detects when users are in Instagram/Facebook/Twitter browsers</li>
                  <li>• Redirects them to your native browser</li>
                  <li>• Preserves the current page they're viewing</li>
                  <li>• Improves user experience and conversion rates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Code */}
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Implementation</h2>
            
            {domain ? (
              <div>
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
{generateScript()}
                  </pre>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-2">Instructions:</h4>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Copy the script above</li>
                    <li>2. Add it to your website's &lt;head&gt; section</li>
                    <li>3. Test by sharing your website on social media</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <FaCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your domain to generate the script</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Section */}
        {testUrl && (
          <div className="mt-12 bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Test Your Implementation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Test URL</h3>
                <p className="text-gray-400 mb-4">
                  Share this URL on social media to test your redirect:
                </p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <code className="text-blue-400 text-sm break-all">{testUrl}</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Testing Steps</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    Share the test URL on Instagram, Facebook, or Twitter
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    Click the link from the in-app browser
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    Verify you're redirected to your native browser
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <a
                href={testUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaExternalLinkAlt className="mr-2" />
                Open Test URL
              </a>
              
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaRocket className="mr-2" />
                View Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
