import { Spinner } from '@/components/ui/Spinner';

export default function DashboardLoading() {
  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <div className='inline-flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400'>
        <Spinner />
        Loading workspace...
      </div>
    </div>
  );
}
