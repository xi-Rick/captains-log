'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { UserAuthForm } from '~/components/user-auth-form';
import { cn } from '~/lib/utils';
import { RevealFx } from '~/once-ui/components';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL; // Define the allowed user email
      if (session.user?.email !== allowedEmail) {
        // Sign out the user and redirect to not-authorized page
        signOut({ callbackUrl: '/not-authorized' });
      } else {
        router.push('/dashboard'); // Redirect to the dashboard if the email matches
      }
    }
  }, [status, router, session]);

  // If user is authenticated, redirect them immediately
  if (status === 'authenticated') {
    return null; // This prevents the login form from rendering for authenticated users
  }

  // Optionally, you can show a loading state while checking the session
  if (status === 'loading') {
    return <div></div>;
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
          <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back to Captain's Log
              </h1>
            </div>
            <UserAuthForm />
            <span className="text-muted-foreground px-8 text-center text-sm"></span>
          </div>
        </div>
      </RevealFx>
    </>
  );
}
