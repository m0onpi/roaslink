'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Plan = {
  name: string;
  priceMonthly: number;
  priceId: string; // Stripe Price ID
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: 'Starter',
    priceMonthly: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_99 || '',
    features: [
      'Core redirect script',
      'Basic analytics',
      'Email support',
    ],
    popular: true,
  },
  {
    name: 'Growth',
    priceMonthly: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_149 || '',
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    name: 'Scale',
    priceMonthly: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_399 || '',
    features: [
      'Everything in Growth',
      'SLA + onboarding',
      'Custom domains',
    ],
  },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const attemptedAutoCheckoutRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        setIsAuthenticated(Boolean(data?.authenticated));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Auto-redirect to onsite checkout if redirected back with ?plan=...
  useEffect(() => {
    const desiredPlan = searchParams.get('plan');
    if (!desiredPlan || attemptedAutoCheckoutRef.current) return;
    if (!authChecked) return;
    if (!isAuthenticated) return;
    const plan = plans.find((p) => p.name.toLowerCase() === desiredPlan.toLowerCase());
    if (plan) {
      attemptedAutoCheckoutRef.current = true;
      router.push(`/checkout?plan=${encodeURIComponent(plan.name.toLowerCase())}`);
    }
  }, [searchParams, authChecked, isAuthenticated, router]);

  const startCheckout = async (plan: Plan) => {
    if (!plan.priceId) {
      alert('Stripe price is not configured.');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth?next=${encodeURIComponent(`/checkout?plan=${encodeURIComponent(plan.name.toLowerCase())}`)}`);
      return;
    }

    // Authenticated: go to onsite checkout
    router.push(`/checkout?plan=${encodeURIComponent(plan.name.toLowerCase())}`);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose your plan</h1>
          <p className="text-xl text-gray-600">Simple, transparent pricing. Start free, upgrade when ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border ${plan.popular ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200'} bg-white p-8 shadow-lg hover:shadow-xl transition-shadow relative`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                ${plan.priceMonthly}<span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <ul className="text-gray-600 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  loadingPlan === plan.name 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => startCheckout(plan)}
                disabled={loadingPlan === plan.name}
              >
                {loadingPlan === plan.name ? 'Redirecting...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}


