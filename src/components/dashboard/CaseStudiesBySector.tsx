'use client';

import { FolderKanban } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { CaseStudiesBySectorItem } from '@/types/dashboard';

const palette = ['#0F766E', '#2563EB', '#7C3AED', '#0891B2', '#EA580C', '#16A34A'];

export function CaseStudiesBySector({
  data,
}: {
  data: CaseStudiesBySectorItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    fill: palette[index % palette.length],
  }));

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
            <FolderKanban className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Case Studies by Sector
            </h2>
            <p className='text-md text-slate-500'>
              Sector coverage of case study content in the CAAMS knowledge base.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {total > 0 ? (
          <div
            className='h-75'
            aria-label='Case studies by sector chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='#E2E8F0'
                />
                <XAxis
                  dataKey='sector'
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
                  formatter={(value) => {
                    const numericValue =
                      typeof value === 'number' ? value : Number(value ?? 0);

                    return [`${numericValue}`, 'Case Studies'];
                  }}
                  labelFormatter={(label) => `Sector: ${label}`}
                />
                <Bar
                  dataKey='count'
                  radius={[10, 10, 0, 0]}>
                  {chartData.map((item) => (
                    <Cell
                      key={item.sector}
                      fill={item.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <FolderKanban className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No case studies available yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
