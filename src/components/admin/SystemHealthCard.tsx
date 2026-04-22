import { DatabaseZap } from 'lucide-react';

import type { AdminSystemHealth } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  formatCount,
  formatPercent,
} from '@/components/admin/utils';

function statusBadge(status: AdminSystemHealth['dbStatus']) {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-900/60 text-emerald-400 border border-emerald-700';
    case 'degraded':
      return 'bg-yellow-900/60 text-yellow-400 border border-yellow-700';
    default:
      return 'bg-red-900/60 text-red-400 border border-red-700';
  }
}

function metricTone(type: 'response' | 'error' | 'uptime', value: number) {
  if (type === 'response') {
    if (value < 100) return 'text-emerald-400';
    if (value <= 300) return 'text-yellow-400';
    return 'text-red-400';
  }

  if (type === 'error') {
    if (value < 1) return 'text-emerald-400';
    if (value <= 5) return 'text-yellow-400';
    return 'text-red-400';
  }

  if (value >= 99.9) return 'text-emerald-400';
  if (value >= 98) return 'text-yellow-400';
  return 'text-red-400';
}

export function SystemHealthCard({ data }: { data: AdminSystemHealth }) {
  return (
    <div className={`${ADMIN_CARD_CLASS} border-red-800/40 bg-red-950/10`}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-100'>
          <DatabaseZap className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>System Health</h3>
          <p className='text-sm text-slate-400'>
            Live database, API, and session health indicators.
          </p>
        </div>
      </div>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <p className='text-sm text-slate-400'>DB Status</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(data.dbStatus)}`}>
            {data.dbStatus}
          </span>
        </div>
        <div>
          <p className='text-sm text-slate-400'>Avg API Response Time</p>
          <p className={`mt-2 text-xl font-semibold ${metricTone('response', data.apiResponseTimeMs)}`}>
            {data.apiResponseTimeMs.toFixed(1)}ms
          </p>
        </div>
        <div>
          <p className='text-sm text-slate-400'>Error Rate</p>
          <p className={`mt-2 text-xl font-semibold ${metricTone('error', data.errorRate)}`}>
            {formatPercent(data.errorRate)}
          </p>
        </div>
        <div>
          <p className='text-sm text-slate-400'>Uptime</p>
          <p className={`mt-2 text-xl font-semibold ${metricTone('uptime', data.uptime)}`}>
            {formatPercent(data.uptime)}
          </p>
          <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-800'>
            <div
              className='h-full rounded-full bg-teal-500'
              style={{ width: `${Math.max(4, Math.min(data.uptime, 100))}%` }}
            />
          </div>
        </div>
        <div>
          <p className='text-sm text-slate-400'>Active Sessions</p>
          <p className='mt-2 text-xl font-semibold text-slate-100'>
            {formatCount(data.activeSessionCount)}
          </p>
        </div>
        <div>
          <p className='text-sm text-slate-400'>API Requests Today</p>
          <p className='mt-2 text-xl font-semibold text-slate-100'>
            {formatCount(data.totalApiRequests)}
          </p>
        </div>
      </div>
    </div>
  );
}
