import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CAAMS | Home',
};

export default async function HomePage() {
  const session = await auth();

  redirect(session ? '/dashboard' : '/login');
}
