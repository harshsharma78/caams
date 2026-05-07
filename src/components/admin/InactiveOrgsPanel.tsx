'use client';

import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';

import type { AdminInactiveOrganizationItem } from '@/types/admin-dashboard';

export function InactiveOrgsPanel({
  data,
}: {
  data: AdminInactiveOrganizationItem[];
}) {
  return (
    <div className='rounded-xl border border-amber-700/50 bg-amber-950/20 p-6'>
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900/40 text-amber-400'>
          <AlertTriangle className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-amber-400'>
            Inactive Organizations
          </h3>
          <p className='text-sm text-amber-600'>
            Organizations with no activity in 60+ days
          </p>
        </div>
      </div>
      {data.length ? (
        <div className='space-y-4'>
          {data.map((item) => (
            <div
              key={item.name}
              className='rounded-lg border border-amber-700/30 bg-amber-950/10 p-4'>
              <p className='text-sm font-medium text-amber-200'>{item.name}</p>
              <p className='mt-1 text-xs text-amber-400'>
                {item.daysSinceActivity} days inactive
              </p>
              <p className='mt-1 text-xs text-amber-600'>
                Last activity:{' '}
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(item.lastActivity))}
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-3 border-amber-700/50 text-xs text-amber-400 hover:bg-amber-950/30 hover:text-amber-300'
                onClick={() => toast.success(`Reminder queued for ${item.name}.`)}>
                Send Reminder
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-sm text-amber-600'>All organizations are active.</p>
      )}
    </div>
  );
}
