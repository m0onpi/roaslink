import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const prisma = new PrismaClient();

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

    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = (customer as any).email;

    if (customerEmail) {
      // Calculate subscription end date
      const subscriptionEndsAt = new Date();
      if (plan === 'week') {
        subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 7);
      } else if (plan === 'month') {
        subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
      } else if (plan === 'year') {
        subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
      }

      // Update user subscription status in database
      await prisma.user.upsert({
        where: { email: customerEmail },
        update: {
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          planType: plan,
          subscriptionEndsAt,
        },
        create: {
          email: customerEmail,
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          planType: plan,
          subscriptionEndsAt,
        },
      });
    }

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


