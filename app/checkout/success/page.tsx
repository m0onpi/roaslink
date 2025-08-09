'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const plan = params.get('plan') || 'your plan';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#2a2a2a] border border-gray-700/50 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Payment successful</h1>
        <p className="text-gray-300 mb-6">Thanks for subscribing to {plan}. Your account will be upgraded shortly.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30">Go to dashboard</Link>
          <Link href="/" className="px-4 py-2 rounded-lg bg-gray-600/20 text-gray-300 border border-gray-500/30 hover:bg-gray-600/30">Home</Link>
        </div>
      </div>
    </div>
  );
}


