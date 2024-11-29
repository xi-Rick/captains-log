'use client';

import { ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarLog } from '~/app/types/starLog';
import { RevealFx } from '~/once-ui/components';
import NumberTicker from '../ui/number-ticker';
import { formatTimestamp } from '~/lib/timestamp';

export default function DashboardHeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const [recentLogs, setRecentLogs] = useState<StarLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logsThisMonth, setLogsThisMonth] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else {
      const fetchLogs = async () => {
        if (session) {
          try {
            setIsLoading(true);
            const response = await fetch('/api/getStarlogs');
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log('Logs Data:', data);

            setTotalEntries(data.totalEntries);
            setRecentLogs(data.recentRecordings);
            setLogsThisMonth(data.logsThisMonth);
            setStreak(data.streak);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Failed to fetch logs',
            );
          } finally {
            setIsLoading(false);
          }
        }
      };

      fetchLogs();
    }
  }, [status, router, session]);

  if (status === 'loading') return null;

  return (
    <section id="dashboard" className="relative container mx-auto px-4 py-14">
      {/* Content Container with z-index to appear above SphereMask */}
      <div className="relative z-10 space-y-8">
        {/* Welcome Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-5xl font-bold">
              Welcome Back, Captain
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-lg text-muted-foreground">
              Continue your journey through the stars and explore your mission
              updates.
            </span>
            <br />
            <Button className="mt-6" size="lg" asChild>
              <Link href="/starlogs/new">
                <span className="inline-flex items-center">
                  New Log Entry <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Starlog Entries</CardTitle>
            </CardHeader>
            <RevealFx>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground"></p>
                ) : error ? (
                  <p className="text-destructive">
                    Error fetching logs: {error}
                  </p>
                ) : recentLogs.length === 0 ? (
                  <p className="text-muted-foreground">
                    No recent logs available.
                  </p>
                ) : (
                  <RevealFx>
                    <ul className="space-y-4">
                      {recentLogs.slice(0, 4).map((log) => (
                        <li key={log._id.toString()}>
                          <Button
                            variant="ghost"
                            className="w-full justify-between"
                            asChild
                          >
                            <Link href={`/starlogs/${log._id}`}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {log.title ||
                                    `Starlog Entry ${log._id.toString().slice(-4)}`}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                              <ArrowRight className="h-5 w-5" />
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </RevealFx>
                )}
              </CardContent>
            </RevealFx>
            <CardFooter>
              <Button variant="link" className="w-full" asChild>
                <Link href="/starlogs">View All Logs</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Mission Progress Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Entries</span>
                <span className="font-medium">
                  <NumberTicker
                    value={totalEntries !== null ? totalEntries : 0}
                  />
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">
                  <NumberTicker
                    value={logsThisMonth !== null ? logsThisMonth : 0}
                  />
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-medium">
                  {streak !== null ? `${streak} days` : 'Loading...'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ship's Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  asChild
                >
                  <Link href="/settings">
                    <span>Settings</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </section>
  );
}
