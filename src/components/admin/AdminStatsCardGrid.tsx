'use client';

import type { ComponentType } from 'react';
import {
  AlertOctagon,
  BadgeDollarSign,
  Building2,
  Clock3,
  ShieldAlert,
  ShieldX,
  UserCog,
  UserPlus,
  Users,
  UserX,
  WalletCards,
  Wifi,
} from 'lucide-react';

import type { AdminDashboardData } from '@/types/admin-dashboard';
import {
  formatCount,
  formatCurrency,
  formatPercent,
  trendArrow,
  trendTone,
} from '@/components/admin/utils';

type StatItem = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  growth?: number;
  format?: 'count' | 'currency' | 'percent';
  pulse?: boolean;
};

function AdminStatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  const renderedValue =
    item.format === 'currency'
      ? formatCurrency(item.value)
      : item.format === 'percent'
        ? formatPercent(item.value)
        : formatCount(item.value);

  return (
    <div
      className={`rounded-xl border border-slate-700/60 border-l-4 bg-[#1A1D27] p-6 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${item.accent}`}>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm text-slate-400'>{item.label}</p>
          <p className='mt-3 text-2xl font-bold text-slate-100'>
            {renderedValue}
          </p>
        </div>
        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-100'>
          <Icon className='h-5 w-5' />
        </div>
      </div>
      <div className='mt-4 flex items-center justify-between gap-3'>
        <p className={`text-sm ${trendTone(item.growth ?? 0)}`}>
          {trendArrow(item.growth ?? 0)} {Math.abs(item.growth ?? 0).toFixed(1)}%
        </p>
        {item.pulse && item.value > 0 ? (
          <span className='h-2.5 w-2.5 animate-pulse rounded-full bg-red-500' />
        ) : null}
      </div>
      <p className='mt-2 text-xs text-slate-500'>
        {item.value === 0 ? 'No data yet' : 'Compared with last month'}
      </p>
    </div>
  );
}

export function AdminStatsCardGrid({ data }: { data: AdminDashboardData }) {
  const items: StatItem[] = [
    {
      label: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      accent: 'border-l-blue-500',
      growth: data.monthlyGrowth.users,
    },
    {
      label: 'Active Users (30d)',
      value: data.activeUsers,
      icon: UserCog,
      accent: 'border-l-emerald-500',
      growth: data.monthlyGrowth.users,
    },
    {
      label: 'New Users This Month',
      value: data.newUsersThisMonth,
      icon: UserPlus,
      accent: 'border-l-indigo-500',
      growth: data.monthlyGrowth.users,
    },
    {
      label: 'Pending Approvals',
      value: data.pendingApprovals,
      icon: Clock3,
      accent: 'border-l-amber-500',
      growth: 0,
      pulse: true,
    },
    {
      label: 'High Risk Orgs',
      value: data.highRiskOrganizations,
      icon: ShieldAlert,
      accent: 'border-l-red-500',
      growth: data.monthlyGrowth.organizations,
      pulse: true,
    },
    {
      label: 'Critical Alerts (7d)',
      value: data.criticalAlerts,
      icon: AlertOctagon,
      accent: 'border-l-rose-500',
      growth: 0,
      pulse: true,
    },
    {
      label: 'Failed Logins (24h)',
      value: data.failedLoginAttempts,
      icon: ShieldX,
      accent: 'border-l-orange-500',
      growth: 0,
    },
    {
      label: 'Suspended Users',
      value: data.suspendedUsers,
      icon: UserX,
      accent: 'border-l-slate-500',
      growth: 0,
    },
    {
      label: 'Monthly Revenue',
      value: data.totalMonthlyRevenue,
      icon: BadgeDollarSign,
      accent: 'border-l-cyan-500',
      growth: data.monthlyGrowth.revenue,
      format: 'currency',
    },
    {
      label: 'Total Organizations',
      value: data.totalOrganizations,
      icon: Building2,
      accent: 'border-l-violet-500',
      growth: data.monthlyGrowth.organizations,
    },
    {
      label: 'API Uptime %',
      value: data.systemHealth.uptime,
      icon: Wifi,
      accent: 'border-l-teal-500',
      growth: 0,
      format: 'percent',
    },
    {
      label: 'Churned Subscriptions',
      value: data.churnedSubscriptions,
      icon: WalletCards,
      accent: 'border-l-gray-500',
      growth: 0,
    },
  ];

  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      {items.map((item) => (
        <AdminStatCard
          key={item.label}
          item={item}
        />
      ))}
    </div>
  );
}
