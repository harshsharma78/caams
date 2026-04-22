'use client';

import type { ComponentType } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  ClipboardCheck,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

import type { DashboardStatsResponse } from '@/types/dashboard';
import { formatNumber, formatPercent } from '@/components/dashboard/utils';

type StatCardItem = {
  label: string;
  value: number;
  color: string;
  icon: ComponentType<{ className?: string }>;
  trend: number;
  isPercentage?: boolean;
  pulsing?: boolean;
};

function TrendIndicator({ value }: { value: number }) {
  const positive = value >= 0;
  const arrow = positive ? '▲' : '▼';

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        positive ? 'text-emerald-600' : 'text-rose-600'
      }`}>
      <span>{arrow}</span>
      <span>{Math.abs(value).toFixed(1)}%</span>
      <span className='text-slate-500'>vs last month</span>
    </div>
  );
}

function StatsCard({ item }: { item: StatCardItem }) {
  const Icon = item.icon;
  const isEmpty = item.value === 0;

  return (
    <div
      className='rounded-2xl border border-slate-200 bg-slate-800 p-6 shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'
      style={{ borderLeftWidth: 4, borderLeftColor: item.color }}>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-slate-500'>{item.label}</p>
          <p className='mt-3 text-3xl font-semibold text-slate-300'>
            {item.isPercentage
              ? formatPercent(item.value)
              : formatNumber(item.value)}
          </p>
        </div>
        <div
          className='flex h-11 w-11 items-center justify-center rounded-xl'
          style={{ backgroundColor: `${item.color}15`, color: item.color }}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
      <div className='mt-4 flex items-center justify-between gap-3'>
        <TrendIndicator value={item.trend} />
        {item.pulsing ? (
          <span className='relative flex h-3 w-3'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70' />
            <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500' />
          </span>
        ) : null}
      </div>
      <p className='mt-3 text-xs text-slate-400'>
        {isEmpty ? 'No data yet' : 'Real-time data from MongoDB'}
      </p>
    </div>
  );
}

export function StatsCardGrid({ data }: { data: DashboardStatsResponse }) {
  const items: StatCardItem[] = [
    {
      label: 'Total Organizations',
      value: data.totalOrganizations,
      color: '#3B82F6',
      icon: Building2,
      trend: data.monthlyGrowth.organizations,
    },
    {
      label: 'Total Assessments',
      value: data.totalAssessments,
      color: '#8B5CF6',
      icon: ClipboardCheck,
      trend: data.monthlyGrowth.assessments,
    },
    {
      label: 'Total Interviews',
      value: data.totalInterviews,
      color: '#F59E0B',
      icon: MessagesSquare,
      trend: data.monthlyGrowth.interviews,
    },
    {
      label: 'Total Case Studies',
      value: data.totalCaseStudies,
      color: '#10B981',
      icon: BookOpen,
      trend: data.monthlyGrowth.caseStudies,
    },
    {
      label: 'Total Security Checks',
      value: data.totalSecurityChecks,
      color: '#F43F5E',
      icon: ShieldCheck,
      trend: data.monthlyGrowth.securityChecks,
    },
    {
      label: 'Avg Readiness Score',
      value: data.averageReadinessScore,
      color: '#06B6D4',
      icon: Sparkles,
      trend: data.monthlyGrowth.averageReadinessScore,
      isPercentage: true,
    },
    {
      label: 'High Risk Alerts',
      value: data.highRiskAlerts,
      color: '#EF4444',
      icon: AlertTriangle,
      trend: data.monthlyGrowth.highRiskAlerts,
      pulsing: data.highRiskAlerts > 0,
    },
    {
      label: 'Assessments This Month',
      value: data.assessmentsThisMonth,
      color: '#6366F1',
      icon: Target,
      trend: data.monthlyGrowth.assessmentsThisMonth,
    },
  ];

  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      {items.map((item) => (
        <StatsCard
          key={item.label}
          item={item}
        />
      ))}
    </div>
  );
}
