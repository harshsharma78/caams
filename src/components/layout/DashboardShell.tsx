'use client';

import { useState, type ReactNode } from 'react';

import type { AppSessionUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardShell({
  user,
  children,
}: {
  user: AppSessionUser;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <Sidebar
        open={sidebarOpen}
        role={user.role}
        onClose={() => setSidebarOpen(false)}
      />
      <div className='lg:pl-72'>
        <Navbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className='px-4 py-8 md:px-6'>{children}</main>
      </div>
    </div>
  );
}
