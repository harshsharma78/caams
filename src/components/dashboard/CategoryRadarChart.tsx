'use client';

import { Radar as RadarIcon } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { CategoryAverageItem } from '@/types/dashboard';

const shortLabels: Record<string, string> = {
  'Infrastructure Readiness': 'Infrastructure',
  'Security & Compliance': 'Security',
  'Application Portability': 'Portability',
  'Data Management': 'Data',
  'Team & Skills Readiness': 'Team & Skills',
  'Cost & ROI Analysis': 'Cost & ROI',
};

export function CategoryRadarChart({
  data,
}: {
  data: CategoryAverageItem[];
}) {
  const hasData = data.some((item) => item.avgScore > 0);
  const chartData = data.map((item) => ({
    ...item,
    shortLabel: shortLabels[item.category] ?? item.category,
  }));

  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600'>
            <RadarIcon className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Category Radar
            </h2>
            <p className='text-md text-slate-500'>
              Cross-category readiness profile across all completed assessments.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {hasData ? (
          <div
            className='h-75'
            aria-label='Category averages radar chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <RadarChart data={chartData}>
                <PolarGrid stroke='#E2E8F0' />
                <PolarAngleAxis
                  dataKey='shortLabel'
                  tick={{ fill: '#475569', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <Radar
                  dataKey='avgScore'
                  stroke='#8B5CF6'
                  fill='#8B5CF6'
                  fillOpacity={0.5}
                  strokeWidth={2}
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
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <RadarIcon className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No category scores available yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
