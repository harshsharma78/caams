'use client';

import { ShieldAlert } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { AdminRiskDistributionItem } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
  riskColor,
} from '@/components/admin/utils';

export function RiskDistributionChart({
  data,
}: {
  data: AdminRiskDistributionItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/30 text-red-300'>
          <ShieldAlert className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Risk Distribution</h3>
          <p className='text-sm text-slate-400'>
            Security risk split across the latest assessment records.
          </p>
        </div>
      </div>
      {total > 0 ? (
        <div
          className='h-[300px]'
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
                paddingAngle={4}>
                {data.map((item) => (
                  <Cell
                    key={item.level}
                    fill={riskColor(item.level)}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Legend
                verticalAlign='bottom'
                formatter={(value) => (
                  <span className='text-sm text-slate-400'>{String(value)}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No security risk data available.
        </p>
      )}
    </div>
  );
}
