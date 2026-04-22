'use client';

import { Mic2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { InterviewsByMonthItem } from '@/types/dashboard';

export function InterviewsMonthlyChart({
  data,
}: {
  data: InterviewsByMonthItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600'>
            <Mic2 className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Interviews by Month
            </h2>
            <p className='text-md text-slate-500'>
              Monthly interview volume over the last six months.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {total > 0 ? (
          <div
            className='h-75'
            aria-label='Interviews by month chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <BarChart data={data}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='#E2E8F0'
                />
                <XAxis
                  dataKey='month'
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Bar
                  dataKey='count'
                  fill='#F59E0B'
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <Mic2 className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No interviews recorded yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
