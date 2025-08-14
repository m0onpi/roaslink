import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { subscriptionId, customerId, plan, paymentIntentId } = await req.json();
    
    if (!subscriptionId || !customerId || !plan || !paymentIntentId) {
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
      await (prisma as any).user.upsert({
        where: { email: customerEmail },
        update: {
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
          subscriptionId: subscriptionId,
          planType: plan,
          subscriptionEndsAt,
        },
        create: {
          email: customerEmail,
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
          subscriptionId: subscriptionId,
          planType: plan,
          subscriptionEndsAt,
        },
      });
    }

    return NextResponse.json({
      message: 'Subscription confirmed successfully',
      subscriptionId,
    });
  } catch (error) {
    console.error('Confirm subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}
