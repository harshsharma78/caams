'use client';

import { CreditCard } from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { AdminSubscriptionBreakdownItem } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
  formatCurrency,
} from '@/components/admin/utils';

const colors: Record<string, string> = {
  free: '#64748B',
  starter: '#3B82F6',
  professional: '#8B5CF6',
  enterprise: '#10B981',
};

export function SubscriptionBreakdownChart({
  data,
  totalMonthlyRevenue,
}: {
  data: AdminSubscriptionBreakdownItem[];
  totalMonthlyRevenue: number;
}) {
  const hasData = data.some((item) => item.count > 0 || item.revenue > 0);

  return (
    <div className={ADMIN_CARD_CLASS}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-900/30 text-violet-300'>
          <CreditCard className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>
            Subscription Breakdown
          </h3>
          <p className='text-sm text-slate-400'>
            Plan mix across active platform subscriptions.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='Subscription breakdown chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey='revenue'
                nameKey='plan'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}>
                {data.map((item) => (
                  <Cell
                    key={item.plan}
                    fill={colors[item.plan] ?? '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={ADMIN_TOOLTIP_STYLE}
                formatter={(value, _name, item) => [
                  formatCurrency(Number(value)),
                  `${item.payload.plan} · ${item.payload.count} orgs`,
                ]}
              />
              <Legend
                verticalAlign='bottom'
                formatter={(value, entry) => {
                  const payload =
                    entry.payload as AdminSubscriptionBreakdownItem;
                  return (
                    <span className='text-sm text-slate-400'>
                      {String(value)} · {payload.count} ·{' '}
                      {formatCurrency(payload.revenue)}
                    </span>
                  );
                }}
              />
              <text
                x='50%'
                y='48%'
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#F8FAFC'
                fontSize='18'
                fontWeight='700'>
                {formatCurrency(totalMonthlyRevenue)}
              </text>
              <text
                x='50%'
                y='58%'
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#94A3B8'
                fontSize='12'>
                total MRR
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No subscription data available.
        </p>
      )}
    </div>
  );
}
