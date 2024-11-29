'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RevealFx } from '~/once-ui/components';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '~/components/theme-switcher';
import { AccountSettings } from '~/components/account-settings';
import { ArrowLeft, Settings, User, HelpCircle } from 'lucide-react'; // Import additional icons
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL; // The allowed user email
      if (session.user?.email !== allowedEmail) {
        // Redirect to the "not-authorized" page if the email doesn't match
        router.push('/not-authorized');
      }
    }
  }, [status, session, router]);

  // Optionally, you can show a loading state while checking the session
  if (status === 'loading') {
    return <div></div>;
  }

  // If not authenticated or the email doesn't match, don't render the page content
  if (status === 'unauthenticated') {
    router.push('/not-authorized');
  }

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
            id="settings"
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

            <h1 className="text-3xl font-bold text-center mb-8">Settings</h1>

            {/* Account Settings Section */}
            <AccountSettings />

            {/* App Preferences Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" /> {/* Settings Icon */}
                App Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" /> {/* User Icon */}
                    Theme
                  </span>
                  <ThemeSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" /> {/* Help Icon */}
                    Help
                  </span>

                  <Button
                    onClick={() =>
                      window.open(
                        'https://github.com/xi-rick/captains-log',
                        '_blank',
                      )
                    }
                    variant="outline"
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            </section>
          </section>
        </motion.div>
      </MotionConfig>
    </>
  );
}
