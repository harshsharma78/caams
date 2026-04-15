'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { UserRole } from '@/types';

const navigation = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/organizations', label: 'Organizations' },
  { href: '#', label: 'Assessments' },
  { href: '#', label: 'Interviews' },
  { href: '#', label: 'Case Studies' },
  { href: '#', label: 'Security Checks' },
];

interface SidebarProps {
  open: boolean;
  role: UserRole;
  onClose: () => void;
}

export function Sidebar({ open, role, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          className='fixed inset-0 z-30 bg-slate-950/50 lg:hidden'
          onClick={onClose}
          aria-label='Close navigation'
        />
      ) : null}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}>
        <div className='space-y-1'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400'>
            CAAMS
          </p>
          <h2 className='text-2xl font-semibold text-slate-900 dark:text-slate-50'>
            Cloud Adoption
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Signed in as {role === 'admin' ? 'Administrator' : 'Viewer'}
          </p>
        </div>
        <nav className='mt-8 space-y-2'>
          {navigation.map((item) => {
            const isActive =
              item.href !== '#' &&
              (pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href)));

            return (
              <Link
                key={item.label}
                href={item.href === '#' ? '/dashboard' : item.href}
                className={[
                  'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                ].join(' ')}
                onClick={onClose}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
