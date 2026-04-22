import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/forms/LoginForm';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CAAMS | Login',
};

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main>
      <LoginForm />
    </main>
  );
}
