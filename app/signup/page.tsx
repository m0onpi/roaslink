'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaRocket, FaUser, FaEnvelope, FaLock, FaCheck, FaChartLine, FaBullseye, FaClock, FaDollarSign, FaGraduationCap, FaBriefcase, FaHeart, FaStar, FaTrophy, FaShieldAlt, FaLightbulb, FaUsers, FaGlobe, FaCalendarAlt, FaChartBar, FaCog, FaEye, FaEyeSlash, FaBook, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionnaireData {
  experience: string;
  tradingStyle: string;
  goals: string;
  timeCommitment: string;
  riskTolerance: string;
  preferredMarkets: string[];
  tradingFrequency: string;
  currentTools: string[];
  motivation: string;
  challenges: string[];
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'questionnaire' | 'signup' | 'verify'>('questionnaire');
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    experience: '',
    tradingStyle: '',
    goals: '',
    timeCommitment: '',
    riskTolerance: '',
    preferredMarkets: [],
    tradingFrequency: '',
    currentTools: [],
    motivation: '',
    challenges: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get('next');
    setNextPath(next);
  }, [searchParams]);

  const questionnaireSteps = [
    {
      title: "Trading Experience",
      subtitle: "How long have you been trading?",
      icon: <FaGraduationCap className="w-6 h-6" />,
      options: [
        { value: 'beginner', label: 'Beginner', description: '0-1 year', icon: <FaRocket className="w-5 h-5" /> },
        { value: 'intermediate', label: 'Intermediate', description: '1-3 years', icon: <FaChartLine className="w-5 h-5" /> },
        { value: 'advanced', label: 'Advanced', description: '3+ years', icon: <FaTrophy className="w-5 h-5" /> }
      ],
      field: 'experience'
    },
    {
      title: "Trading Style",
      subtitle: "What's your preferred trading approach?",
      icon: <FaBullseye className="w-6 h-6" />,
      options: [
        { value: 'day', label: 'Day Trading', description: 'Intraday positions', icon: <FaClock className="w-5 h-5" /> },
        { value: 'swing', label: 'Swing Trading', description: 'Days to weeks', icon: <FaCalendarAlt className="w-5 h-5" /> },
        { value: 'position', label: 'Position Trading', description: 'Weeks to months', icon: <FaChartBar className="w-5 h-5" /> },
        { value: 'scalping', label: 'Scalping', description: 'Minutes to hours', icon: <FaCog className="w-5 h-5" /> }
      ],
      field: 'tradingStyle'
    },
    {
      title: "Trading Goals",
      subtitle: "What's your primary objective?",
      icon: <FaStar className="w-6 h-6" />,
      options: [
        { value: 'learning', label: 'Learning & Development', description: 'Improve skills', icon: <FaLightbulb className="w-5 h-5" /> },
        { value: 'income', label: 'Supplemental Income', description: 'Extra earnings', icon: <FaDollarSign className="w-5 h-5" /> },
        { value: 'career', label: 'Full-time Trading Career', description: 'Professional trader', icon: <FaBriefcase className="w-5 h-5" /> },
        { value: 'wealth', label: 'Long-term Wealth Building', description: 'Financial freedom', icon: <FaHeart className="w-5 h-5" /> }
      ],
      field: 'goals'
    },
    {
      title: "Preferred Markets",
      subtitle: "Which markets interest you most? (Select all that apply)",
      icon: <FaGlobe className="w-6 h-6" />,
      options: [
        { value: 'forex', label: 'Forex', description: 'Currency pairs', icon: <FaDollarSign className="w-5 h-5" /> },
        { value: 'stocks', label: 'Stocks', description: 'Equity markets', icon: <FaChartBar className="w-5 h-5" /> },
        { value: 'crypto', label: 'Cryptocurrency', description: 'Digital assets', icon: <FaRocket className="w-5 h-5" /> },
        { value: 'commodities', label: 'Commodities', description: 'Gold, oil, etc.', icon: <FaBullseye className="w-5 h-5" /> },
        { value: 'indices', label: 'Indices', description: 'Market indices', icon: <FaChartLine className="w-5 h-5" /> }
      ],
      field: 'preferredMarkets',
      multiSelect: true
    },
    {
      title: "Trading Frequency",
      subtitle: "How often do you plan to trade?",
      icon: <FaCalendarAlt className="w-6 h-6" />,
      options: [
        { value: 'daily', label: 'Daily', description: 'Every trading day', icon: <FaClock className="w-5 h-5" /> },
        { value: 'weekly', label: 'Weekly', description: 'Few times per week', icon: <FaCalendarAlt className="w-5 h-5" /> },
        { value: 'monthly', label: 'Monthly', description: 'Few times per month', icon: <FaChartBar className="w-5 h-5" /> }
      ],
      field: 'tradingFrequency'
    },
    {
      title: "Current Tools",
      subtitle: "What trading tools do you currently use? (Select all that apply)",
      icon: <FaCog className="w-6 h-6" />,
      options: [
        { value: 'none', label: 'None', description: 'Just getting started', icon: <FaRocket className="w-5 h-5" /> },
        { value: 'charting', label: 'Charting Software', description: 'TradingView, MT4, etc.', icon: <FaChartLine className="w-5 h-5" /> },
        { value: 'journal', label: 'Trading Journal', description: 'Manual or digital', icon: <FaBook className="w-5 h-5" /> },
        { value: 'news', label: 'News Services', description: 'Market news feeds', icon: <FaGlobe className="w-5 h-5" /> },
        { value: 'signals', label: 'Signal Services', description: 'Trading signals', icon: <FaBell className="w-5 h-5" /> }
      ],
      field: 'currentTools',
      multiSelect: true
    },
    {
      title: "Motivation",
      subtitle: "What motivates you to improve your trading?",
      icon: <FaHeart className="w-6 h-6" />,
      options: [
        { value: 'financial', label: 'Financial Freedom', description: 'Build wealth', icon: <FaDollarSign className="w-5 h-5" /> },
        { value: 'challenge', label: 'Mental Challenge', description: 'Intellectual stimulation', icon: <FaLightbulb className="w-5 h-5" /> },
        { value: 'lifestyle', label: 'Lifestyle Freedom', description: 'Work from anywhere', icon: <FaGlobe className="w-5 h-5" /> },
        { value: 'passion', label: 'Passion for Markets', description: 'Love of trading', icon: <FaHeart className="w-5 h-5" /> }
      ],
      field: 'motivation'
    },
    {
      title: "Biggest Challenges",
      subtitle: "What are your main trading challenges? (Select all that apply)",
      icon: <FaBullseye className="w-6 h-6" />,
      options: [
        { value: 'emotions', label: 'Emotional Control', description: 'Managing fear/greed', icon: <FaHeart className="w-5 h-5" /> },
        { value: 'analysis', label: 'Market Analysis', description: 'Understanding charts', icon: <FaChartLine className="w-5 h-5" /> },
        { value: 'timing', label: 'Entry/Exit Timing', description: 'Perfect timing', icon: <FaClock className="w-5 h-5" /> },
        { value: 'consistency', label: 'Consistency', description: 'Sticking to plan', icon: <FaBullseye className="w-5 h-5" /> },
        { value: 'risk', label: 'Risk Management', description: 'Position sizing', icon: <FaShieldAlt className="w-5 h-5" /> }
      ],
      field: 'challenges',
      multiSelect: true
    }
  ];

  const handleOptionSelect = (value: string, multiSelect = false) => {
    const currentStep = questionnaireSteps[questionnaireStep];
    const field = currentStep.field as keyof QuestionnaireData;
    
    if (multiSelect) {
      const currentValues = questionnaireData[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setQuestionnaireData(prev => ({ ...prev, [field]: newValues }));
    } else {
      setQuestionnaireData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleQuestionnaireNext = () => {
    const currentStep = questionnaireSteps[questionnaireStep];
    const field = currentStep.field as keyof QuestionnaireData;
    const value = questionnaireData[field];
    
    if (currentStep.multiSelect) {
      if ((value as string[]).length === 0) {
        setError('Please select at least one option');
        return;
      }
    } else {
      if (!value || value === '') {
        setError('Please select an option');
        return;
      }
    }
    
    setError('');
    
    if (questionnaireStep < questionnaireSteps.length - 1) {
      setQuestionnaireStep(questionnaireStep + 1);
    } else {
      // Complete questionnaire
      localStorage.setItem('signup_answers', JSON.stringify(questionnaireData));
      setStep('signup');
    }
  };

  const handleQuestionnaireBack = () => {
    if (questionnaireStep > 0) {
      setQuestionnaireStep(questionnaireStep - 1);
      setError('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const questionnaire = localStorage.getItem('signup_answers');
      if (!questionnaire) {
        throw new Error('Please complete the questionnaire first');
      }
      
      const questionnaireData = JSON.parse(questionnaire);
      
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          ...questionnaireData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setStep('verify');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return ((questionnaireStep + 1) / questionnaireSteps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
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

      <div className="max-w-4xl mx-auto relative px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRocket className="w-8 h-8 text-green-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">
                {step === 'questionnaire' ? 'Welcome to TradeLogger' : 
                 step === 'signup' ? 'Create Your Account' : 'Verify Your Email'}
              </h1>
              <p className="text-lg text-gray-400">
                {step === 'questionnaire' ? 'Let\'s personalize your trading journey' :
                 step === 'signup' ? 'Join thousands of successful traders' :
                 'Almost there! Just verify your email to get started'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        {step !== 'questionnaire' && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setStep(step === 'verify' ? 'signup' : 'questionnaire')}
            className="absolute left-4 top-8 text-gray-400 hover:text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 'questionnaire' ? (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Step {questionnaireStep + 1} of {questionnaireSteps.length}</span>
                  <span className="text-sm text-gray-400">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    {questionnaireSteps[questionnaireStep].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100">
                      {questionnaireSteps[questionnaireStep].title}
                    </h2>
                    <p className="text-gray-400">
                      {questionnaireSteps[questionnaireStep].subtitle}
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {questionnaireSteps[questionnaireStep].options.map((option, index) => {
                    const currentStep = questionnaireSteps[questionnaireStep];
                    const field = currentStep.field as keyof QuestionnaireData;
                    const value = questionnaireData[field];
                    const isSelected = currentStep.multiSelect 
                      ? (value as string[]).includes(option.value)
                      : value === option.value;

                    return (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(option.value, currentStep.multiSelect)}
                        className={`
                          cursor-pointer p-6 rounded-xl border transition-all duration-300
                          ${isSelected
                            ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                            : 'bg-[#1a1a1a] border-gray-700/50 hover:border-gray-600/50 hover:bg-[#2a2a2a]'
                          }
                        `}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-100 mb-1">{option.label}</h3>
                            <p className="text-sm text-gray-400">{option.description}</p>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1 bg-green-500 rounded-full"
                            >
                              <FaCheck className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleQuestionnaireBack}
                    disabled={questionnaireStep === 0}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                      questionnaireStep === 0
                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 hover:bg-gray-600/30'
                    }`}
                  >
                    <FaArrowLeft className="inline mr-2" />
                    Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleQuestionnaireNext}
                    className="px-8 py-3 bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-green-500/30 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    {questionnaireStep === questionnaireSteps.length - 1 ? 'Complete' : 'Next'}
                    <FaArrowLeft className="inline ml-2 rotate-180" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : step === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <FaUser className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100">Create Account</h2>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaUser className="inline mr-2 w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaEnvelope className="inline mr-2 w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaLock className="inline mr-2 w-4 h-4" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`
                      w-full py-4 px-6 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-3
                      ${loading 
                        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-400 border border-green-500/30 hover:from-green-600/30 hover:to-green-500/30 shadow-lg hover:shadow-green-500/25'
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"
                        />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaRocket className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaEnvelope className="w-8 h-8 text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-100 mb-4">Verify Your Email</h2>
                <p className="text-gray-300 mb-6">
                  We've sent a verification email to <span className="font-semibold text-green-400">{formData.email}</span>.
                  Please check your inbox and click the verification link.
                </p>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.removeItem('signup_answers');
                      if (nextPath) {
                        router.push(nextPath);
                      } else {
                        router.push('/dashboard');
                      }
                    }}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-green-500/30 transition-all duration-300"
                  >
                    <FaCheck className="inline mr-2" />
                    I've verified my email
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/')}
                    className="w-full py-3 px-6 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-xl hover:bg-gray-600/30 transition-all duration-300"
                  >
                    Back to Home
                  </motion.button>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-4"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}