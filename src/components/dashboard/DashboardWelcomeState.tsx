import Link from 'next/link';
import { ArrowRight, Building2, ClipboardList, MessagesSquare } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export function DashboardWelcomeState() {
  return (
    <div className='rounded-2xl border border-slate-600 bg-black p-10 shadow-sm'>
      <div className='mx-auto flex max-w-2xl flex-col items-center text-center'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-sky-400 text-4xl'>
          ☁️
        </div>
        <h2 className='mt-5 text-3xl font-semibold text-slate-300'>
          Welcome to CAAMS
        </h2>
        <p className='mt-3 text-md text-slate-600'>
          Get started by adding your first organization and recording the first
          assessment, interview, and security review.
        </p>
        <div className='mt-8 grid w-full gap-3 md:grid-cols-3'>
          <Button
            asChild
            fullWidth
            className='h-12 bg-slate-900 text-white hover:bg-slate-800'>
            <Link href='/organizations/new'>
              <Building2 className='h-4 w-4' />
              Add Organization
            </Link>
          </Button>
          <Button
            asChild
            fullWidth
            variant='outline'
            className='h-12 border-slate-200 bg-slate-900 text-white hover:bg-slate-800'>
            <Link href='/assessments/new'>
              <ClipboardList className='h-4 w-4' />
              Create Assessment
            </Link>
          </Button>
          <Button
            asChild
            fullWidth
            variant='outline'
            className='h-12 border-slate-200 bg-slate-900 text-white hover:bg-slate-800'>
            <Link href='/interviews/new'>
              <MessagesSquare className='h-4 w-4' />
              Record Interview
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
