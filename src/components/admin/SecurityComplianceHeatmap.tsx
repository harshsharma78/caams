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

import type { AdminSecurityCategoryBreakdownItem } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
} from '@/components/admin/utils';

function fillColor(value: number) {
  if (value >= 80) return '#22C55E';
  if (value >= 50) return '#EAB308';
  return '#EF4444';
}

export function SecurityComplianceHeatmap({
  data,
}: {
  data: AdminSecurityCategoryBreakdownItem[];
}) {
  const hasData = data.some((item) => item.avgCompliance > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/30 text-red-300'>
          <Shield className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>
            Security Compliance Breakdown
          </h3>
          <p className='text-sm text-slate-400'>
            Average compliance percentage for each security control category.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='Security compliance chart'
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
                dataKey='category'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Bar
                dataKey='avgCompliance'
                radius={[8, 8, 0, 0]}>
                {data.map((item) => (
                  <Cell
                    key={item.category}
                    fill={fillColor(item.avgCompliance)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No compliance data available.
        </p>
      )}
    </div>
  );
}
