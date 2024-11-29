// app/api/stripe/verify-payment/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    // Retrieve the session object from Stripe using the session_id
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error);

    // Return structured error response
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: error.message || 'An error occurred during checkout',
          code: error.code || 'unknown_error',
        },
      },
      { status: error.statusCode || 500 },
    );
  }
}
