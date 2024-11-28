'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RevealFx } from '~/once-ui/components';
import Link from 'next/link';

export default function SuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      'session_id',
    );
    if (!sessionId) {
      setError('Invalid session ID.');
      setIsLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(true);
          setInvoiceUrl(data.invoiceUrl);
        } else {
          setError(
            data?.error?.message ||
              'There was an error verifying your payment.',
          );
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setError('There was an error verifying your payment.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, []);

  return (
    <>
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {/* Light mode: black dots */}
        <div className="absolute inset-0 bg-[radial-gradient(black_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-0"></div>
        {/* Dark mode: white dots */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-25"></div>
      </div>
      <RevealFx>
        <div className="container flex min-h-screen items-center justify-center flex-col text-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Donation Status</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Verifying payment...'
                  : success
                    ? 'Thank you for your donation! Your contribution was successfully processed.'
                    : error || 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => router.push('/')} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </RevealFx>
    </>
  );
}
