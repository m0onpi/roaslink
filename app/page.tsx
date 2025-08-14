'use client';

import { useRouter } from 'next/navigation';
import { FaCode, FaRocket, FaShieldAlt, FaBolt, FaCheckCircle, FaArrowRight, FaGlobe, FaUsers, FaStar, FaChartLine, FaPlay, FaCopy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('<script src="https://roaslink.co.uk/api/redirect?target=https://yoursite.com" async></script>');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaRocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoasLink</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FaBolt className="w-4 h-4" />
                One-line integration
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Redirect Users from
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  In-App Browsers
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Increase conversion rates by 40% with our intelligent redirect solution.
                One line of code redirects users from Instagram, Facebook, TikTok browsers to your native app.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                  <FaRocket className="w-5 h-5" />
                  Start Free Trial
                </Link>
                <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <FaPlay className="w-4 h-4" />
                  View Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* One-Line Implementation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Implementation in 30 Seconds
            </h2>
              <p className="text-lg text-gray-600">
                Just add one line to your website's head tag. That's it.
              </p>
            </motion.div>

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaCopy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-green-400 text-sm md:text-base overflow-x-auto">
{`<head>
  <script 
    src="https://roaslink.co.uk/api/redirect?target=https://yoursite.com"
    async
  ></script>
</head>`}
                  </pre>
                </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaCode className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Script</h3>
                <p className="text-gray-600 text-sm">Insert the script tag in your HTML head</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaGlobe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Replace URL</h3>
                <p className="text-gray-600 text-sm">Change target to your website URL</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Done!</h3>
                <p className="text-gray-600 text-sm">Users will redirect automatically</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Smart detection and seamless redirection in 4 simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FaShieldAlt className="w-8 h-8" />,
                  title: "Smart Detection",
                  description: "Automatically detects Instagram, Facebook, TikTok, and other in-app browsers",
                  color: "blue"
                },
                {
                  icon: <FaRocket className="w-8 h-8" />,
                  title: "Native Redirect",
                  description: "Attempts to open your link in the user's native browser for better experience",
                  color: "purple"
                },
                {
                  icon: <FaUsers className="w-8 h-8" />,
                  title: "Fallback UI",
                  description: "Shows helpful instructions if automatic redirect fails",
                  color: "green"
                },
                {
                  icon: <FaGlobe className="w-8 h-8" />,
                  title: "Path Preservation",
                  description: "Maintains the current page path in the redirect URL",
                  color: "orange"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`w-16 h-16 bg-${step.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <div className={`text-${step.color}-600`}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Works on All Major Platforms
              </h2>
              <p className="text-lg text-gray-600">
                Compatible with all popular social media in-app browsers
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: "Instagram", users: "2B+ users" },
                { name: "Facebook", users: "3B+ users" },
                { name: "TikTok", users: "1B+ users" },
                { name: "Twitter", users: "450M+ users" },
                { name: "WhatsApp", users: "2B+ users" },
                { name: "Snapchat", users: "750M+ users" }
              ].map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mx-auto mb-3"></div>
                  <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
                  <p className="text-sm text-gray-500">{platform.users}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12">
                Boost Your Conversion Rates
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">40%</div>
                  <p className="text-blue-100">Increase in conversion rates</p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">50M+</div>
                  <p className="text-blue-100">Redirects processed daily</p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
                  <p className="text-blue-100">Uptime reliability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Increase Your Conversions?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of websites already using RoasLink to redirect users and boost conversions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                  <FaRocket className="w-5 h-5" />
                  Start Free Trial
                </Link>
                <Link href="/checkout" className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-colors">
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaRocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">RoasLink</span>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-400">
            <p>&copy; 2024 RoasLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 