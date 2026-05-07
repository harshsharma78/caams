'use client';

import { Users } from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { AdminRoleCount } from '@/types/admin-dashboard';
import {
  ADMIN_CARD_CLASS,
  ADMIN_TOOLTIP_STYLE,
  formatCount,
} from '@/components/admin/utils';

const roleColors: Record<string, string> = {
  admin: '#EF4444',
  assessor: '#3B82F6',
};

export function UsersByRoleChart({
  data,
  totalUsers,
}: {
  data: AdminRoleCount[];
  totalUsers: number;
}) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <div className={`${ADMIN_CARD_CLASS} border-red-800/40 bg-red-950/10`}>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/30 text-red-300'>
          <Users className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-slate-100'>
            Users by Role
          </h3>
          <p className='text-sm text-slate-400'>
            Distribution of platform access roles across all users.
          </p>
        </div>
      </div>
      {hasData ? (
        <div
          className='h-75'
          aria-label='Users by role chart'
          role='img'>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey='count'
                nameKey='role'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}>
                {data.map((item, index) => (
                  <Cell
                    key={`${item.role}-${index}`}
                    fill={
                      roleColors[item.role] ??
                      ['#8B5CF6', '#06B6D4', '#10B981'][index % 3]
                    }
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={ADMIN_TOOLTIP_STYLE} />
              <Legend
                verticalAlign='bottom'
                formatter={(value) => (
                  <span className='text-sm text-slate-400'>
                    {String(value)}
                  </span>
                )}
              />
              <text
                x='50%'
                y='48%'
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#F8FAFC'
                fontSize='28'
                fontWeight='700'>
                {formatCount(totalUsers)}
              </text>
              <text
                x='50%'
                y='58%'
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#94A3B8'
                fontSize='12'>
                total users
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='py-20 text-center text-sm text-slate-400'>
          No user role data available.
        </p>
      )}
    </div>
  );
}
