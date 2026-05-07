'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { Trash2 } from 'lucide-react';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function DeleteCaseStudyButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300'
        onClick={() => setOpen(true)}>
        <Trash2 className='h-3.5 w-3.5' />
        Delete
      </Button>
      <Modal
        open={open}
        title='Delete case study'
        description={`Delete "${title}"? This action cannot be undone.`}
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
            const response = await fetch(`/api/casestudies/${id}`, {
              method: 'DELETE',
            });

            const data = (await response.json().catch(() => ({}))) as {
              error?: string;
            };

            if (!response.ok) {
              const message = data.error ?? 'Unable to delete case study.';
              setError(message);
              toast.error(message);
              return;
            }

            toast.success('Case study deleted successfully.');
            setOpen(false);
            router.push('/casestudies');
            router.refresh();
          });
        }}>
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </Modal>
    </>
  );
}
