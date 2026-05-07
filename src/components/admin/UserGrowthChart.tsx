'use client';

import { UserPlus } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AdminWeekCount } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
} from '@/components/admin/utils';

export function UserGrowthChart({ data }: { data: AdminWeekCount[] }) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-900/40 text-indigo-300'>
          <UserPlus className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>User Growth</h3>
          <p className='text-sm text-slate-400'>
            New user registrations per week over the last 12 weeks.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='User growth chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id='admin-user-growth'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
                  <stop
                    offset='0%'
                    stopColor='#6366F1'
                    stopOpacity={0.45}
                  />
                  <stop
                    offset='100%'
                    stopColor='#6366F1'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='week'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Area
                type='monotone'
                dataKey='count'
                stroke='#6366F1'
                fill='url(#admin-user-growth)'
                strokeWidth={2.5}
                dot={{ fill: '#818CF8', r: 4 }}
                activeDot={{ r: 6, fill: '#A5B4FC' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No user registrations recorded yet.
        </p>
      )}
    </div>
  );
}
