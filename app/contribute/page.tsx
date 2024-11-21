// app/contribute/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { RevealFx } from '~/once-ui/components';
import { useToast } from '~/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Contribute() {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter(); // Initialize the router

  // Predefined donation amounts with corresponding Stripe price IDs (replace with actual price IDs)
  const predefinedAmounts = [
    { value: '5', label: '$5', priceId: 'price_1KUvqCBo0fvWP1BQuQxkxr4h' },
    { value: '10', label: '$10', priceId: 'price_1KUvpbBo0fvWP1BQcV1Qcphh' },
    { value: '25', label: '$25', priceId: 'price_1QMC4HBo0fvWP1BQrJthMNnc' },
    { value: '50', label: '$50', priceId: 'price_1KUvpcBo0fvWP1BQ8WGZcFea' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleAmountSelect = (value: string) => {
    setSelectedAmount(value);
    if (value !== 'custom') {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const priceId =
        selectedAmount === 'custom'
          ? 'custom'
          : predefinedAmounts.find((amt) => amt.value === selectedAmount)
              ?.priceId;

      if (!priceId) {
        throw new Error('Invalid amount selected');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId,
          amount: selectedAmount === 'custom' ? amount : selectedAmount,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Checkout failed');
      }

      if (data.result?.url) {
        // Redirect to Stripe checkout page
        window.location.href = data.result.url;
      } else {
        throw new Error('No checkout URL received');
      }
      router.push('/contribute'); // Redirect back to the contributions page
    } catch (error: any) {
      console.error('Error during checkout:', error);
      toast({
        title: 'Payment failed',
        description:
          error.message ||
          'There was an error initiating the payment. Please try again.',
        variant: 'destructive',
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => window.location.reload()}
          >
            Try Again
          </ToastAction>
        ),
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'absolute left-4 top-4 md:left-8 md:top-8',
            )}
          >
            <ChevronLeft className="mr-2 size-4" />
            Back
          </Link>
          <h1 className="text-2xl font-semibold mb-4">Support Our Cause</h1>

          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Heart className="text-red-500" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Every contribution makes a difference
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={selectedAmount}
                  onValueChange={handleAmountSelect}
                  className="grid grid-cols-2 gap-4"
                >
                  {predefinedAmounts.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {selectedAmount === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Enter amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        $
                      </span>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!amount || isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Donate $${amount}`}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </RevealFx>
    </>
  );
}
