'use client';

import { useRouter } from 'next/navigation';
import { FaChartLine, FaChartBar, FaCalendar, FaArrowRight, FaStar, FaUsers, FaShieldAlt, FaBolt, FaGraduationCap, FaBullseye, FaClock, FaDollarSign, FaHeart, FaTrophy, FaLightbulb, FaGlobe, FaCalendarAlt, FaCog, FaBook, FaBell, FaCode, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              RoasLink
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Universal In-App Browser Redirect Solution
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Seamlessly redirect users from in-app browsers to native browsers. 
              Increase conversion rates by 40% with our intelligent redirect solution.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Quick Implementation
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Step 1: Add to your layout head
                </h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`<head>
  <script 
    src="https://your-domain.com/api/redirect?target=https://your-target-domain.com"
    async
  ></script>
</head>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Step 2: Replace with your domains
                </h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>your-domain.com</strong> - Your RoasLink API domain
                  </p>
                  <p className="text-gray-700">
                    <strong>your-target-domain.com</strong> - The domain you want users to be redirected to
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Example Implementation
                </h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`<!-- In your layout.html or _document.js -->
<head>
  <script 
    src="https://roaslink.co.uk/api/redirect?target=https://myapp.com"
    async
  ></script>
</head>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                How It Works
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  Detects if user is in an in-app browser (Instagram, Facebook, etc.)
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  Attempts to open the link in the native browser
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  Shows a fallback UI if automatic redirect fails
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  Preserves the current page path in the redirect
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Supported Platforms
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Instagram in-app browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Facebook in-app browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Twitter in-app browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  TikTok in-app browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  WhatsApp in-app browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Snapchat in-app browser
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Test the Implementation
            </h3>
            <p className="text-gray-700 mb-6">
              Try this script on your website to see how it works:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`<script 
  src="https://roaslink.co.uk/api/redirect?target=https://example.com"
  async
></script>`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Open this page in Instagram, Facebook, or any other in-app browser to test the redirect functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 