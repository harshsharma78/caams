'use client';

import { Activity } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AdminSystemErrorTrendPoint } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
} from '@/components/admin/utils';

export function SystemErrorTrendChart({
  data,
}: {
  data: AdminSystemErrorTrendPoint[];
}) {
  const hasData = data.some((item) => item.requests > 0 || item.errors > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/20 text-red-300'>
          <Activity className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>
            System Error Trend
          </h3>
          <p className='text-sm text-slate-400'>
            Hourly API request volume versus server errors over the last 24
            hours.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='System error trend chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <LineChart data={data}>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='hour'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                yAxisId='left'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Legend />
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='requests'
                stroke='#3B82F6'
                strokeWidth={2.5}
                dot={false}
                name='Requests'
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='errors'
                stroke='#EF4444'
                strokeWidth={2.5}
                dot={false}
                name='Errors'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No system logs recorded yet.
        </p>
      )}
    </div>
  );
}
