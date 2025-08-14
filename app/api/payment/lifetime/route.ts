import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-07-30.basil' });

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });

    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(pi.customer as string);
    const customerEmail = (customer as any).email;

    if (customerEmail) {
      // Update user with lifetime access
      await prisma.user.upsert({
        where: { email: customerEmail },
        update: {
          subscriptionStatus: 'active',
          stripeCustomerId: pi.customer as string,
          planType: 'lifetime',
          subscriptionEndsAt: new Date('2099-12-31'), // Far future date for lifetime
        },
        create: {
          email: customerEmail,
          subscriptionStatus: 'active',
          stripeCustomerId: pi.customer as string,
          planType: 'lifetime',
          subscriptionEndsAt: new Date('2099-12-31'),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Record lifetime error', e);
    return NextResponse.json({ error: 'Failed to record lifetime payment' }, { status: 500 });
  }
}


