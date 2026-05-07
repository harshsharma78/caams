'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Target,
  Users,
  FileText,
  BookOpen,
  ShieldCheck,
  Settings,
} from 'lucide-react';

import type { UserRole } from '@/types';

const navigation = [
  { href: '/admin', label: 'Admin', adminOnly: true, icon: Settings },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/assessments', label: 'Assessments', icon: Target },
  { href: '/interviews', label: 'Interviews', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/casestudies', label: 'Case Studies', icon: BookOpen },
  { href: '/security', label: 'Security Checks', icon: ShieldCheck },
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
          className='fixed inset-0 z-30 bg-slate-950/50 md:hidden'
          onClick={onClose}
          aria-label='Close navigation'
        />
      ) : null}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white py-6 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950',
          open
            ? 'translate-x-0 w-72 px-5'
            : '-translate-x-full w-72 px-5 md:translate-x-0 md:w-20 md:px-4 lg:w-72 lg:px-5',
        ].join(' ')}>
        <div className='flex flex-col items-center lg:items-start lg:space-y-1'>
          {/* Desktop (lg+): show full branding */}
          <p className='hidden text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400 lg:block'>
            CAAMS
          </p>
          <h2 className='hidden text-2xl font-semibold text-slate-900 dark:text-slate-50 lg:block'>
            Cloud Adoption
          </h2>
          <p className='hidden text-sm text-slate-500 dark:text-slate-400 lg:block'>
            Signed in as {role === 'admin' ? 'Administrator' : 'Assessor'}
          </p>

          {/* Mobile (when open): show full branding */}
          {open && (
            <>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400 lg:hidden'>
                CAAMS
              </p>
              <h2 className='text-2xl font-semibold text-slate-900 dark:text-slate-50 lg:hidden'>
                Cloud Adoption
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400 lg:hidden'>
                Signed in as {role === 'admin' ? 'Administrator' : 'Assessor'}
              </p>
            </>
          )}

          {/* Tablet collapsed view: just show "CAAMS" text (no logo box) */}
          <span className={[
            'text-xs font-bold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400 lg:hidden',
            open ? 'hidden' : 'hidden md:block',
          ].join(' ')}>
            CAAMS
          </span>
        </div>
        <nav className='mt-8 space-y-2'>
          {navigation
            .filter(
              (item) =>
                !('adminOnly' in item && item.adminOnly) || role === 'admin',
            )
            .map((item) => {
              const isActive =
                item.href !== '#' &&
                (pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(item.href)));

              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href === '#' ? '/dashboard' : item.href}
                  className={[
                    'group flex items-center rounded-xl py-3 text-sm font-medium transition',
                    open ? 'px-4' : 'justify-center px-0 lg:justify-start lg:px-4',
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                  ].join(' ')}
                  title={item.label}
                  onClick={onClose}>
                  <Icon
                    className={[
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                      open ? 'mr-3' : 'mr-0 lg:mr-3',
                    ].join(' ')}
                  />
                  <span className={open ? 'block' : 'hidden lg:block'}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
