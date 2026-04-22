'use client';

import { ScrollText } from 'lucide-react';

import type { AdminRecentAuditLog } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  relativeTime,
  severityColor,
} from '@/components/admin/utils';

export function AuditLogFeed({
  data,
}: {
  data: AdminRecentAuditLog[];
}) {
  return (
    <div
      id='audit-log'
      className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-100'>
            <ScrollText className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-slate-100'>Audit Log</h3>
            <p className='text-sm text-slate-400'>
              Recent platform audit events with severity context.
            </p>
          </div>
        </div>
        <span className='rounded-full border border-red-700 bg-red-900/60 px-2 py-0.5 text-xs text-red-400 animate-pulse'>
          LIVE
        </span>
      </div>
      {data.length ? (
        <div className='space-y-4 border-l border-slate-700 pl-6'>
          {data.map((item, index) => (
            <div
              key={`${item.user}-${item.action}-${item.timestamp}-${index}`}
              className={`relative rounded-lg p-4 ${
                item.severity === 'critical'
                  ? 'border-l-2 border-red-500 bg-red-950/30'
                  : item.severity === 'warning'
                    ? 'border-l-2 border-amber-600 bg-amber-950/20'
                    : ''
              }`}>
              <span
                className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full ${severityColor(
                  item.severity,
                )} ${item.severity === 'critical' ? 'animate-pulse' : ''}`}
              />
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium text-slate-200'>{item.user}</span>
                <span className='rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400'>
                  {item.action}
                </span>
              </div>
              <p className='mt-2 text-xs text-slate-500'>{item.resource || 'System resource'}</p>
              <p className='mt-1 font-mono text-xs text-slate-600'>{item.ip || 'unknown-ip'}</p>
              <p className='mt-2 text-xs text-slate-600'>{relativeTime(item.timestamp)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className='py-10 text-sm text-slate-500'>No audit events yet.</p>
      )}
    </div>
  );
}
