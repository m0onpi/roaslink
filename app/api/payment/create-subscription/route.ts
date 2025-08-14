import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const { customerId, paymentMethodId, plan, amount } = await req.json();
    
    if (!customerId || !paymentMethodId || !plan || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, { 
      invoice_settings: { default_payment_method: paymentMethodId } 
    });

    // Create price dynamically based on plan and amount
    const interval = plan === 'week' ? 'week' : plan === 'month' ? 'month' : 'year';
    
    const price = await stripe.prices.create({
      currency: 'gbp',
      unit_amount: Math.round(amount),
      recurring: { interval },
      product_data: { name: `RoasLink ${plan} Plan` },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { plan },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}


