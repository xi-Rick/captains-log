'use client';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { Metadata } from 'next';
import { useSession } from 'next-auth/react';
import { RevealFx } from '~/once-ui/components';
import HeroSection from '~/components/landing/hero-section';

export default function NotAuthorized() {
  const { data: session, status } = useSession();

  return (
    <RevealFx>
      <div className="container flex h-screen items-center justify-center flex-col text-center">
        <RevealFx>
          <h1 className="text-5xl font-semibold mb-4">404</h1>
        </RevealFx>
        {status === 'loading' ? (
          <p className="text-lg"></p>
        ) : session ? (
          <>
            <RevealFx>
              <h2 className="text-2xl font-semibold mb-4">
                Hey there, Captain!
              </h2>
              <p className="text-lg mb-6">
                Seems like you've hit a dead end. Why not create a new page or
                explore the app further?
              </p>
            </RevealFx>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              You are not authorized to view this page.
            </h2>
            <p className="text-lg mb-6">
              This web app is designed for a single user. Only the authorized
              user can access the content. If you'd like to get involved, go
              ahead and build the app yourself!
            </p>
          </>
        )}
        <RevealFx>
          <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
            Back to Home
          </Link>
        </RevealFx>
      </div>
    </RevealFx>
  );
}
