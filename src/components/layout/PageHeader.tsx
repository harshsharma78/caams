import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
  action,
}: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='space-y-1'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50'>
          {title}
        </h1>
        <p className='text-sm text-slate-600 dark:text-slate-300'>
          {description}
        </p>
      </div>
      {action ? (
        action
      ) : actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
