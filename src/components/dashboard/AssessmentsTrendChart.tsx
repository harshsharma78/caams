'use client';

import { Activity } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { AssessmentsTrendItem } from '@/types/dashboard';

export function AssessmentsTrendChart({
  data,
}: {
  data: AssessmentsTrendItem[];
}) {
  const populatedPoints = data.filter((item) => item.count > 0).length;

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
            <Activity className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Assessments Trend
            </h2>
            <p className='text-md text-slate-500'>
              Weekly assessment volume for the last twelve weeks.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {populatedPoints >= 2 ? (
          <div
            className='h-75'
            aria-label='Assessments trend chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id='assessmentsTrendFill'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop
                      offset='0%'
                      stopColor='#3B82F6'
                      stopOpacity={0.35}
                    />
                    <stop
                      offset='100%'
                      stopColor='#3B82F6'
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='#E2E8F0'
                />
                <XAxis
                  dataKey='week'
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
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#2563EB'
                  strokeWidth={3}
                  fill='url(#assessmentsTrendFill)'
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#1D4ED8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <Activity className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              Need more data to show trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
