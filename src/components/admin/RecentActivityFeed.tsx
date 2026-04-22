'use client';

import { History } from 'lucide-react';

import type { AdminRecentActivityItem } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  recentActivityTone,
  relativeTime,
} from '@/components/admin/utils';

export function RecentActivityFeed({
  data,
}: {
  data: AdminRecentActivityItem[];
}) {
  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-100'>
          <History className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Recent Activity</h3>
          <p className='text-sm text-slate-400'>
            Cross-platform activity feed spanning users, orgs, audit, and assessments.
          </p>
        </div>
      </div>
      {data.length ? (
        <div className='space-y-3'>
          {data.map((item, index) => (
            <div
              key={`${item.type}-${item.timestamp}-${index}`}
              className={`rounded-lg border p-4 ${recentActivityTone(item)}`}>
              <div className='flex items-start gap-3'>
                <span className='text-base'>{item.icon}</span>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-slate-200'>{item.title}</p>
                  <p className='mt-1 text-sm text-slate-400'>{item.description}</p>
                  <p className='mt-2 text-xs text-slate-500'>
                    {relativeTime(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='py-10 text-sm text-slate-500'>No recent activity yet.</p>
      )}
    </div>
  );
}
