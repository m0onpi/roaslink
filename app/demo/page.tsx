'use client';

import RedirectScript from '../components/RedirectScript';
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      {/* Redirect Script - This will redirect users from in-app browsers */}
      <RedirectScript 
        targetDomain="https://tradelogger.dev"
        fallbackUI={true}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
            Redirect Script Demo
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            This page demonstrates the SmartRedirect script in action. 
            If you're viewing this from an in-app browser (Instagram, Facebook, etc.), 
            you should be redirected to your native browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-100 mb-4">How It Works</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Detects if you're in an in-app browser
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Preserves your current page path
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Redirects to native browser automatically
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Shows fallback UI if automatic redirect fails
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-100 mb-4">Implementation</h3>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<script src="https://xrepo.fyi/api/redirect?domain=yourdomain.com&target=https://yourdomain.com"></script>`}

              </pre>
            </div>
            <p className="text-gray-400 text-sm">
              Add this single line to your website's &lt;head&gt; section and 
              users will automatically be redirected from in-app browsers.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">
            Test the Redirect
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Try sharing this page on social media and clicking the link from an in-app browser.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://tradelogger.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-blue-500/30 transition-all duration-300"
            >
              Visit Target Domain
              <FaExternalLinkAlt className="ml-2" />
            </a>
            
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 text-gray-400 border border-gray-500/30 rounded-xl hover:from-gray-600/30 hover:to-gray-500/30 transition-all duration-300"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
