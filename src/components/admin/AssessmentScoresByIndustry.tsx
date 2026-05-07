'use client';

import { BarChart3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AdminScoresByIndustryItem } from '@/types/admin-dashboard';
import { ADMIN_CARD_CLASS, ADMIN_TOOLTIP_STYLE } from '@/components/admin/utils';

export function AssessmentScoresByIndustry({
  data,
}: {
  data: AdminScoresByIndustryItem[];
}) {
  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-900/30 text-violet-300'>
          <BarChart3 className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>
            Assessment Scores by Industry
          </h3>
          <p className='text-sm text-slate-400'>
            Average readiness scores grouped by organization industry.
          </p>
        </div>
      </div>
      {data.length ? (
        <div
          className='h-75'
          aria-label='Assessment scores by industry chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <BarChart data={data}>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='industry'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Bar
                dataKey='avgScore'
                fill='#8B5CF6'
                radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey='count'
                  position='top'
                  fill='#94A3B8'
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No assessments recorded yet.
        </p>
      )}
    </div>
  );
}
