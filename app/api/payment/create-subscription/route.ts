import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' });

    const { customerId, paymentMethodId, priceId, plan, discountCode } = await req.json();
    if (!customerId || !paymentMethodId || !priceId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { plan: plan || '' },
      },
      success_url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/checkout/success',
      cancel_url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/checkout',
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Create subscription error', e);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}


