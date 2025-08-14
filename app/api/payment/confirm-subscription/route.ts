import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
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
      // Create recurring subscription after successful payment (all plans are monthly now)
      const price = await stripe.prices.create({
        currency: 'gbp',
        unit_amount: amount || Math.round((paymentIntent.amount)),
        recurring: { interval: 'month' },
        product_data: { name: `RoasLink ${plan} Plan` },
      });

      // Create subscription starting from the next billing period to avoid double charging
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        billing_cycle_anchor: Math.floor(nextBillingDate.getTime() / 1000),
        proration_behavior: 'none',
        metadata: { plan, initialPaymentIntentId: paymentIntentId },
      });

      // Calculate subscription end date (all plans are monthly now)
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

      // Determine domain limit based on plan
      let domainLimit = 0;
      if (plan === 'starter') {
        domainLimit = 1;
      } else if (plan === 'growth') {
        domainLimit = 3;
      } else if (plan === 'scale') {
        domainLimit = -1; // unlimited
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
          domainLimit: domainLimit,
        },
        create: {
          email: customerEmail,
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          planType: plan,
          subscriptionEndsAt,
          domainLimit: domainLimit,
        },
      });
      
      console.log('User subscription updated:', {
        userId: updatedUser.id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        planType: updatedUser.planType,
        subscriptionEndsAt: updatedUser.subscriptionEndsAt
      });

      // Generate new JWT with updated subscription info
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const newToken = jwt.sign(
          { 
            userId: updatedUser.id,
            email: updatedUser.email,
            subscriptionStatus: updatedUser.subscriptionStatus,
            planType: updatedUser.planType,
            hasAccess: updatedUser.subscriptionStatus === 'active'
          },
          jwtSecret,
          { expiresIn: '1d' }
        );

        // Create response with updated JWT
        const response = NextResponse.json({
          message: 'Subscription confirmed successfully',
          subscriptionId: subscription?.id,
        });

        // Set the new token as an HTTP-only cookie
        response.cookies.set({
          name: 'token',
          value: newToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1 * 24 * 60 * 60, // 1 day
          path: '/',
        });

        return response;
      }
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
