'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardHeroSection from '~/components/landing/dashboard-section';
import { RevealFx } from '~/once-ui/components';

export default function Page() {
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
    return (
      <div></div> // You can customize the loading state
    );
  }

  // If not authenticated or the email doesn't match, don't render the page content
  if (status === 'unauthenticated') {
    router.push('/not-authorized');
  }

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
        <div className="mx-auto px-4 py-8 space-y-8 flex-1 overflow-hidden">
          <DashboardHeroSection />
        </div>
      </RevealFx>
    </>
  );
}
