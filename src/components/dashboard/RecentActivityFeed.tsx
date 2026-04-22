'use client';

import { History } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { RecentActivityItem } from '@/types/dashboard';
import {
  getActivityColor,
  getRelativeTime,
} from '@/components/dashboard/utils';

export function RecentActivityFeed({
  data,
}: {
  data: RecentActivityItem[];
}) {
  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700'>
            <History className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Recent Activity
            </h2>
            <p className='text-md text-slate-500'>
              Latest platform events across organizations, assessments, and security.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {data.length ? (
          <div className='relative space-y-5 border-l border-slate-200 pl-6'>
            {data.slice(0, 15).map((activity) => (
              <div
                key={`${activity.type}-${activity.title}-${activity.timestamp}`}
                className='relative'>
                <span
                  className={`absolute -left-7.75 top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${getActivityColor(
                    activity.type,
                  )}`}
                />
                <div className='flex items-start gap-3'>
                  <span className='mt-0.5 text-base'>{activity.icon}</span>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-300'>
                      {activity.title}
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      {activity.description}
                    </p>
                    <p className='mt-2 text-xs text-slate-400'>
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <p className='text-sm font-medium text-slate-300'>
              No activity yet. Start by adding an organization.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
