'use client';

import { Shield } from 'lucide-react';
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
import type { SecurityCategoryBreakdownItem } from '@/types/dashboard';

function getComplianceColor(value: number) {
  if (value >= 80) {
    return '#22C55E';
  }

  if (value >= 50) {
    return '#EAB308';
  }

  return '#EF4444';
}

export function SecurityComplianceHeatmap({
  data,
}: {
  data: SecurityCategoryBreakdownItem[];
}) {
  const hasData = data.some((item) => item.avgCompliance > 0);

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600'>
            <Shield className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Security Compliance Breakdown
            </h2>
            <p className='text-md text-slate-500'>
              Average compliance percentage across the five security review
              domains.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {hasData ? (
          <div
            className='h-75'
            aria-label='Security compliance breakdown chart'
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
                  dataKey='category'
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => {
                    const numericValue =
                      typeof value === 'number' ? value : Number(value ?? 0);

                    return `${numericValue.toFixed(1)}%`;
                  }}
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Bar
                  dataKey='avgCompliance'
                  radius={[10, 10, 0, 0]}>
                  {data.map((item) => (
                    <Cell
                      key={item.category}
                      fill={getComplianceColor(item.avgCompliance)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <Shield className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No security compliance data yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
