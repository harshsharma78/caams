import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { auth } from '@/lib/auth';
import { canViewDashboard } from '@/lib/permissions';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !canViewDashboard(session.user.role)) {
    redirect('/login');
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
