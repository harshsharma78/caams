'use client';

import { BarChart3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { ScoresByIndustryItem } from '@/types/dashboard';

const COLORS = ['#8B5CF6', '#7C3AED', '#6366F1', '#3B82F6', '#2563EB'];

export function AssessmentScoresByIndustry({
  data,
}: {
  data: ScoresByIndustryItem[];
}) {
  return (
    <Card className='overflow-hidden border-slate-200 bg-black shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600'>
            <BarChart3 className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Assessment Scores by Industry
            </h2>
            <p className='text-md text-slate-500'>
              Average readiness score and assessment volume across industries.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {data.length ? (
          <div
            className='h-75'
            aria-label='Assessment scores by industry chart'
            role='img'>
            <ResponsiveContainer
              width='100%'
              height={300}>
              <BarChart data={data}>
                <defs>
                  <linearGradient
                    id='industryScoreGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop
                      offset='0%'
                      stopColor='#8B5CF6'
                    />
                    <stop
                      offset='100%'
                      stopColor='#3B82F6'
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='#E2E8F0'
                />
                <XAxis
                  dataKey='industry'
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#dddddd' }}
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    background
                      : 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                  }}
                  formatter={(value, _name, item) => {
                    const numericValue =
                      typeof value === 'number' ? value : Number(value ?? 0);

                    return [
                      `${numericValue.toFixed(1)}%`,
                      `Avg Score | Assessments: ${item.payload.count}`,
                    ];
                  }}
                  labelFormatter={(label) => `Industry: ${label}`}
                />
                <Bar
                  dataKey='avgScore'
                  fill='url(#industryScoreGradient)'
                  radius={[10, 10, 0, 0]}>
                  <LabelList
                    dataKey='count'
                    position='top'
                    fill='#475569'
                    fontSize={12}
                  />
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-75 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <BarChart3 className='h-8 w-8 text-slate-300' />
            <p className='mt-3 text-sm font-medium text-slate-300'>
              No assessments recorded yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
