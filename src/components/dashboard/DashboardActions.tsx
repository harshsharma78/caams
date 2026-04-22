'use client';

import { Printer, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';

export function DashboardActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPrinting, setIsPrinting] = useState(false);

  return (
    <div
      data-dashboard-actions
      className='flex flex-wrap items-center gap-3 print:hidden'>
      <Button
        variant='outline'
        className='border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700'
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}>
        <RefreshCw
          className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
        />
        Refresh Data
      </Button>
      <Button
        variant='outline'
        className='border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700'
        onClick={() => {
          setIsPrinting(true);
          window.print();
          window.setTimeout(() => setIsPrinting(false), 500);
        }}>
        <Printer className={`h-4 w-4 ${isPrinting ? 'animate-pulse' : ''}`} />
        Print Dashboard
      </Button>
    </div>
  );
}
