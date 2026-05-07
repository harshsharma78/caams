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

import type { AdminCategoryAverageItem } from '@/types/admin-dashboard';
import { ADMIN_CARD_CLASS, ADMIN_TOOLTIP_STYLE } from '@/components/admin/utils';

export function CategoryRadarChart({
  data,
}: {
  data: AdminCategoryAverageItem[];
}) {
  const hasData = data.some((item) => item.avgScore > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-900/30 text-violet-300'>
          <RadarIcon className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Category Radar</h3>
          <p className='text-sm text-slate-400'>
            Readiness profile across the six assessment categories.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className="h-75"
          aria-label='Category radar chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke='#2D3148' />
              <PolarAngleAxis
                dataKey='category'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Radar
                dataKey='avgScore'
                stroke='#8B5CF6'
                fill='#8B5CF680'
                strokeWidth={2}
              />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No category readiness data available.
        </p>
      )}
    </div>
  );
}
