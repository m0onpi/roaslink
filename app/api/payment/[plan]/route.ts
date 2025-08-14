import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ plan: string }> }
) {
  try {
    if (!stripeSecretKey) 
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' });

    const { amount, item, data, discountCode } = await req.json();
    const { plan } = await params;

    if (plan === 'lifetime') {
      // One-time payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'gbp',
        description: item,
        metadata: { discountCode: discountCode || '' },
      });
      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } else {
      // Weekly/Yearly: create customer + setup intent + provide priceId for subscription step
      // Expect price IDs through env vars
      const priceId = plan === 'week'
        ? process.env.STRIPE_PRICE_WEEK
        : process.env.STRIPE_PRICE_YEAR;
      if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 });

      const customer = await stripe.customers.create({
        name: data?.name,
        email: data?.email,
      });

      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
      });

      return NextResponse.json({ clientSecret: setupIntent.client_secret, customerId: customer.id, priceId });
    }
  } catch (e) {
    console.error('Init payment error', e);
    return NextResponse.json({ error: 'Failed to init payment' }, { status: 500 });
  }
}


