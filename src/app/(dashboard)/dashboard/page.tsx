import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { BarChart3, LayoutDashboard } from 'lucide-react';

import { AssessmentScoresByIndustry } from '@/components/dashboard/AssessmentScoresByIndustry';
import { AssessmentsTrendChart } from '@/components/dashboard/AssessmentsTrendChart';
import { CaseStudiesBySector } from '@/components/dashboard/CaseStudiesBySector';
import { CategoryRadarChart } from '@/components/dashboard/CategoryRadarChart';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { DashboardErrorState } from '@/components/dashboard/DashboardErrorState';
import { DashboardWelcomeState } from '@/components/dashboard/DashboardWelcomeState';
import { InterviewsMonthlyChart } from '@/components/dashboard/InterviewsMonthlyChart';
import { OrgSizeDistribution } from '@/components/dashboard/OrgSizeDistribution';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { SecurityComplianceHeatmap } from '@/components/dashboard/SecurityComplianceHeatmap';
import { StatsCardGrid } from '@/components/dashboard/StatsCardGrid';
import { TopOrganizationsTable } from '@/components/dashboard/TopOrganizationsTable';
import type { DashboardStatsResponse } from '@/types/dashboard';

export const metadata: Metadata = {
  title: 'CAAMS | Dashboard',
};

export const dynamic = 'force-dynamic';

function SectionDivider() {
  return <div className='border-t border-slate-200 pt-6' />;
}

async function getDashboardData() {
  const headerStore = await headers();
  const host =
    headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? '';
  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        cookie: headerStore.get('cookie') ?? '',
      },
    });

    if (!response.ok) {
      return {
        error: true,
      } as const;
    }

    const data = (await response.json()) as DashboardStatsResponse;

    return {
      error: false,
      data,
    } as const;
  } catch {
    return {
      error: true,
    } as const;
  }
}

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (result.error) {
    return <DashboardErrorState />;
  }

  const { data } = result;
  const allCollectionsEmpty =
    data.totalOrganizations === 0 &&
    data.totalAssessments === 0 &&
    data.totalInterviews === 0 &&
    data.totalCaseStudies === 0 &&
    data.totalSecurityChecks === 0;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white'>
              <LayoutDashboard className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-3xl font-semibold tracking-tight text-slate-300'>
                Dashboard
              </h1>
              <p className='text-sm text-slate-500'>
                Overview of cloud adoption analytics
              </p>
            </div>
          </div>
          <div className='inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-black px-3 py-1 text-xs font-medium text-slate-300 shadow-sm'>
            <BarChart3 className='h-3.5 w-3.5' />
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
        <DashboardActions />
      </div>

      {allCollectionsEmpty ? (
        <DashboardWelcomeState />
      ) : (
        <>
          <StatsCardGrid data={data} />

          <SectionDivider />
          <div className='grid gap-6 xl:grid-cols-3'>
            <div className='min-w-0 xl:col-span-2'>
              <AssessmentScoresByIndustry data={data.scoresByIndustry} />
            </div>
            <div className='min-w-0'>
              <RiskDistributionChart data={data.riskDistribution} />
            </div>
          </div>

          <SectionDivider />
          <div className='grid gap-6 xl:grid-cols-2'>
            <div className='min-w-0'>
              <AssessmentsTrendChart data={data.assessmentsTrend} />
            </div>
            <div className='min-w-0'>
              <CategoryRadarChart data={data.categoryAverages} />
            </div>
          </div>

          <SectionDivider />
          <div className='grid gap-6 xl:grid-cols-2'>
            <div className='min-w-0'>
              <OrgSizeDistribution data={data.orgSizeDistribution} />
            </div>
            <div className='min-w-0'>
              <CaseStudiesBySector data={data.caseStudiesBySector} />
            </div>
          </div>

          <SectionDivider />
          <div className='grid gap-6 xl:grid-cols-2'>
            <div className='min-w-0'>
              <SecurityComplianceHeatmap
                data={data.securityCategoryBreakdown}
              />
            </div>
            <div className='min-w-0'>
              <InterviewsMonthlyChart data={data.interviewsByMonth} />
            </div>
          </div>

          <SectionDivider />
          <div className='grid gap-6 xl:grid-cols-3'>
            <div className='min-w-0 xl:col-span-2'>
              <TopOrganizationsTable data={data.topOrganizations} />
            </div>
            <div className='min-w-0'>
              <RecentActivityFeed data={data.recentActivity} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
