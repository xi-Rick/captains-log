import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '~/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';

export function AccountSettings() {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmFor, setConfirmFor] = useState<string | null>(null);

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

  const handleDelete = async (action: string) => {
    if (confirmInput !== 'DELETE') {
      toast({
        title: 'Confirmation Failed',
        description: 'Please type DELETE to confirm.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeleting(true);

      let response;
      switch (action) {
        case 'all':
          response = await fetch('/api/clearStarlogs', { method: 'DELETE' });
          break;
        case 'lastMonth':
          response = await fetch('/api/clearLastMonthLogs', {
            method: 'DELETE',
          });
          break;
        case 'thisMonth':
          response = await fetch('/api/clearThisMonthLogs', {
            method: 'DELETE',
          });
          break;
        default:
          throw new Error('Invalid action');
      }

      if (!response.ok) {
        throw new Error(`Failed to clear logs for ${action}`);
      }

      toast({
        title: 'Success',
        description: `Logs for ${action === 'all' ? 'all time' : action.replace('Month', ' month')} have been cleared.`,
      });
      setShowConfirmDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setConfirmInput(''); // Reset input after action
      setConfirmFor(null);
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Star Log Management</h2>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          These actions permanently modify your star log data. Please proceed
          with caution.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setConfirmFor('all');
                setShowConfirmDialog(true);
              }}
            >
              Clear All Star Logs
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. To confirm, type{' '}
                <strong>DELETE</strong> in the box below.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Type DELETE to confirm"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmFor && handleDelete(confirmFor)}
                disabled={isDeleting || confirmInput !== 'DELETE'}
              >
                {isDeleting ? 'Deleting...' : `Yes, delete ${confirmFor}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setConfirmFor('lastMonth');
            setShowConfirmDialog(true);
          }}
        >
          Clear Last Month's Logs
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setConfirmFor('thisMonth');
            setShowConfirmDialog(true);
          }}
        >
          Clear This Month's Logs
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={exportDataHandler}
        >
          Export All Logs
        </Button>
      </div>
    </section>
  );
}
