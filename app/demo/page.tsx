'use client';

import Script from 'next/script';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Script 
        src="https://roaslink.co.uk/api/redirect?target=https://example.com"
        async
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            RoasLink Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This page demonstrates the redirect functionality. 
            If you're viewing this in an in-app browser (Instagram, Facebook, etc.), 
            you should be redirected to example.com.
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Test
            </h2>
            <ol className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                Share this page link on Instagram, Facebook, or Twitter
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                Open the link from the in-app browser
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                You should be redirected to example.com in your native browser
              </li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Current Status
            </h3>
            <p className="text-blue-700">
              If you're seeing this message, you're either in a native browser or the redirect hasn't triggered yet.
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
