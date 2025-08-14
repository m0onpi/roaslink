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

    // Create price for subscription
    const price = await stripe.prices.create({
      currency: 'gbp',
      unit_amount: Math.round(amount),
      recurring: { interval: 'month' },
      product_data: { name: item },
    });

    // Create subscription with immediate payment (no trial)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { plan: 'month' },
    });

    return NextResponse.json({
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      customerId: customer.id,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    );
  }
}
