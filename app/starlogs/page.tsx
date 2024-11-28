'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { StarLog } from '~/app/types/starLog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { formatTimestamp } from '~/lib/timestamp';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

export default function StarLogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [starLogs, setStarLogs] = useState<StarLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (status === 'authenticated') {
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;
      if (session.user?.email !== allowedEmail) {
        router.push('/not-authorized');
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

  // Redirect or loading states
  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    router.push('/not-authorized');
    return null;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  function highlightText(text: string, searchTerm: string) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-red-500 text-primary-foreground rounded px-1 py-0.5"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
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

      <MotionConfig reducedMotion="user">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative mx-auto max-w-4xl px-4 py-8 space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 flex items-center justify-between"
          >
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Bridge
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative max-w-md mx-auto"
          >
            <div className="absolute top-2 left-3 flex items-center text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="animate-pulse border-none shadow-sm">
                  <CardHeader>
                    <div className="h-8 w-2/3 rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 w-full rounded bg-muted" />
                      <div className="h-4 w-5/6 rounded bg-muted" />
                      <div className="h-4 w-4/6 rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-destructive/20 bg-destructive/10 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredLogs.length > 0 ? (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatePresence>
                  {filteredLogs.map((log) => (
                    <motion.div
                      key={log._id.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <Link href={`/starlogs/${log._id.toString()}`}>
                          <CardHeader>
                            <CardTitle className="text-xl font-bold">
                              {log.title ||
                                `Log Entry ${log._id.toString().slice(-4)}`}
                            </CardTitle>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                    {highlightText(paragraph, searchTerm)}
                                  </p>
                                ))
                            ) : (
                              <p>No text available for this log.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="no-logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>No Logs Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      No logs match your search criteria.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </MotionConfig>
    </>
  );
}
