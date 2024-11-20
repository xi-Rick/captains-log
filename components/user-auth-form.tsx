'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { cn } from '~/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { buttonVariants } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { signIn, signOut } from 'next-auth/react';

export const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});
type FormData = z.infer<typeof userAuthSchema>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
    defaultValues: {
      email: '',
    },
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);

  async function onSubmit(_data: FormData) {
    setIsLoading(true);

    // TODO: Add signin using preferred provider
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const signInResult = { ok: true };
    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast.error('Something went wrong.', {
        description: 'Your sign in request failed. Please try again.',
      });
    }

    return toast.success('Check your email', {
      description: 'We sent you a login link. Be sure to check your spam too.',
    });
  }

  async function onSignInGithub() {
    setIsGitHubLoading(true);
    // TODO: Add signin using preferred provider
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsGitHubLoading(false);
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {/* Add more sign-in options as needed */}
      <Button onClick={() => signIn('google')}>Sign in with Google</Button>
    </div>
  );
}
