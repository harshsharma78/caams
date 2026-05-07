'use client';

import { Menu } from 'lucide-react';
import type { AppSessionUser } from '@/lib/auth';
import { LogoutButton } from '@/components/layout/LogoutButton';
interface NavbarProps {
  user: AppSessionUser;
  onMenuClick: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  return (
    <header className='sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-6'>
      <div className='flex items-center gap-3'>
        <button
          className='inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 md:hidden'
          onClick={onMenuClick}
          aria-label='Open navigation'>
          <Menu className='h-5 w-5' />
        </button>
        <div>
          <p className='text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400'>
            <span className='lg:hidden'>CAAMS</span>
            <span className='hidden lg:inline'>Cloud Adoption Assessment and Management System</span>
          </p>
          <h1 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            Workspace
          </h1>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        {/* <ThemeToggle /> */}
        <div className='hidden text-right sm:block'>
          <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
            {user.name}
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {user.email}
          </p>
        </div>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300'>
          {user.name?.slice(0, 1).toUpperCase() ?? 'U'}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
