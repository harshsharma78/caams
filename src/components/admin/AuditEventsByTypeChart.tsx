'use client';

import {
  LabelList,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Fingerprint } from 'lucide-react';

import type { AdminAuditTypeCount } from '@/types/admin-dashboard';
import { ADMIN_CARD_CLASS, ADMIN_TOOLTIP_STYLE } from '@/components/admin/utils';

function barColor(type: string) {
  if (type.includes('LOGIN')) return '#22C55E';
  if (type.includes('DELETE')) return '#EF4444';
  if (type.includes('EXPORT')) return '#F59E0B';
  return '#3B82F6';
}

export function AuditEventsByTypeChart({
  data,
}: {
  data: AdminAuditTypeCount[];
}) {
  const hasData = data.length > 0;

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-100'>
          <Fingerprint className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>Audit Events by Type</h3>
          <p className='text-sm text-slate-400'>
            Most common audit actions across the platform.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='Audit events by type chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <BarChart
              data={data}
              layout='vertical'>
              <CartesianGrid
                stroke='#2D3148'
                strokeDasharray='3 3'
              />
              <XAxis
                type='number'
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                type='category'
                dataKey='type'
                width={90}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Bar
                dataKey='count'
                radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey='count'
                  position='right'
                  fill='#94A3B8'
                />
                {data.map((item) => (
                  <Cell
                    key={item.type}
                    fill={barColor(item.type)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No audit type data available.
        </p>
      )}
    </div>
  );
}
