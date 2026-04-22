'use client';

import { ShieldAlert } from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { RiskDistributionItem } from '@/types/dashboard';
import { formatRiskLabel, getRiskColor } from '@/components/dashboard/utils';

export function RiskDistributionChart({
  data,
}: {
  data: RiskDistributionItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600'>
            <ShieldAlert className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Risk Distribution
            </h2>
            <p className='text-md text-slate-500'>
              Security posture split by risk level across recorded checks.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {total > 0 ? (
          <div
            className='h-75'
            aria-label='Risk distribution chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey='count'
                  nameKey='level'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  isAnimationActive>
                  {data.map((entry) => (
                    <Cell
                      key={entry.level}
                      fill={getRiskColor(entry.level)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value, _name, item) => {
                    const numericValue =
                      typeof value === 'number' ? value : Number(value ?? 0);

                    return [
                      numericValue.toLocaleString(),
                      formatRiskLabel(item.payload.level),
                    ];
                  }}
                />
                <Legend
                  verticalAlign='bottom'
                  formatter={(value) => formatRiskLabel(value as never)}
                />
                <text
                  x='50%'
                  y='46%'
                  textAnchor='middle'
                  dominantBaseline='central'
                  className='fill-slate-900 text-2xl font-semibold'>
                  {total}
                </text>
                <text
                  x='50%'
                  y='56%'
                  textAnchor='middle'
                  dominantBaseline='central'
                  className='fill-slate-500 text-xs'>
                  security checks
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <ShieldAlert className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No security checks recorded yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
