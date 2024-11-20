import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type METADATA = {
  userId: string;
  priceId: string;
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
  const sig = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  const eventType = event.type;

  // Handle only successful payment events
  if (
    eventType !== 'checkout.session.completed' &&
    eventType !== 'checkout.session.async_payment_succeeded'
  ) {
    return new Response('Server Error', { status: 500 });
  }

  const data = event.data.object;
  const metadata = data.metadata as METADATA;
  const userId = metadata.userId;
  const priceId = metadata.priceId;
  const created = data.created;
  const currency = data.currency;
  const customerDetails = data.customer_details;
  const amount = data.amount_total;

  const transactionDetails = {
    userId,
    priceId,
    created,
    currency,
    customerDetails,
    amount,
  };

  try {
    // Here you can update your database with transactionDetails
    console.log(transactionDetails); // Simulate database update
    return new Response('Subscription added', { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Server Error', { status: 500 });
  }
}
