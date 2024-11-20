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
import { RevealFx } from '~/once-ui/components';
import { useToast } from '~/hooks/use-toast';
import TypingAnimation from '~/components/ui/typing-animation';
import { formatTimestamp } from '~/lib/timestamp';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg"></div>
      </div>
    );
  }

  if (!starLog) {
    return (
      <Card className="mx-auto max-w-4xl mt-8">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="text-xl font-semibold text-gray-800">
            Star log not found
          </div>
          <Link href="/starlogs">
            <Button className="mt-4">Return to Starlogs</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <RevealFx>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
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
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                star log.
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
      </div>
    </RevealFx>
  );
}
