'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlignJustify, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Text } from '~/once-ui/components';
import { signOut, useSession } from 'next-auth/react';

export function SiteHeader() {
  const mobilenavbarVariant = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.2,
        ease: 'easeOut',
      },
    },
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.toggle('overflow-hidden', hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);
    window.addEventListener('orientationchange', closeHamburgerNavigation);
    window.addEventListener('resize', closeHamburgerNavigation);

    return () => {
      window.removeEventListener('orientationchange', closeHamburgerNavigation);
      window.removeEventListener('resize', closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  const { data: session } = useSession();

  return (
    <>
      <header className="animate-fade-in fixed left-0 top-0 z-50 w-full -translate-y-4 border-b opacity-0 backdrop-blur-md [--animation-delay:600ms]">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/icon-128x128.png"
              alt="Captain's Log logo"
              className="text-primary size-8"
            />
            <span className="self-center whitespace-nowrap text-md font-semibold dark:text-white hidden sm:inline">
              Captain's Log
            </span>
          </Link>

          <div className="ml-auto flex h-full items-center">
            {session ? (
              <>
                <img
                  src={session.user?.image || '/images/default-avatar.png'}
                  alt="User Avatar"
                  className="h-8 w-8 rounded-full mr-4"
                />
                <span className="mr-4 text-sm">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link className="mr-6 text-sm" href="/login">
                Log in
              </Link>
            )}
          </div>
          <button
            className="ml-6 md:hidden"
            onClick={() => setHamburgerMenuIsOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={hamburgerMenuIsOpen ? 'animate' : 'exit'}
          className={`bg-background/70 fixed left-0 top-0 z-50 h-screen w-full overflow-auto backdrop-blur-md ${
            !hamburgerMenuIsOpen ? 'pointer-events-none' : ''
          }`}
        >
          <div className="container flex h-14 items-center justify-between">
            <Link className="text-md flex items-center" href="/">
              <img
                src="/images/icon-128x128.png"
                alt="Captain's Log logo"
                className="text-primary size-8"
              />
            </Link>
            <button
              className="ml-6 md:hidden"
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
          <motion.div
            className="flex flex-col items-center justify-center p-6 text-lg text-center text-muted-foreground"
            variants={containerVariants}
            initial="initial"
            animate={hamburgerMenuIsOpen ? 'open' : 'exit'}
          >
            <Text>
              🚀 Captain's Log, Stardate 9529.1: This is the final cruise of the
              Starship Enterprise under my command. This ship and her history
              will shortly become the care of another crew. To them and their
              posterity will we commit our future. They will continue the
              voyages we have begun and journey to all the undiscovered
              countries, boldly going where no man - where no one - has gone
              before.
            </Text>
          </motion.div>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
