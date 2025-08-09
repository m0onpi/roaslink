'use client';

import { useRouter } from 'next/navigation';
import { FaChartLine, FaChartBar, FaCalendar, FaArrowRight, FaStar, FaUsers, FaShieldAlt, FaBolt, FaGraduationCap, FaBullseye, FaClock, FaDollarSign, FaHeart, FaTrophy, FaLightbulb, FaGlobe, FaCalendarAlt, FaCog, FaBook, FaBell, FaCode, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-100 mb-4">RoasLink</h1>
            <p className="text-xl text-gray-300 mb-6">Universal In-App Browser Redirect Solution</p>
            <p className="text-lg text-gray-300/90 max-w-2xl mx-auto mb-8">
              Seamlessly redirect users from in-app browsers to native browsers.
              Increase conversion rates by 40% with our intelligent redirect solution.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/pricing" className="px-5 py-3 rounded-xl bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30 transition-colors">View pricing</Link>
              <Link href="/signup" className="px-5 py-3 rounded-xl bg-gray-600/20 text-gray-200 border border-gray-500/30 hover:bg-gray-600/30 transition-colors">Get started</Link>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-2xl border border-gray-700/50 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">
              Quick Implementation
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3">
                  Step 1: Add to your layout head
                </h3>
                <div className="bg-[#1a1a1a] text-green-400 p-4 rounded-lg overflow-x-auto border border-gray-700/50">
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
                <h3 className="text-xl font-semibold text-gray-200 mb-3">
                  Step 2: Replace with your domains
                </h3>
                <div className="bg-[#1a1a1a] border border-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold text-gray-100">your-domain.com</span> - Your RoasLink API domain
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-gray-100">your-target-domain.com</span> - The domain you want users to be redirected to
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3">
                  Example Implementation
                </h3>
                <div className="bg-[#1a1a1a] text-green-400 p-4 rounded-lg overflow-x-auto border border-gray-700/50">
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
            <div className="bg-[#2a2a2a] rounded-2xl border border-gray-700/50 p-8">
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                How It Works
              </h3>
              <ul className="space-y-3 text-gray-300">
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

            <div className="bg-[#2a2a2a] rounded-2xl border border-gray-700/50 p-8">
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                Supported Platforms
              </h3>
              <ul className="space-y-3 text-gray-300">
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

          <div className="bg-[#2a2a2a] rounded-2xl border border-gray-700/50 p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-100 mb-4">
              Test the Implementation
            </h3>
            <p className="text-gray-300 mb-6">
              Try this script on your website to see how it works:
            </p>
            <div className="bg-[#1a1a1a] text-green-400 p-4 rounded-lg overflow-x-auto border border-gray-700/50">
              <pre className="text-sm">
{`<script 
  src="https://roaslink.co.uk/api/redirect?target=https://example.com"
  async
></script>`}
              </pre>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Open this page in Instagram, Facebook, or any other in-app browser to test the redirect functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 