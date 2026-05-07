import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AlertTriangle, ShieldAlert } from 'lucide-react';

import { AdminDashboardActions } from '@/components/admin/AdminDashboardActions';
import { AdminStatsCardGrid } from '@/components/admin/AdminStatsCardGrid';
import { AssessmentScoresByIndustry } from '@/components/admin/AssessmentScoresByIndustry';
import { AuditEventsByTypeChart } from '@/components/admin/AuditEventsByTypeChart';
import { AuditEventsTrendChart } from '@/components/admin/AuditEventsTrendChart';
import { AuditLogFeed } from '@/components/admin/AuditLogFeed';
import { CategoryRadarChart } from '@/components/admin/CategoryRadarChart';
import { InactiveOrgsPanel } from '@/components/admin/InactiveOrgsPanel';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { RevenueTrendChart } from '@/components/admin/RevenueTrendChart';
import { RiskDistributionChart } from '@/components/admin/RiskDistributionChart';
import { SecurityComplianceHeatmap } from '@/components/admin/SecurityComplianceHeatmap';
import { SubscriptionBreakdownChart } from '@/components/admin/SubscriptionBreakdownChart';
import { SystemErrorTrendChart } from '@/components/admin/SystemErrorTrendChart';
import { SystemHealthCard } from '@/components/admin/SystemHealthCard';
import { TopOrganizationsOverview } from '@/components/admin/TopOrganizationsOverview';
import { UserGrowthChart } from '@/components/admin/UserGrowthChart';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UsersByRoleChart } from '@/components/admin/UsersByRoleChart';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';
import type { AdminDashboardData } from '@/types/admin-dashboard';

export const metadata: Metadata = {
  title: 'CAAMS | Admin Console',
};

export const dynamic = 'force-dynamic';

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className='text-xl font-semibold text-slate-100'>{title}</h2>
      <p className='mt-1 text-sm text-slate-400'>{subtitle}</p>
    </div>
  );
}

async function getAdminDashboardData() {
  const headerStore = await headers();
  const host =
    headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? '';
  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/admin/stats`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        cookie: headerStore.get('cookie') ?? '',
      },
    });

    if (response.status === 403) {
      return { forbidden: true } as const;
    }

    if (!response.ok) {
      return { error: true } as const;
    }

    return {
      error: false,
      forbidden: false,
      data: (await response.json()) as AdminDashboardData,
    } as const;
  } catch {
    return { error: true } as const;
  }
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard');
  }

  const result = await getAdminDashboardData();

  if ('forbidden' in result && result.forbidden) {
    redirect('/dashboard');
  }

  if ('error' in result && result.error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center rounded-3xl bg-[#0F1117] px-6 text-center'>
        <ShieldAlert className='h-12 w-12 text-red-500' />
        <h1 className='mt-4 text-2xl font-semibold text-slate-100'>
          Failed to load admin data
        </h1>
        <p className='mt-2 text-slate-400'>
          There was a problem fetching system data.
        </p>
        <a
          href='/admin'
          className='mt-6 rounded-lg bg-slate-800 px-6 py-2 text-slate-100 transition hover:bg-slate-700'>
          Retry
        </a>
      </div>
    );
  }

  const data = result.data;

  return (
    <div className='space-y-6 rounded-3xl bg-[#0F1117] p-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-3'>
          <p className='text-sm text-slate-500'>Dashboard / Admin Console</p>
          <div className='flex flex-wrap items-center gap-3'>
            <h1 className='text-3xl font-semibold text-slate-100'>
              Admin Console
            </h1>
            <span className='rounded-full border border-red-700 bg-red-900/60 px-2.5 py-1 text-xs font-semibold text-red-300'>
              ADMIN
            </span>
          </div>
          <p className='text-sm text-slate-400'>
            Platform-wide analytics, user management, and system oversight
          </p>
          <div className='inline-flex rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-500'>
            Last updated:{' '}
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(data.generatedAt))}
          </div>
        </div>
        <AdminDashboardActions data={data} />
      </div>

      {data.criticalAlerts > 0 ? (
        <div className='flex items-center gap-2 rounded-lg border border-red-700 bg-red-950/40 p-3 text-red-300'>
          <AlertTriangle className='h-4 w-4 shrink-0' />
          <span>{data.criticalAlerts.toLocaleString()} critical alerts require your
          attention</span>
        </div>
      ) : null}

      <AdminStatsCardGrid data={data} />

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='User & Access Analytics'
        subtitle='Registration, role distribution, and platform access patterns.'
      />
      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='min-w-0 xl:col-span-2'>
          <UserGrowthChart data={data.userGrowthTrend} />
        </div>
        <UsersByRoleChart
          data={data.usersByRole}
          totalUsers={data.totalUsers}
        />
      </div>

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='Audit & Security Events'
        subtitle='Operational security signals and high-level audit activity.'
      />
      <div className='grid gap-6 xl:grid-cols-2'>
        <div className='min-w-0'>
          <AuditEventsTrendChart data={data.auditTrend} />
        </div>
        <div className='min-w-0'>
          <AuditEventsByTypeChart data={data.auditEventsByType} />
        </div>
      </div>

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='System Health'
        subtitle='API reliability, database status, and live session footprint.'
      />
      <div className='grid gap-6 xl:grid-cols-2'>
        <div className='min-w-0'>
          <SystemErrorTrendChart data={data.systemErrorTrend} />
        </div>
        <div className='min-w-0'>
          <SystemHealthCard data={data.systemHealth} />
        </div>
      </div>

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='Billing & Subscriptions'
        subtitle='Recurring revenue, plan mix, and subscription health.'
      />
      <div className='grid gap-6 xl:grid-cols-2'>
        <div className='min-w-0'>
          <RevenueTrendChart data={data.revenueTrend} />
        </div>
        <div className='min-w-0'>
          <SubscriptionBreakdownChart
            data={data.subscriptionBreakdown}
            totalMonthlyRevenue={data.totalMonthlyRevenue}
          />
        </div>
      </div>

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='Cross-Platform Assessment Analytics'
        subtitle='Readiness, industry, and security performance across all organizations.'
      />
      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='min-w-0 xl:col-span-2'>
          <AssessmentScoresByIndustry data={data.scoresByIndustry} />
        </div>
        <RiskDistributionChart data={data.riskDistribution} />
      </div>
      <div className='grid gap-6 xl:grid-cols-2'>
        <div className='min-w-0'>
          <CategoryRadarChart data={data.categoryAverages} />
        </div>
        <div className='min-w-0'>
          <SecurityComplianceHeatmap
            data={data.securityCategoryBreakdown}
          />
        </div>
      </div>

      <div className='border-t border-slate-800 my-2' />
      <SectionHeader
        title='User Management'
        subtitle='Administrative role, status, and access review.'
      />
      <UserManagementTable
        users={data.topUsers}
        currentUserId={session.user.id}
      />

      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='min-w-0 xl:col-span-2'>
          <TopOrganizationsOverview data={data.topOrganizationsByActivity} />
        </div>
        <div className='min-w-0'>
          <InactiveOrgsPanel data={data.inactiveOrganizations} />
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='min-w-0 xl:col-span-2'>
          <AuditLogFeed data={data.recentAuditLogs} />
        </div>
        <div className='min-w-0'>
          <RecentActivityFeed data={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
