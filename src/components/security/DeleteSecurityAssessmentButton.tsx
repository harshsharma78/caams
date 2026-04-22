'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';

export function DeleteSecurityAssessmentButton({
  id,
  organizationName,
}: {
  id: string;
  organizationName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type='button'
        className='text-sm font-medium text-rose-600 transition hover:text-rose-700'
        onClick={() => setOpen(true)}>
        Delete
      </button>
      <Modal
        open={open}
        title='Delete security assessment'
        description={`Delete the security assessment for "${organizationName}"? This action cannot be undone.`}
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
            const response = await fetch(`/api/security/${id}`, {
              method: 'DELETE',
            });

            const data = (await response.json().catch(() => ({}))) as {
              error?: string;
            };

            if (!response.ok) {
              const message =
                data.error ?? 'Unable to delete security assessment.';
              setError(message);
              toast.error(message);
              return;
            }

            toast.success('Security assessment deleted successfully.');
            setOpen(false);
            router.push('/security');
            router.refresh();
          });
        }}>
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </Modal>
    </>
  );
}
