// //api/stripe/checkout/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  try {
    // Get host from headers
    const headersList = headers();
    const host = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Parse request body for priceId and amount
    const data = await request.json();
    const { priceId, amount } = data;

    // Assume you have user validation and logged user info here
    const loggedUser = { id: 'userIdExample' };

    // For custom amounts, create a one-time price
    let finalPriceId = priceId;
    if (priceId === 'custom') {
      const price = await stripe.prices.create({
        unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'usd',
        product_data: {
          name: 'Custom Donation',
        },
      });
      finalPriceId = price.id;
    }

    // Create Stripe Checkout session
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/contribute/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/contribute?canceled=true`,
        metadata: {
          userId: loggedUser.id,
          priceId: finalPriceId,
          amount: amount,
        },
      });

    return NextResponse.json({ result: checkoutSession, ok: true });
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
