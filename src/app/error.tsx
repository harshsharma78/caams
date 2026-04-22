'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6 text-center'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'>
        <AlertCircle className='h-10 w-10' />
      </div>
      <h2 className='mb-3 text-2xl font-bold text-slate-900 dark:text-slate-50'>
        Something went wrong!
      </h2>
      <p className='mb-8 max-w-md text-slate-600 dark:text-slate-400'>
        {error.message || 'An unexpected error occurred while processing your request. Please try again later.'}
      </p>
      <div className='flex gap-4'>
        <Button onClick={() => window.location.href = '/'}>
          Go to Home
        </Button>
        <Button variant='outline' onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
