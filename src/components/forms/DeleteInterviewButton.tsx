'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

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
            router.push('/interviews');
            router.refresh();
          }
        });
      }}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
