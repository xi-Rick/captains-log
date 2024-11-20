import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { RevealFx } from '~/once-ui/components';
import { AudioRecorderWithVisualizer } from '~/components/ui/audio-recorder';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Rocket, Stars, Mic2, Waves, Globe2, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '~/components/ui/button';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const SignalVisualizer = () => {
  return (
    <div className="flex justify-center items-center gap-1 py-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary/60 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

const calculateStardate = (): number => {
  const TNG_ROOT = 2323.3981; // TNG era root date
  const TNG_INCREMENT = 1000; // TNG increment value

  const now = new Date();

  // Calculate seconds into the year
  const secondsAlongYear =
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 1000;

  // Calculate the real date value (year + fraction of year)
  const dateReal =
    now.getFullYear() +
    secondsAlongYear /
      ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) ||
      now.getFullYear() % 400 === 0
        ? 31622400
        : 31536000);

  // Calculate TNG stardate
  const stardate = (dateReal - TNG_ROOT) * TNG_INCREMENT;

  return Number(stardate.toFixed(1));
};

export default function NewStarlogPage() {
  return (
    <RevealFx>
      <section
        id="dashboard"
        className="relative container mx-auto px-4 py-14 max-w-4xl"
      >
        {/* Back to Dashboard Link */}
        <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Bridge
            </Button>
          </Link>
          <br className="h-4" />

        {/* Content Container */}
        <div className="relative z-10 space-y-8">
          {/* Welcome Banner */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-4 overflow-visible text-center">
              <div className="flex items-center justify-center space-x-4">
                <Rocket className="w-8 h-8 text-primary animate-pulse" />
                <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                  New Starlog Entry
                </CardTitle>
                <Stars className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <CardDescription className="text-lg">
                Record your journey through the cosmos
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Starlog Entries */}
          <Card className="shadow-md">
            <br className="animate-fade-in" />
            <RevealFx speed="medium">
              <CardContent>
                <div className="relative mx-auto max-w-3xl space-y-6">
                  {/* Audio Recorder with Glow Effect */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground opacity-25 blur"></div>
                    <div className="relative">
                      <TooltipProvider>
                        <AudioRecorderWithVisualizer />
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Signal Strength Indicator */}
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Waves className="w-4 h-4" />
                        Signal Strength
                      </span>
                      <span className="text-primary font-semibold">
                        Excellent
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  {/* Signal Visualizer */}
                  <div className="bg-background/40 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe2 className="w-4 h-4" />
                        Subspace Frequency
                      </span>
                    </div>
                    <SignalVisualizer />
                  </div>

                  {/* Recording Instructions */}
                  <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                    <Mic2 className="w-4 h-4" />
                    <span className="font-semibold text-primary">
                      Speak clearly into your ship's communication system
                    </span>
                  </div>
                </div>
              </CardContent>
            </RevealFx>
          </Card>

          {/* Stardate Display */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Stardate {calculateStardate()}</p>
          </div>
        </div>
      </section>
    </RevealFx>
  );
}
