'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setOpen(true)}>
        Logout
      </Button>
      <Modal
        open={open}
        title='Sign out'
        description='Are you sure you want to log out of your account?'
        confirmLabel='Log out'
        cancelLabel='Stay signed in'
        confirmVariant='danger'
        onClose={() => setOpen(false)}
        onConfirm={() => signOut({ callbackUrl: '/login' })}
      />
    </>
  );
}
