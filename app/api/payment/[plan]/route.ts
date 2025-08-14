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

    // Validate input
    if (!amount || !item || !data?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, item, or email' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Check for existing customer
    const existingCustomers = await stripe.customers.list({
      email: data.email,
      limit: 1,
    });

    let customer = existingCustomers.data[0];

    // Create new customer if not exists
    if (!customer) {
      customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: {
          signup_date: new Date().toISOString(),
        },
      });
    }

    // Create a direct PaymentIntent for immediate payment (all plans are now monthly)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'gbp',
      customer: customer.id,
      metadata: {
        plan: plan,
        item: item,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      plan: plan,
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    );
  }
}


