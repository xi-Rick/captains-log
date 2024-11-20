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

  return (
    <RevealFx>
      <div className="container mx-auto py-10 px-6 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bridge
          </Button>
        </Link>

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
      </div>
    </RevealFx>
  );
}
