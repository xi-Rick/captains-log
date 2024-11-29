"use client";
import React from "react";
import Link from "next/link";
import { RevealFx } from "~/once-ui/components";
import { AudioRecorderWithVisualizer } from "~/components/ui/audio-recorder";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Mic2, Waves, Globe2, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "~/components/ui/button";
import { LetterFx } from "~/once-ui/components";
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  Terminal,
  Mic,
  Play,
  Pause,
  Trash2,
  RefreshCw,
} from "lucide-react";


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
  const voiceCommands = [
    {
      command: "back to bridge",
      description: "Return to the main dashboard",
      icon: <Terminal className="h-5 w-5" />,
      shortcut: "Ctrl + B",
    },
    {
      command: "pause recording",
      description: "Temporarily halt the current recording",
      icon: <Pause className="h-5 w-5" />,
      shortcut: "Ctrl + P",
    },
    {
      command: "resume recording",
      description: "Continue recording after a pause",
      icon: <Play className="h-5 w-5" />,
      shortcut: "Ctrl + R",
    },
    {
      command: "stop recording",
      description: "End the current recording session",
      icon: <Command className="h-5 w-5" />,
      shortcut: "Ctrl + S",
    },
    {
      command: "delete recording",
      description: "Remove the current recording",
      icon: <Trash2 className="h-5 w-5" />,
      shortcut: "Ctrl + D",
    },
    {
      command: "play recording",
      description: "Listen to the recorded audio",
      icon: <Play className="h-5 w-5" />,
      shortcut: "Ctrl + L",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
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

      <MotionConfig reducedMotion="user">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="container mx-auto px-4 py-8 relative"
        >
          <section
            id="dashboard"
            className="mx-auto max-w-7xl px-6 text-center md:px-8"
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
                <CardHeader className="space-y-4 text-center">
                  <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                    <LetterFx>Create a new Starlog</LetterFx>
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Record the details of your new starlog entry.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Audio Recorder Card */}
              <Card className="shadow-md">
                <br className="animate-fade-in" />
                <CardContent>
                  <div className="relative mx-auto max-w-3xl space-y-6">
                    {/* Audio Recorder with Glow Effect */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground opacity-25 blur"></div>
                      <div className="relative ">
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
              </Card>
            </div>

            <AnimatePresence>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Mic className="h-6 w-6 text-primary" />
                    Voice Commands
                  </CardTitle>
                  <CardDescription>
                    Intuitive voice controls for your starlog recording
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {voiceCommands.map((cmd, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="bg-secondary/20 rounded-lg p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>{cmd.icon}</TooltipTrigger>
                              <TooltipContent>{cmd.command}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div>
                            <p className="font-medium text-foreground">
                              {cmd.command}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {cmd.description}
                            </p>
                          </div>
                        </div>
                        <Button className="text-xs hover:text-black dark:hover:text-white hover:bg-secondary/50 px-2 py-1 rounded">
                          {cmd.shortcut}
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </AnimatePresence>

            {/* Stardate Display */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Stardate {calculateStardate()}</p>
            </div>
          </section>
        </motion.div>
      </MotionConfig>
    </>
  );
}
