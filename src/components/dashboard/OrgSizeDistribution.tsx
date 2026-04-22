'use client';

import { Building2 } from 'lucide-react';
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
import type { OrgSizeDistributionItem } from '@/types/dashboard';

const sizeLabels: Record<string, string> = {
  startup: 'Startup',
  sme: 'SME',
  enterprise: 'Enterprise',
};

const sizeColors: Record<string, string> = {
  startup: '#F59E0B',
  sme: '#3B82F6',
  enterprise: '#8B5CF6',
};

export function OrgSizeDistribution({
  data,
}: {
  data: OrgSizeDistributionItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item) => ({
    ...item,
    label: sizeLabels[item.size],
    fill: sizeColors[item.size],
  }));

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
            <Building2 className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Organization Size Distribution
            </h2>
            <p className='text-md text-slate-500'>
              Company portfolio mix by startup, SME, and enterprise size bands.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {total > 0 ? (
          <div
            className='h-75'
            aria-label='Organization size distribution chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <BarChart
                data={chartData}
                layout='vertical'>
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray='3 3'
                  stroke='#E2E8F0'
                />
                <XAxis
                  type='number'
                  allowDecimals={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type='category'
                  dataKey='label'
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
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
                  radius={[0, 10, 10, 0]}>
                  {chartData.map((item) => (
                    <Cell
                      key={item.size}
                      fill={item.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <Building2 className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No organizations recorded yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
