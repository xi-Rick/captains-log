'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { StarLog } from '~/app/types/starLog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { RevealFx } from '~/once-ui/components';
import { Input } from '~/once-ui/components';
import { formatTimestamp } from '~/lib/timestamp';

export default function StarLogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [starLogs, setStarLogs] = useState<StarLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (status === 'authenticated') {
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL; // The allowed user email
      if (session.user?.email !== allowedEmail) {
        router.push('/not-authorized'); // Redirect to not-authorized page if the email doesn't match
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchStarLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/getStarlogs/');
        if (!response.ok) {
          throw new Error(`Error fetching star logs: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data.recentRecordings)) {
          setStarLogs(data.recentRecordings);
        } else {
          throw new Error('Expected an array of logs.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarLogs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredLogs = starLogs.filter(
    (log) =>
      (log.title &&
        log.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.text && log.text.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Optionally, you can show a loading state while checking the session
  if (status === 'loading') {
    return <div></div>;
  }

  // If not authenticated or the email doesn't match, don't render the page content
  if (status === 'unauthenticated') {
    router.push('/not-authorized'); // Redirect to not-authorized page if the email doesn't match
  }

  return (
    <RevealFx>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Bridge
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md mx-auto">
          <div className="absolute top-2 left-3 flex items-center text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <Input
            id="search"
            label=""
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 "
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {isLoading ? (
          <Card className="animate-pulse border-none shadow-sm">
            <CardHeader>
              <div className="h-8 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card
              key={log._id.toString()}
              className="border shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`/starlogs/${log._id.toString()}`}>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    {log.title || `Log Entry ${log._id.toString().slice(-4)}`}
                  </CardTitle>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                </CardHeader>
              </Link>
              <CardContent>
                <div className="prose dark:prose-invert">
                  {log.text || log.content ? (
                    (log.text || log.content)
                      .split('\n')
                      .map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))
                  ) : (
                    <p>No text available for this log.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">
                No Logs Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                No logs match your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RevealFx>
  );
}
