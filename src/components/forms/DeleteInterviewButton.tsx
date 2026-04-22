'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import toast from 'react-hot-toast';

interface DeleteInterviewButtonProps {
  id: string;
  intervieweeName: string;
}

export function DeleteInterviewButton({
  id,
  intervieweeName,
}: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type='button'
      disabled={isPending}
      className='font-medium text-rose-600 transition hover:text-rose-700 disabled:opacity-50'
      onClick={() => {
        if (
          !confirm(
            `Delete the interview with "${intervieweeName}"? This cannot be undone.`,
          )
        ) {
          return;
        }

        startTransition(async () => {
          const response = await fetch(`/api/interviews/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            toast.success('Interview deleted successfully.');
            router.push('/interviews');
            router.refresh();
          } else {
            toast.error('Unable to delete interview.');
          }
        });
      }}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
