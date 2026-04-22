'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';

interface DeleteInterviewButtonProps {
  id: string;
  intervieweeName: string;
}

export function DeleteInterviewButton({
  id,
  intervieweeName,
}: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type='button'
        disabled={isPending}
        className='cursor-pointer font-medium text-rose-600 transition hover:text-rose-700 disabled:opacity-50'
        onClick={() => setOpen(true)}>
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      <Modal
        open={open}
        title='Delete interview'
        description={`Delete the interview with "${intervieweeName}"? This action cannot be undone.`}
        confirmLabel={isPending ? 'Deleting...' : 'Delete'}
        confirmVariant='danger'
        isLoading={isPending}
        onClose={() => {
          if (!isPending) {
            setOpen(false);
            setError('');
          }
        }}
        onConfirm={() => {
          setError('');

          startTransition(async () => {
            const response = await fetch(`/api/interviews/${id}`, {
              method: 'DELETE',
            });

            const data = (await response.json().catch(() => ({}))) as {
              error?: string;
            };

            if (!response.ok) {
              const message = data.error ?? 'Unable to delete interview.';
              setError(message);
              toast.error(message);
              return;
            }

            toast.success('Interview deleted successfully.');
            setOpen(false);
            router.push('/interviews');
            router.refresh();
          });
        }}>
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </Modal>
    </>
  );
}
