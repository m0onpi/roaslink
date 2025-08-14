'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutSuccessContent() {
  const params = useSearchParams();
  const plan = params.get('plan') || 'your plan';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xl">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thanks for subscribing to {plan}. You can now start managing your domains and redirect scripts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 font-semibold">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-[#2a2a2a] border border-gray-700/50 rounded-2xl p-8 text-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}


