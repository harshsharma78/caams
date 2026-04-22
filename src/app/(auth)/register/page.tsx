import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { RegisterForm } from '@/components/forms/RegisterForm';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CAAMS | Register',
};

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main>
      <RegisterForm />
    </main>
  );
}
