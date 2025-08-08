import Script from 'next/script';

export default function TestCoUkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Script 
        src="https://xrepo.fyi/api/redirect?target=https://example.co.uk&debug=true"
        async
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            .co.uk Domain Test
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This page tests redirect functionality specifically for .co.uk domains.
            Target: https://example.co.uk
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Debug Information
            </h2>
            <div className="text-left space-y-4 text-gray-700">
              <div>
                <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
              </div>
              <div>
                <strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}
              </div>
              <div>
                <strong>Target Domain:</strong> example.co.uk
              </div>
              <div>
                <strong>Debug Mode:</strong> Enabled
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Testing Steps
            </h3>
            <ol className="text-left space-y-2 text-blue-800">
              <li>1. Open this page in an in-app browser (Instagram, Facebook, etc.)</li>
              <li>2. Open developer console (F12) and look for debug messages</li>
              <li>3. Check if the redirect attempts to go to example.co.uk</li>
              <li>4. Note any errors or issues in the console</li>
            </ol>
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