import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' });

    const { priceId, plan } = await req.json();
    if (!priceId || !plan) {
      return NextResponse.json({ error: 'Missing priceId or plan' }, { status: 400 });
    }

    // Verify auth from cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string | null = null;
    try {
      const payload = jwt.verify(token, jwtSecret) as { userId: string };
      userId = payload.userId;
    } catch {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const origin = typeof siteUrl === 'string' && siteUrl.startsWith('http')
      ? siteUrl
      : `https://${siteUrl}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?plan=${encodeURIComponent(plan)}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: userId,
        plan,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}


