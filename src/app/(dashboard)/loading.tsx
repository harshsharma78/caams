export default function DashboardLoading() {
  return (
    <div className='space-y-8 animate-pulse'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-48 rounded bg-slate-200 dark:bg-slate-800' />
          <div className='h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800' />
        </div>
        <div className='h-10 w-32 rounded bg-slate-200 dark:bg-slate-800' />
      </div>
      
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
        <div className='mb-6 flex gap-4'>
          <div className='h-10 flex-1 rounded bg-slate-100 dark:bg-slate-900' />
          <div className='h-10 w-32 rounded bg-slate-100 dark:bg-slate-900' />
        </div>
        
        <div className='space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-slate-900'>
              <div className='h-12 w-full flex-1 rounded bg-slate-100 dark:bg-slate-900' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
