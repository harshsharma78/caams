'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';

export function DeleteOrganizationButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className='text-sm font-medium text-rose-600 transition hover:text-rose-700'
        onClick={() => setOpen(true)}>
        Delete
      </button>
      <Modal
        open={open}
        title='Delete organization'
        description={`Delete ${name}? This action cannot be undone.`}
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
            const response = await fetch(`/api/organizations/${id}`, {
              method: 'DELETE',
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
              setError(data.error ?? 'Unable to delete organization.');
              toast.error(data.error ?? 'Unable to delete organization.');
              return;
            }

            toast.success('Organization deleted successfully.');
            setOpen(false);
            router.push('/organizations');
            router.refresh();
          });
        }}>
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </Modal>
    </>
  );
}
