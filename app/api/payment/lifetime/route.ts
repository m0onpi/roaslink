import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });

    // TODO: persist lifetime entitlement in DB
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Record lifetime error', e);
    return NextResponse.json({ error: 'Failed to record lifetime payment' }, { status: 500 });
  }
}


