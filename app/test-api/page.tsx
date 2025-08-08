'use client';

import Script from 'next/script';

export default function TestApiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Script 
        src="/api/redirect?target=https://justicevaleting.co.uk"
        async
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            API Route Test
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Testing the redirect API with justicevaleting.co.uk
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Test Configuration
            </h2>
            <div className="text-left space-y-3 text-gray-700">
              <p><strong>API Endpoint:</strong> /api/redirect?target=https://justicevaleting.co.uk</p>
              <p><strong>Target Domain:</strong> justicevaleting.co.uk</p>
              <p><strong>Expected Behavior:</strong> Redirect from in-app browsers to native browser</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Current Status
            </h3>
            <p className="text-blue-700">
              If you're seeing this message, you're either in a native browser or the redirect hasn't triggered yet.
              Try opening this page in Instagram, Facebook, or any other in-app browser to test the redirect.
            </p>
          </div>
          
          <div className="mt-8">
            <a 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 