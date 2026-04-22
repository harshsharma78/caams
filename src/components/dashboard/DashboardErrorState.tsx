'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export function DashboardErrorState() {
  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <div className='w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600'>
          <AlertTriangle className='h-7 w-7' />
        </div>
        <h2 className='mt-5 text-2xl font-semibold text-slate-900'>
          Failed to load dashboard data
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          The analytics service could not assemble the latest metrics. Try the
          request again.
        </p>
        <div className='mt-6 flex justify-center'>
          <Button
            className='bg-slate-900 text-white hover:bg-slate-800'
            onClick={() => window.location.reload()}>
            <RotateCcw className='h-4 w-4' />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
