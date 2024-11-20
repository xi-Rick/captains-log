import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { Metadata } from 'next';
import { RevealFx } from '~/once-ui/components';
import { AudioRecorderWithVisualizer } from '~/components/ui/audio-recorder';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Rocket, Stars, ChevronLeft, Mic2, Waves, Globe2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const metadata: Metadata = {
  title: "Captain's Log",
  description: 'Record your space journey',
};

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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:50px_50px] opacity-25"></div>
      </div>
      <div className="container mx-auto px-4 py-8 relative">
        <RevealFx>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: 'ghost',
              className: 'absolute top-4 left-4 flex items-center gap-2',
            })}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Bridge
          </Link>
          <div className="max-w-4xl mx-auto pt-16">
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
              <CardHeader className="space-y-4 overflow-visible">
                <div className="flex items-center justify-center space-x-2">
                  <Rocket className="w-8 h-8 text-primary animate-pulse" />
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                    New Starlog Entry
                  </CardTitle>
                  <Stars className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <CardDescription className="text-lg text-center">
                  Record your journey through the cosmos
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Centered Audio Component with Glow Effect */}
                <div className="relative mx-auto max-w-3xl">
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
                    <span className="text-primary">Excellent</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                {/* Custom Signal Visualizer */}
                <div className="bg-background/40 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe2 className="w-4 h-4" />
                      Subspace Frequency
                    </span>
                  </div>
                  <SignalVisualizer />
                </div>

                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                  <Mic2 className="w-4 h-4" />
                  <span className="font-semibold text-primary ">
                    Speak clearly into your ship's communication system
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Stardate {calculateStardate()}</p>
            </div>
          </div>
        </RevealFx>
      </div>
    </div>
  );
}
