'use client';

import { BarChartBig } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AdminRevenueTrendPoint } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
  formatCurrency,
} from '@/components/admin/utils';

export function RevenueTrendChart({
  data,
}: {
  data: AdminRevenueTrendPoint[];
}) {
  const hasData = data.some((item) => item.revenue > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-900/30 text-cyan-300'>
          <BarChartBig className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Revenue Trend</h3>
          <p className='text-sm text-slate-400'>
            Monthly subscription revenue across the last 12 months.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-[300px]'
          aria-label='Revenue trend chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id='admin-revenue-trend'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
                  <stop
                    offset='0%'
                    stopColor='#06B6D4'
                    stopOpacity={0.45}
                  />
                  <stop
                    offset='100%'
                    stopColor='#06B6D4'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='month'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={ADMIN_TOOLTIP_STYLE}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='#06B6D4'
                strokeWidth={2.5}
                fill='url(#admin-revenue-trend)'
                dot={{ fill: '#22D3EE', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No subscription revenue recorded yet.
        </p>
      )}
    </div>
  );
}
