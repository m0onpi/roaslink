import Script from 'next/script';

export default function TroubleshootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <Script 
        src="https://roaslink.co.uk/api/redirect?target=https://example.com&debug=true"
        async
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              RoasLink Troubleshooting
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Debug why the redirect script works on one website but not another
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Debug Mode Active
            </h2>
            <p className="text-gray-700 mb-6">
              This page has debug mode enabled. Open your browser's developer console (F12) 
              and look for messages starting with "[RoasLink Debug]" to see what's happening.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How to Check Console:</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Press F12 or right-click and select "Inspect"</li>
                <li>• Go to the "Console" tab</li>
                <li>• Look for messages starting with "[RoasLink Debug]"</li>
                <li>• Share these messages to help diagnose the issue</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Common Issues
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <div>
                    <strong>Script not loading:</strong> Check if the script URL is accessible and returns JavaScript
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <div>
                    <strong>User agent detection:</strong> The script might not recognize the in-app browser
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <strong>Domain mismatch:</strong> Target domain might not match the current domain
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <div>
                    <strong>JavaScript errors:</strong> Other scripts on the page might be interfering
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Testing Steps
              </h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  Open this page in an in-app browser (Instagram, Facebook, etc.)
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  Open developer console and check for debug messages
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  Note the user agent string and redirect decisions
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  Compare with the working website's behavior
                </li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Debug Script Implementation
            </h3>
            <p className="text-gray-700 mb-4">
              To debug on your website, add the debug parameter:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`<script 
  src="https://roaslink.co.uk/api/redirect?target=https://your-domain.com&debug=true"
  async
></script>`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              This will log detailed information to the console about what the script is detecting and doing.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What to Check
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. Script Loading</h4>
                <p className="text-gray-700 text-sm">
                  Check if you see "[RoasLink Debug] Script loaded on: [URL]" in the console. 
                  If not, the script isn't loading properly.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. User Agent Detection</h4>
                <p className="text-gray-700 text-sm">
                  Look for the user agent string and whether it's detected as native browser or in-app browser.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. Redirect Attempts</h4>
                <p className="text-gray-700 text-sm">
                  Check if the script attempts to redirect and what method it uses (iOS/Android/Default).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">4. Fallback UI</h4>
                <p className="text-gray-700 text-sm">
                  If automatic redirect fails, you should see a fallback UI appear.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
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