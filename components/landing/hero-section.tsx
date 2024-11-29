'use client';

import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { BorderBeam } from '~/components/ui/border-beam';
import TextShimmer from '~/components/ui/text-shimmer';
import { Button } from '~/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RevealFx } from '~/once-ui/components';

export default function HeroSection() {
  const { data: session } = useSession(); // Get the session data
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-7xl px-6 text-center md:px-8"
    >
      {/* Intro Banner */}
      <div className="backdrop-filter-[12px] animate-fade-in group inline-flex h-7 -translate-y-4 items-center justify-between gap-1 rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white opacity-0 transition-all ease-in hover:cursor-pointer hover:bg-white/20 dark:text-black">
        <TextShimmer className="inline-flex items-center justify-center">
          <span>🚀 Welcome to Captain's Log</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>

      {/* Hero Title */}
      <h1 className="animate-fade-in -translate-y-4 text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] sm:text-6xl md:text-7xl lg:text-8xl dark:from-white dark:to-white/40">
        Transcribe Your Journey
        <br className="md:block" />
        One Starlog at a Time
      </h1>

      {/* Subtitle */}
      <p className="animate-fade-in mb-12 -translate-y-4 text-balance text-lg tracking-tight text-gray-400 opacity-0 [--animation-delay:400ms] md:text-xl">
        Harness the power of AI and beautifully designed tools
        <br className="md:block" />
        to capture, organize, and relive your thoughts.
      </p>

      {/* Call to Action */}
      {session ? (
        <RevealFx>
          <Link href="/dashboard">
            <Button className="animate-fade-in -translate-y-4 gap-1 rounded-lg text-white opacity-0 ease-in-out [--animation-delay:600ms] dark:text-black">
              <span>Go To Your Logbook</span>
              <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Button>
          </Link>
        </RevealFx>
      ) : (
        <RevealFx>
          <Link href="#setup">
            <Button className="animate-fade-in -translate-y-4 gap-1 rounded-lg text-white opacity-0 ease-in-out [--animation-delay:600ms] dark:text-black">
              <span>Start Your Logbook</span>
              <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Button>
          </Link>
        </RevealFx>
      )}

      {/* Hero Image */}
      <div
        ref={ref}
        className="animate-fade-up relative mt-32 opacity-0 [--animation-delay:400ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_30%,transparent)]"
      >
        <div
          className={`rounded-xl border border-white/10 bg-white bg-opacity-[0.01] before:absolute before:bottom-1/2 before:left-0 before:top-0 before:size-full before:opacity-0 before:[background-image:linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_40%)] before:[filter:blur(180px)] ${
            inView ? 'before:animate-image-glow' : ''
          }`}
        >
          <BorderBeam
            size={200}
            duration={12}
            delay={11}
            colorFrom="var(--color-one)"
            colorTo="var(--color-two)"
          />

          <img
            src="/hero.png"
            alt="Captain's Log Hero Dark"
            className="relative hidden size-full rounded-[inherit] border object-contain dark:block"
          />
          <img
            src="/hero.png"
            alt="Captain's Log Hero Light"
            className="relative block size-full rounded-[inherit] border object-contain dark:hidden"
          />
        </div>
      </div>
    </section>
  );
}
