function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-600 bg-black p-6 shadow-sm ${className}`}>
      <div className='h-4 w-32 rounded bg-slate-600' />
      <div className='mt-4 h-10 w-24 rounded bg-slate-600' />
      <div className='mt-3 h-3 w-40 rounded bg-slate-600' />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-6 animate-pulse'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-3'>
          <div className='h-9 w-44 rounded bg-slate-600' />
          <div className='h-4 w-80 max-w-full rounded bg-slate-400' />
        </div>
        <div className='flex gap-3'>
          <div className='h-10 w-32 rounded bg-slate-600' />
          <div className='h-10 w-36 rounded bg-slate-600' />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className='border-t border-slate-600 pt-6'>
        <div className='grid gap-6 xl:grid-cols-3'>
          <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm xl:col-span-2'>
            <div className='h-5 w-52 rounded bg-slate-600' />
            <div className='mt-2 h-4 w-72 rounded bg-slate-400' />
            <div className='mt-6 h-75 rounded-xl bg-slate-400' />
          </div>
          <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm'>
            <div className='h-5 w-40 rounded bg-slate-600' />
            <div className='mt-2 h-4 w-48 rounded bg-slate-400' />
            <div className='mt-6 h-75 rounded-xl bg-slate-400' />
          </div>
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='border-t border-slate-600 pt-6'>
          <div className='grid gap-6 xl:grid-cols-2'>
            <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm'>
              <div className='h-5 w-48 rounded bg-slate-600' />
              <div className='mt-2 h-4 w-60 rounded bg-slate-400' />
              <div className='mt-6 h-75 rounded-xl bg-slate-400' />
            </div>
            <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm'>
              <div className='h-5 w-40 rounded bg-slate-600' />
              <div className='mt-2 h-4 w-56 rounded bg-slate-400' />
              <div className='mt-6 h-75 rounded-xl bg-slate-400' />
            </div>
          </div>
        </div>
      ))}

      <div className='border-t border-slate-600 pt-6'>
        <div className='grid gap-6 xl:grid-cols-3'>
          <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm xl:col-span-2'>
            <div className='h-5 w-44 rounded bg-slate-600' />
            <div className='mt-2 h-4 w-64 rounded bg-slate-400' />
            <div className='mt-6 space-y-3'>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className='h-12 rounded-xl bg-slate-400'
                />
              ))}
            </div>
          </div>
          <div className='rounded-2xl border border-slate-600 bg-black p-6 shadow-sm'>
            <div className='h-5 w-40 rounded bg-slate-600' />
            <div className='mt-2 h-4 w-52 rounded bg-slate-400' />
            <div className='mt-6 space-y-4'>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className='h-10 rounded-xl bg-slate-400'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
