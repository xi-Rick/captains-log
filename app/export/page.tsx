'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { RevealFx } from '~/once-ui/components';
import { useToast } from '~/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';

export default function ExportData() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
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

  const exportDataHandler = async () => {
    try {
      const response = await fetch('/api/getStarlogs', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch star logs.');
      }

      const data = await response.json();

      // Create a Blob from the data
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      // Create a temporary anchor element for the download
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'star_logs.json';
      anchor.click();

      // Revoke the URL after download
      URL.revokeObjectURL(url);

      // Show a toast notification
      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded as star_logs.json.',
        action: <ToastAction altText="Undo export">Success</ToastAction>,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting your data.',
      });
    }
  };

  return (
    <RevealFx>
      <div className="container flex h-screen items-center justify-center flex-col text-center">
        <h1 className="text-2xl font-semibold mb-4">Export Data</h1>
        <Button variant="outline" onClick={exportDataHandler}>
          Export
        </Button>
        <br className="h-4" />
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: 'ghost' })}
        >
          Back to Dash
        </Link>
      </div>
    </RevealFx>
  );
}
