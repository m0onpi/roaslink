'use client';

import { useRouter } from 'next/navigation';
import { FaChartLine, FaChartBar, FaCalendar, FaArrowRight, FaStar, FaUsers, FaShieldAlt, FaBolt, FaGraduationCap, FaBullseye, FaClock, FaDollarSign, FaHeart, FaTrophy, FaLightbulb, FaGlobe, FaCalendarAlt, FaCog, FaBook, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <motion.div 
              key={`v-line-${i}`} 
              className="border-r border-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <motion.div 
              key={`h-line-${i}`} 
              className="border-b border-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Increase conversion rates by 40%
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
                Universal In-App Browser
                <span className="block text-blue-400">Redirect Solution</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Seamlessly redirect users from social media in-app browsers to native browsers. 
                Improve user experience and boost conversion rates with our intelligent redirect technology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Start Free Trial
                <FaArrowRight className="ml-2" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 text-gray-400 border border-gray-500/30 rounded-xl hover:from-gray-600/30 hover:to-gray-500/30 transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
              >
                View Demo
                <FaArrowRight className="ml-2" />
              </motion.button>
            </div>

            {/* Implementation Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-6 max-w-2xl mx-auto border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Implementation</span>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Copy Code</button>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<script src="https://cdn.smartredirect.com/v1/redirect.js"
        data-domain="yourdomain.com"
        data-target="https://yourdomain.com"></script>`}
              </pre>
            </motion.div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center">
                <FaShieldAlt className="w-5 h-5 mr-2" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center">
                <FaGlobe className="w-5 h-5 mr-2" />
                <span>Global CDN</span>
              </div>
              <div className="flex items-center">
                <FaClock className="w-5 h-5 mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gradient-to-br from-[#2a2a2a]/30 to-[#3a3a3a]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Why Choose SmartRedirect?</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Transform your user experience with our intelligent redirect solution designed specifically for businesses that want to improve conversion rates from social media traffic.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaBolt className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "One-line implementation that works instantly across all platforms.",
                color: "blue"
              },
              {
                icon: <FaShieldAlt className="w-8 h-8" />,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with 99.9% uptime guarantee.",
                color: "green"
              },
              {
                icon: <FaUsers className="w-8 h-8" />,
                title: "Universal Support",
                description: "Works with Instagram, Facebook, Twitter, and all major platforms.",
                color: "purple"
              },
              {
                icon: <FaStar className="w-8 h-8" />,
                title: "Proven Results",
                description: "Average 40% increase in conversion rates for our customers.",
                color: "yellow"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="text-center bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-${benefit.color}-500/20 text-${benefit.color}-400 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-[#2a2a2a]/50 to-[#1a1a1a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Powerful Features for Maximum Impact</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Everything you need to seamlessly redirect users and improve conversion rates across all platforms and devices.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <FaChartLine className="w-6 h-6" />,
                title: "Intelligent Detection",
                description: "Automatically detects in-app browsers vs native browsers. Only redirects when beneficial to user experience. Supports Instagram, Facebook, Twitter, WhatsApp, and more.",
                color: "blue"
              },
              {
                icon: <FaChartBar className="w-6 h-6" />,
                title: "Platform Optimized",
                description: "Different strategies for iOS, Android, and Desktop. Optimized redirects for each platform's native browser with seamless user experience.",
                color: "green"
              },
              {
                icon: <FaCalendar className="w-6 h-6" />,
                title: "Path Preservation",
                description: "Maintains user's current page and query parameters during redirect. Seamless experience without losing context or breaking user flow.",
                color: "purple"
              },
              {
                icon: <FaArrowRight className="w-6 h-6 rotate-90" />,
                title: "Analytics Dashboard",
                description: "Track redirect performance, success rates, and user behavior. Optimize your conversion funnel with detailed insights and real-time metrics.",
                color: "yellow"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] p-8 rounded-2xl border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-12 h-12 bg-${feature.color}-500/20 text-${feature.color}-400 rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-400">Choose the plan that fits your needs. All plans include a 14-day free trial.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$9",
                period: "per month",
                description: "Perfect for small websites and personal projects",
                features: ["Basic redirect functionality", "1 domain", "Standard analytics", "Email support", "Path preservation", "Mobile optimization"],
                cta: "Start Free Trial",
                popular: false
              },
              {
                name: "Professional",
                price: "$29",
                period: "per month",
                description: "Ideal for growing businesses and e-commerce sites",
                features: ["Advanced detection algorithms", "5 domains", "Custom fallback UI", "A/B testing", "Priority support", "Advanced analytics", "White-label options", "API access"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$99",
                period: "per month",
                description: "For large organizations with multiple properties",
                features: ["Unlimited domains", "White-label solution", "Custom integrations", "Dedicated support", "Advanced analytics", "SLA guarantee", "Custom development", "On-premise option"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 relative ${plan.popular ? 'border-blue-500/50 shadow-blue-500/25' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-100">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <FaStar className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/30 hover:from-blue-600/30 hover:to-blue-500/30' 
                      : 'bg-gradient-to-r from-gray-600/20 to-gray-500/20 text-gray-400 border border-gray-500/30 hover:from-gray-600/30 hover:to-gray-500/30'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Ready to Boost Your Conversion Rates?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of businesses that are already improving their user experience with our platform. Start redirecting users seamlessly today and see the difference it makes in your conversion rates.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Start Free Trial
              <FaArrowRight className="ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800/50 pt-8 text-center text-gray-400 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          {[
            { href: "#", label: "Features", color: "text-blue-400" },
            { href: "#", label: "How It Works" },
            { href: "#", label: "Pricing" },
            { href: "#", label: "Implementation" },
            { href: "#", label: "Documentation" },
            { href: "#", label: "Privacy Policy" },
            { href: "#", label: "Terms" }
          ].map((link) => (
            <Link 
              key={link.label}
              href={link.href} 
              className={`hover:underline transition-colors duration-300 ${link.color || 'hover:text-gray-300'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <span>© {new Date().getFullYear()} SmartRedirect</span>
        </div>
      </footer>
    </div>
  );
} 