function Block({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl bg-slate-800/60 ${className}`} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className='space-y-6 rounded-3xl bg-[#0F1117] p-6 animate-pulse'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-3'>
          <Block className='h-4 w-40' />
          <Block className='h-10 w-72' />
          <Block className='h-4 w-96 max-w-full' />
        </div>
        <div className='flex gap-3'>
          <Block className='h-10 w-32' />
          <Block className='h-10 w-32' />
          <Block className='h-10 w-32' />
        </div>
      </div>

      <Block className='h-14 w-full rounded-lg' />

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 12 }).map((_, index) => (
          <Block
            key={index}
            className='h-36'
          />
        ))}
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className='space-y-4'>
          <Block className='h-px w-full rounded-none' />
          <Block className='h-6 w-56' />
          <Block className='h-4 w-72' />
          <div className='grid gap-6 xl:grid-cols-2'>
            <Block className='h-95' />
            <Block className='h-95' />
          </div>
        </div>
      ))}

      <Block className='h-105' />
      <div className='grid gap-6 xl:grid-cols-3'>
        <Block className='h-105 xl:col-span-2' />
        <Block className='h-105' />
      </div>
      <div className='grid gap-6 xl:grid-cols-3'>
        <Block className='h-105 xl:col-span-2' />
        <Block className='h-105' />
      </div>
    </div>
  );
}
