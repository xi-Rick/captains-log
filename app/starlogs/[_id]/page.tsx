'use client';
import { useEffect, useState } from 'react';
import { StarLog } from '~/app/types/starLog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Heart, Tag, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '~/hooks/use-toast';
import TypingAnimation from '~/components/ui/typing-animation';
import { formatTimestamp } from '~/lib/timestamp';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

interface StarLogsPageProps {
  params: { _id: string };
}

export default function StarLogsPage({ params }: StarLogsPageProps) {
  const { _id } = params;
  const [starLog, setStarLog] = useState<StarLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStarLog() {
      try {
        const response = await fetch(`/api/getStarlog?id=${_id}`);
        const data = await response.json();
        setStarLog(data);
      } catch (error) {
        console.error('Error fetching star log:', error);
        setError('Error fetching star log.');
      } finally {
        setLoading(false);
      }
    }

    fetchStarLog();
  }, [_id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deleteStarlog`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: _id }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Star log deleted successfully',
        });
        router.push('/starlogs');
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to delete the star log',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting star log:', error);
      setError('Error deleting the star log.');
    }
  };

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

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(black_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-25"></div>
      </div>

      <MotionConfig reducedMotion="user">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative mx-auto max-w-4xl px-4 py-8"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 flex items-center justify-between"
          >
            <Link href="/starlogs">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Starlogs
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-red-500"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="animate-pulse border-none shadow-sm">
                  <CardHeader>
                    <div className="h-8 w-2/3 rounded bg-muted" />
                    <div className="mt-4 flex gap-4">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-4 w-24 rounded bg-muted" />
                    </div>
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
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              >
                {error}
              </motion.div>
            ) : starLog ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <TypingAnimation
                      className="text-2xl font-bold"
                      duration={30}
                      text={starLog.title}
                    />

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatTimestamp(starLog.timestamp)}
                      </div>
                      {starLog.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {starLog.duration} seconds
                        </div>
                      )}
                      {starLog.sentiment && (
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          {starLog.sentiment}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="prose max-w-none">
                      <p className="dark:text-white leading-relaxed">
                        {starLog.text || starLog.content}
                      </p>
                    </div>

                    {starLog.keywords && starLog.keywords.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Tag className="h-4 w-4" />
                          Keywords
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {starLog.keywords.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>Star log not found</CardHeader>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your star log.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
