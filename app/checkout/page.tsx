'use client';

import { useState, useEffect, useCallback, useRef, JSX, Suspense } from 'react';
import { FaCrown, FaRocket, FaCheck, FaShieldAlt, FaCreditCard, FaLock, FaArrowRight, FaGift, FaInfinity } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#ffffff',
    colorBackground: '#1a1a1a',
    colorText: '#ffffff',
    colorDanger: '#ff4d4f',
    fontFamily: 'Arial, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#333333',
      color: '#ffffff',
      borderColor: '#444444',
    },
    '.Input:focus': {
      borderColor: '#888888',
    },
    '.Label': {
      color: '#cccccc',
    },
  },
};

interface FormData {
  name: string;
  email: string;
}

interface DiscountCode {
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  savings: number;
}

interface Package {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  price: number;
  color: string;
  icon: JSX.Element;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  { 
    id: 'week',
    title: 'Weekly Plan',
    description: 'Full access. Cancel anytime.',
    originalPrice: 9.99,
    price: 4.99,
    color: 'purple',
    icon: <FaRocket className="w-6 h-6" />,
    features: ['7-day free trial', 'Full feature access', 'Cancel anytime', 'Basic support']
  },
  {
    id: 'year',
    title: 'Yearly Plan',
    description: '80% OFF - Best value for full access!',
    originalPrice: 259.4,
    price: 51.89,
    color: 'blue',
    icon: <FaCrown className="w-6 h-6" />,
    features: ['7-day free trial', 'Full feature access', 'Priority support', 'Advanced analytics', '80% savings'],
    popular: true
  },
  {
    id: 'lifetime',
    title: 'Lifetime Plan',
    description: 'Launch Price - Support Creator! Best value for full access, forever!',
    originalPrice: 349.99,
    price: 119.99,
    color: 'green',
    icon: <FaInfinity className="w-6 h-6" />,
    features: ['Lifetime access', 'All features included', 'Premium support', 'Early access to new features', 'One-time payment']
  },
];

function CardSetupForm({ onSuccess, onError, formData, selectedPackageDetails, appliedDiscount }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const finalAmount = appliedDiscount ? appliedDiscount.finalAmount : Math.round(selectedPackageDetails.price * 100);
      const res = await fetch(`/api/payment/${selectedPackageDetails.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          item: selectedPackageDetails.title,
          data: formData,
          discountCode: appliedDiscount?.code,
        }),
      });
      if (!res.ok) throw new Error('Failed to initialize payment');
      const { clientSecret, customerId, priceId } = await res.json();

      if (!stripe || !elements) throw new Error('Stripe not loaded');
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      if (selectedPackageDetails.id === 'lifetime') {
        const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: formData.name, email: formData.email },
          },
        });
        if (stripeError) throw new Error(stripeError.message);
        if (!paymentIntent || paymentIntent.status !== 'succeeded') throw new Error('Payment not successful');

        const dbRes = await fetch('/api/payment/lifetime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            item: selectedPackageDetails.title,
            data: formData,
            paymentIntentId: paymentIntent.id,
            discountCode: appliedDiscount?.code,
          }),
          credentials: 'include',
        });
        if (!dbRes.ok) {
          const err = await dbRes.json();
          throw new Error(err.error || 'Failed to record subscription');
        }
        onSuccess();
      } else {
        const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: formData.name, email: formData.email },
          },
        });
        if (stripeError) throw new Error(stripeError.message);
        if (!setupIntent || !setupIntent.payment_method) throw new Error('No payment method returned');

        const subRes = await fetch('/api/payment/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            paymentMethodId: setupIntent.payment_method,
            priceId,
            plan: selectedPackageDetails.id,
            discountCode: appliedDiscount?.code || null,
            originalAmount: appliedDiscount ? appliedDiscount.originalAmount : null,
            finalAmount: appliedDiscount ? appliedDiscount.finalAmount : null,
            discountAmount: appliedDiscount ? appliedDiscount.savings : null,
          }),
          credentials: 'include',
        });
        if (!subRes.ok) {
          const err = await subRes.json();
          throw new Error(err.error || 'Failed to create subscription');
        }
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onError?.(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FaCreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Payment Information</h3>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': { color: '#888' },
              },
              invalid: { color: '#ff4d4f' },
            },
          }}
          className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3"
        />
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full px-6 py-4 bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-green-500/30 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/25">
        {loading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full" />
            Processing...
          </>
        ) : (
          <>
            <FaLock className="w-4 h-4" />
            {selectedPackageDetails.id === 'lifetime' ? 'Pay Lifetime Access' : 'Start Free Trial'}
            <FaArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<string>(packages[0].id);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const requestCounter = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const qPlan = searchParams.get('plan');
    if (qPlan) {
      const match = packages.find(p => p.id.toLowerCase() === qPlan.toLowerCase());
      if (match) setSelectedPackage(match.id);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.push('/auth?next=' + encodeURIComponent('/checkout?plan=' + selectedPackage));
          }
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        const user = data.user || data;
        setFormData({ name: user.name || '', email: user.email || '' });
      } catch (e) {
        setError('Failed to load user information');
      }
    };
    fetchUserData();
  }, [router, selectedPackage]);

  const createPaymentIntent = useCallback(async (currentRequestId: number) => {
    if (!selectedPackage || !formData.email) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/${selectedPackage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round((packages.find(p => p.id === selectedPackage)?.price || 0) * 100),
          item: selectedPackage,
          data: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      const data = await response.json();
      if (!data.clientSecret) throw new Error('No client secret received');

      if (currentRequestId === requestCounter.current) {
        setClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed');
    } finally {
      if (currentRequestId === requestCounter.current) {
        setIsLoading(false);
      }
    }
  }, [selectedPackage, formData]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    requestCounter.current += 1;
    const currentRequestId = requestCounter.current;

    debounceTimer.current = setTimeout(() => {
      createPaymentIntent(currentRequestId);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [createPaymentIntent]);

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setClientSecret(null);
    requestCounter.current += 1;
  };

  useEffect(() => {
    if (appliedDiscount && discountCode) {
      const selectedPackageDetails = packages.find((pkg) => pkg.id === selectedPackage);
      const amount = Math.round((selectedPackageDetails?.price || 0) * 100);

      fetch('/api/payment/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), amount }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.discountCode) {
            setAppliedDiscount(data.discountCode);
            setDiscountError(null);
          }
        })
        .catch(() => {
          setAppliedDiscount(null);
        });
    }
  }, [selectedPackage]);

  const handlePaymentSuccess = () => {
    router.push('/checkout/success');
  };

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    setDiscountError(null);

    try {
      const selectedPackageDetails = packages.find((pkg) => pkg.id === selectedPackage);
      const amount = Math.round((selectedPackageDetails?.price || 0) * 100);

      const response = await fetch('/api/payment/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDiscountError(data.error || 'Failed to validate discount code');
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount(data.discountCode);
        setDiscountError(null);
      }
    } catch (e) {
      setDiscountError('Failed to validate discount code');
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError(null);
  };

  const selectedPackageDetails = packages.find((pkg) => pkg.id === selectedPackage)!;
  const totalPrice = selectedPackageDetails?.price || 0;
  const finalPrice = appliedDiscount ? appliedDiscount.finalAmount / 100 : totalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <motion.div key={`v-line-${i}`} className="border-r border-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} transition={{ delay: i * 0.1 }} />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <motion.div key={`h-line-${i}`} className="border-b border-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} transition={{ delay: i * 0.1 }} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <FaCrown className="w-8 h-8 text-green-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-2">
                {selectedPackage === 'lifetime' ? 'Get Lifetime Access' : 'Start Your Free Trial'}
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {selectedPackage === 'lifetime'
                  ? 'Unlock Pro forever with a single payment. No recurring fees.'
                  : `Try Pro completely free for 7 days. After your trial, your subscription will automatically continue at £${selectedPackageDetails?.price}/${selectedPackageDetails?.id}. Cancel anytime.`}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-6 border transition-all duration-300 cursor-pointer shadow-xl ${
                selectedPackage === pkg.id
                  ? pkg.color === 'purple'
                    ? 'border-purple-500/50 shadow-purple-500/25'
                    : pkg.color === 'blue'
                    ? 'border-blue-500/50 shadow-blue-500/25'
                    : 'border-green-500/50 shadow-green-500/25'
                  : 'border-gray-700/50 hover:border-gray-600/50'
              }`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              {pkg.popular && (
                <motion.div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                  Most Popular
                </motion.div>
              )}

              <div className={`p-3 rounded-xl mb-4 inline-block ${
                pkg.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                pkg.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {pkg.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-100 mb-2">{pkg.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-100">£{pkg.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">£{pkg.originalPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-400">{pkg.id === 'lifetime' ? 'one-time payment' : `per ${pkg.id}`}</p>
              </div>

              <div className="space-y-2 mb-6">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <FaCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedPackage === pkg.id
                  ? pkg.color === 'purple'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : pkg.color === 'blue'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
              }`}>
                {selectedPackage === pkg.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaCheck className="w-4 h-4" />
                    Selected
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaArrowRight className="w-4 h-4" />
                    Select Plan
                  </div>
                )}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {selectedPackage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    selectedPackageDetails?.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    selectedPackageDetails?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedPackageDetails?.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100">{selectedPackageDetails?.title}</h2>
                    <p className="text-gray-400">{selectedPackageDetails?.description}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mb-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <FaShieldAlt className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-gray-100">Secure Payment</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    {selectedPackage === 'lifetime'
                      ? 'By continuing, you agree to our Terms of Service and authorize a one-time charge. No further payments will be taken.'
                      : `By continuing, you agree to our Terms of Service and authorize a charge of £${selectedPackageDetails?.price.toFixed(2)}/${selectedPackageDetails?.id} after your 7-day free trial. Cancel anytime before the trial ends.`}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 mb-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FaGift className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">Discount Code</h3>
                </div>

                {!appliedDiscount ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="Enter discount code (e.g., TJ20)" className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none" />
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => validateDiscountCode(discountCode)} disabled={discountLoading || !discountCode.trim()} className="px-6 py-3 bg-gradient-to-r from-purple-600/20 to-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:from-purple-600/30 hover:to-purple-500/30 transition-all duration-300 font-semibold disabled:opacity-50">
                        {discountLoading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full" />
                        ) : (
                          'Apply'
                        )}
                      </motion.button>
                    </div>

                    {discountError && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{discountError}</motion.div>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaCheck className="w-4 h-4 text-green-400" />
                          <span className="font-semibold text-green-400">Discount Applied!</span>
                        </div>
                        <p className="text-sm text-gray-300">{appliedDiscount.description || `${appliedDiscount.discountType === 'percentage' ? appliedDiscount.discountValue : '£' + (appliedDiscount.discountValue / 100).toFixed(2)} off`}</p>
                        <p className="text-sm text-green-400">You saved £{(appliedDiscount.savings / 100).toFixed(2)}!</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={removeDiscountCode} className="text-gray-400 hover:text-red-400 transition-colors">✕</motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-100 mb-4">{selectedPackage === 'lifetime' ? 'Lifetime Plan Summary:' : 'Trial Summary:'}</h3>
                <div className="space-y-3">
                  {selectedPackage === 'lifetime' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Lifetime Access:</span>
                        <span className="text-xl font-bold text-gray-100">£{selectedPackageDetails?.price.toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <>
                          <div className="flex justify-between items-center text-green-400">
                            <span>Discount ({appliedDiscount.code}):</span>
                            <span>-£{(appliedDiscount.savings / 100).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-700 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">Final Price:</span>
                              <span className="text-2xl font-bold text-green-400">£{finalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">7-Day Free Trial:</span>
                        <span className="text-xl font-bold text-gray-100">£{selectedPackageDetails?.price.toFixed(2)}/{selectedPackageDetails?.id}</span>
                      </div>
                      {appliedDiscount && (
                        <>
                          <div className="flex justify-between items-center text-green-400">
                            <span>Discount ({appliedDiscount.code}):</span>
                            <span>-£{(appliedDiscount.savings / 100).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-700 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">Final Price:</span>
                              <span className="text-2xl font-bold text-green-400">£{finalPrice.toFixed(2)}/{selectedPackageDetails?.id}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ appearance }}>
                <CardSetupForm onSuccess={handlePaymentSuccess} onError={(msg: string) => setError(msg)} formData={formData} selectedPackageDetails={selectedPackageDetails} appliedDiscount={appliedDiscount} />
              </Elements>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


