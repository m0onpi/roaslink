import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { customerId, plan, paymentIntentId, amount } = await req.json();
    
    if (!customerId || !plan || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = (customer as any).email;
    
    console.log('Processing subscription for customer:', {
      customerId,
      customerEmail,
      plan,
      paymentIntentId
    });

    let subscription = null;

    if (customerEmail) {
      // Create recurring subscription after successful payment
      const price = await stripe.prices.create({
        currency: 'gbp',
        unit_amount: amount || Math.round((paymentIntent.amount)),
        recurring: { 
          interval: plan === 'week' ? 'week' : plan === 'month' ? 'month' : 'year' 
        },
        product_data: { name: `RoasLink ${plan} Plan` },
      });

      // Create subscription starting from the next billing period to avoid double charging
      const nextBillingDate = new Date();
      if (plan === 'week') {
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      } else if (plan === 'month') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (plan === 'year') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        billing_cycle_anchor: Math.floor(nextBillingDate.getTime() / 1000),
        proration_behavior: 'none',
        metadata: { plan, initialPaymentIntentId: paymentIntentId },
      });

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
      const updatedUser = await (prisma as any).user.upsert({
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
      
      console.log('User subscription updated:', {
        userId: updatedUser.id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        planType: updatedUser.planType,
        subscriptionEndsAt: updatedUser.subscriptionEndsAt
      });
    }

    return NextResponse.json({
      message: 'Subscription confirmed successfully',
      subscriptionId: subscription?.id,
    });
  } catch (error) {
    console.error('Confirm subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}
