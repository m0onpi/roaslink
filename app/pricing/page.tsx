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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Choose your plan</h1>
          <p className="text-gray-400">Upgrade when you are ready. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border ${plan.popular ? 'border-green-500/40' : 'border-gray-700/50'} bg-[#2a2a2a] p-6`}>
              {plan.popular && (
                <div className="mb-3 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300 border border-green-400/30">Popular</div>
              )}
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4">
                ${'{'}plan.priceMonthly{'}'}<span className="text-lg text-gray-400">/mo</span>
              </div>
              <ul className="text-gray-300 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${loadingPlan === plan.name ? 'bg-gray-700 text-gray-400' : 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30'}`}
                onClick={() => startCheckout(plan)}
                disabled={loadingPlan === plan.name}
              >
                {loadingPlan === plan.name ? 'Redirecting...' : 'Start subscription'}
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
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-gray-300">
        Loading...
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}


