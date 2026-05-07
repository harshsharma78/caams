'use client';

import { Shield } from 'lucide-react';
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import type { AdminAuditTrendPoint } from '@/types/admin-dashboard';
import { ADMIN_CARD_CLASS, ADMIN_TOOLTIP_STYLE } from '@/components/admin/utils';

export function AuditEventsTrendChart({
  data,
}: {
  data: AdminAuditTrendPoint[];
}) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/30 text-blue-300'>
          <Shield className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Audit Events Trend</h3>
          <p className='text-sm text-slate-400'>
            Daily audit volume across the last 14 days.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75 min-w-35'
          aria-label='Audit events trend chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <ComposedChart data={data}>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='date'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Bar
                dataKey='count'
                fill='#3B82F6'
                radius={[8, 8, 0, 0]}
              />
              <Line
                type='monotone'
                dataKey='count'
                stroke='#94A3B8'
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='min-w-30 space-y-2 py-20 text-center text-sm text-slate-400'>
          No audit events recorded
        </p>
      )}
    </div>
  );
}
