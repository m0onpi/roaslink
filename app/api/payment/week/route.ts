import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  try {
    const { amount, item, data } = await req.json();

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
      console.log('Created new Stripe customer:', customer.id, 'for email:', data.email);
    } else {
      console.log('Using existing Stripe customer:', customer.id, 'for email:', data.email);
    }

    // Check for existing active subscriptions
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create a direct PaymentIntent for immediate payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'gbp',
      customer: customer.id,
      metadata: {
        plan: 'week',
        item: item,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      plan: 'week',
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    );
  }
}
