'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => signOut({ callbackUrl: '/login' })}>
      Logout
    </Button>
  );
}
